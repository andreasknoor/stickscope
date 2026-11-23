"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { viewerSide, type ViewerSide } from "../core/maneuvers/facing.ts";
import { phaseIndexAt } from "../core/maneuvers/phases.ts";
import type { Maneuver } from "../core/maneuvers/types.ts";
import { Player, SPEEDS, type Speed } from "../core/player.ts";
import { readoutsFor, type Mode, type Readout } from "../core/model/sticks.ts";
import { CssColors, watchColorScheme } from "../render/canvas.ts";
import { drawModelView, orbitFromPilot, viewEye, type CameraMode, type Orbit } from "../render/modelview.ts";
import { drawOverview } from "../render/overview.ts";
import { SIDE_DOT, MODEL } from "../render/palette.ts";
import { drawSchematic } from "../render/schematic.ts";
import { drawSticks, TRAIL_FRAMES, type StickSample } from "../render/sticks.ts";
import { drawStrip, type StripHit } from "../render/strip.ts";
import { Icon } from "../theme/Icon.tsx";
import { IllustrationNotes, PhaseCard } from "./Instructions.tsx";
import { MotorSound } from "./motorSound.ts";
import { settingsStore } from "./settings.ts";

const SPEED_LABEL: Record<Speed, string> = { 0.25: "¼×", 0.5: "½×", 1: "1×" };

interface Props {
  maneuver: Maneuver;
  mode: Mode;
  onMode: (m: Mode) => void;
}

/** The trainer for one figure: 3D view, transmitter, playback, strip, flight path and instructions, all on one clock. */
export function Trainer({ maneuver, mode, onMode }: Props) {
  const t = useTranslations();
  const { miniOpen, schematicOpen } = useSyncExternalStore(settingsStore.subscribe, settingsStore.getSnapshot, settingsStore.getServerSnapshot);
  const tRef = useRef(t);
  const modeRef = useRef(mode);
  const miniRefOpen = useRef(miniOpen);
  const schematicRefOpen = useRef(schematicOpen);
  useEffect(() => {
    tRef.current = t;
    modeRef.current = mode;
    miniRefOpen.current = miniOpen;
    schematicRefOpen.current = schematicOpen;
  });

  const wrapRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const cvRef = useRef<HTMLCanvasElement>(null);
  const rsRef = useRef<HTMLCanvasElement>(null);
  const scRef = useRef<HTMLCanvasElement>(null);
  const ocRef = useRef<HTMLCanvasElement>(null);
  const miniRef = useRef<HTMLCanvasElement>(null);
  const skRef = useRef<HTMLCanvasElement>(null);
  const tlRef = useRef<HTMLInputElement>(null);

  const player = useRef<Player | null>(null);
  const cam = useRef<CameraMode>("pilot");
  const orbit = useRef<Orbit>({ az: -90, el: 15 });
  const trail = useRef<StickSample[]>([]);
  const hits = useRef<StripHit[]>([]);
  const dragging = useRef<[number, number] | null>(null);
  const scrubbing = useRef(false);
  const reduceMotion = useRef(false);
  const sound = useRef<MotorSound | null>(null);

  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState<Speed>(0.5);
  const [loop, setLoop] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [camMode, setCamMode] = useState<CameraMode>("pilot");
  const [phase, setPhase] = useState(0);
  const [side, setSide] = useState<ViewerSide>("side");
  const [readouts, setReadouts] = useState<[string, string, string, string]>(["", "", "", ""]);

  // One player per figure. Under reduced motion it starts paused.
  useEffect(() => {
    reduceMotion.current = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const p = new Player(maneuver, !reduceMotion.current);
    p.speed = 0.5;
    player.current = p;
    trail.current = [];
    setPlaying(p.playing);
    setSpeed(0.5);
    setLoop(false);
    setPhase(0);
    return () => {
      player.current = null;
    };
  }, [maneuver]);

  useEffect(() => {
    trail.current = [];
  }, [mode]);

  // The motor sound stops when the trainer is left.
  useEffect(() => () => {
    sound.current?.dispose();
    sound.current = null;
  }, []);

  const fmt = useCallback((r: Readout): string => {
    const tt = tRef.current;
    if (r.kind === "throttle") return tt("transmitter.throttle", { word: tt(`throttleWord.${r.word}`) });
    if (!r.dir) return tt(`transmitter.${r.kind}Neutral`);
    return tt(`transmitter.${r.kind}`, { dir: tt(`dir.${r.dir}`), amount: tt(`amount.${r.amount}`) });
  }, []);

  // The animation loop: runs only while the component is on screen and the tab is visible.
  useEffect(() => {
    const colors = new CssColors();
    let themeVersion = 0;
    const stopWatch = watchColorScheme(() => {
      colors.reset();
      themeVersion++;
    });
    let raf = 0;
    let visible = true;
    let last = performance.now();
    let shownPhase = -1;
    let shownSide: ViewerSide | null = null;
    let shownReadouts = "";
    let stripKey = "";

    const frame = (nowMs: number) => {
      raf = 0;
      if (!visible || document.hidden || !player.current) return;
      const p = player.current;
      const dt = Math.min(0.1, (nowMs - last) / 1000);
      last = nowMs;
      const tt = tRef.current;
      const m = p.maneuver;
      const md = modeRef.current;
      p.tick(dt);
      const f = p.frame(dt);
      sound.current?.update(f.state.thr, p.playing);
      const now = nowMs / 1000;
      const deflect = colors.rgb("--deflect");

      if (cvRef.current) drawModelView(cvRef.current, f.state, f.glow, cam.current, orbit.current, colors, now);
      if (rsRef.current && schematicRefOpen.current) drawSchematic(rsRef.current, f.state, f.glow, deflect, { title: tt("schematic.title"), neutral: tt("schematic.neutral"), full: tt("schematic.full") });
      if (scRef.current) {
        const values = { rudder: f.state.rud, throttle: f.state.thr, aileron: f.state.ail, elevator: f.state.elev };
        const top = md === 2 ? [tt("transmitter.throttleTop"), tt("transmitter.throttleBottom")] : [tt("transmitter.elevatorTop"), tt("transmitter.elevatorBottom")];
        const right = md === 2 ? [tt("transmitter.elevatorTop"), tt("transmitter.elevatorBottom")] : [tt("transmitter.throttleTop"), tt("transmitter.throttleBottom")];
        const sample = drawSticks(scRef.current, values, md, trail.current, { left: top as [string, string], right: right as [string, string] });
        trail.current.push(sample);
        if (trail.current.length > TRAIL_FRAMES) trail.current.shift();
        const r = readoutsFor(values, md);
        const texts = [fmt(r.left[0]), fmt(r.left[1]), fmt(r.right[0]), fmt(r.right[1])] as [string, string, string, string];
        const joined = texts.join("|");
        if (joined !== shownReadouts) {
          shownReadouts = joined;
          setReadouts(texts);
        }
      }
      const pi = phaseIndexAt(m, f.t);
      if (ocRef.current) drawOverview(ocRef.current, m, f.t, f.glow, colors, now, { title: tt("overview.title"), modelFrac: 0.09 });
      if (miniRef.current && miniRefOpen.current) drawOverview(miniRef.current, m, f.t, f.glow, colors, now, { modelFrac: 0.16 });
      if (skRef.current) {
        const b = skRef.current.getBoundingClientRect();
        const key = `${m.id}|${pi}|${Math.round(b.width)}x${Math.round(b.height)}|${themeVersion}`;
        if (key !== stripKey) {
          stripKey = key;
          hits.current = drawStrip(skRef.current, m, f.t, colors, tt(`strip.${m.strip.view}`), now);
        }
      }
      if (pi !== shownPhase) {
        shownPhase = pi;
        setPhase(pi);
      }
      const eye = viewEye(cam.current, orbit.current, f.state.pos);
      const sd = viewerSide(f.state.R, f.state.pos, eye);
      if (sd !== shownSide) {
        shownSide = sd;
        setSide(sd);
      }
      if (tlRef.current && !scrubbing.current) tlRef.current.value = String(Math.round((f.t / m.duration) * 1000));
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (!raf && visible && !document.hidden) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    const io = new IntersectionObserver((entries) => {
      visible = entries[0]?.isIntersecting ?? true;
      if (visible) start();
      else sound.current?.update(0, false);
    });
    if (wrapRef.current) io.observe(wrapRef.current);
    const onVisibility = () => {
      if (document.hidden) sound.current?.update(0, false);
      start();
    };
    document.addEventListener("visibilitychange", onVisibility);
    start();
    return () => {
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      stopWatch();
      colors.dispose();
    };
  }, [maneuver, fmt]);

  const seek = (time: number) => {
    player.current?.seek(time);
    trail.current = [];
  };

  const setCamera = (c: CameraMode) => {
    cam.current = c;
    setCamMode(c);
    if (c === "orbit" && player.current) orbit.current = orbitFromPilot(player.current.frame(0).state.pos);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    if (cam.current !== "orbit") setCamera("orbit");
    dragging.current = [e.clientX, e.clientY];
    viewRef.current?.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragging.current;
    if (!d) return;
    orbit.current = { az: orbit.current.az - (e.clientX - d[0]) * 0.5, el: Math.max(-80, Math.min(80, orbit.current.el + (e.clientY - d[1]) * 0.4)) };
    dragging.current = [e.clientX, e.clientY];
  };
  const endDrag = () => {
    dragging.current = null;
  };

  const onStripClick = (e: React.MouseEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    let best: StripHit | null = null;
    let bd = Infinity;
    for (const h of hits.current) {
      const d = Math.hypot(h.x - x, h.y - y);
      if (d < bd) {
        bd = d;
        best = h;
      }
    }
    if (best && bd < 90) seek(best.t);
  };

  const m = maneuver;
  const badge = side === "top" ? { text: t("view.badgeTop"), color: MODEL.top[0] } : side === "bottom" ? { text: t("view.badgeBottom"), color: MODEL.bottom[0] } : { text: t("view.badgeSide"), color: SIDE_DOT };

  return (
    <div ref={wrapRef} className="trainer">
      <div className="main">
        <div className="view" ref={viewRef} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={endDrag} onPointerCancel={endDrag}>
          <canvas ref={cvRef} role="img" aria-label={t("view.aria")} />
          <div className="badge"><span className="sw" style={{ background: badge.color }} />{badge.text}</div>
          <div className="cam">
            <button aria-pressed={camMode === "pilot"} onClick={() => setCamera("pilot")}>{t("view.cameraPilot")}</button>
            <button aria-pressed={camMode === "orbit"} onClick={() => setCamera("orbit")}>{t("view.cameraOrbit")}</button>
          </div>
          <div className="viewhint">{camMode === "pilot" ? t("view.hintPilot") : t("view.hintOrbit")}</div>
          <div className="pip pip-rs">
            {schematicOpen && <canvas ref={rsRef} role="img" aria-label={t("schematic.aria")} />}
            <button className={schematicOpen ? "pipbtn" : "pipbtn closed"} aria-expanded={schematicOpen}
              aria-label={schematicOpen ? t("view.hideControls") : t("view.showControls")}
              onClick={() => settingsStore.update({ schematicOpen: !schematicOpen })}>
              {schematicOpen ? "–" : t("view.showControls")}
            </button>
          </div>
          <div className="pip pip-mini">
            {miniOpen && <canvas ref={miniRef} role="img" aria-label={t("overview.title")} />}
            <button className={miniOpen ? "pipbtn" : "pipbtn closed"} aria-expanded={miniOpen}
              aria-label={miniOpen ? t("view.hideOverview") : t("view.showOverview")}
              onClick={() => settingsStore.update({ miniOpen: !miniOpen })}>
              {miniOpen ? "–" : t("view.showOverview")}
            </button>
          </div>
        </div>
        <div className="tx" aria-label={t("transmitter.aria")}>
          <div className="txtop">
            <b>{t("transmitter.title")}</b>
            <div className="mode" role="group" aria-label={t("transmitter.mode")}>
              <button aria-pressed={mode === 2} onClick={() => onMode(2)}>{t("transmitter.mode2")}</button>
              <button aria-pressed={mode === 1} onClick={() => onMode(1)}>{t("transmitter.mode1")}</button>
            </div>
          </div>
          <div className="sticks"><canvas ref={scRef} /></div>
          <div className="vals">
            <div><span>{t("transmitter.left")}</span>{readouts[0]}<br />{readouts[1]}</div>
            <div><span>{t("transmitter.right")}</span>{readouts[2]}<br />{readouts[3]}</div>
          </div>
          <div className="txtop small">{t("transmitter.trail")}</div>
        </div>
      </div>

      <div className="ctrl">
        <button className="btn primary playbtn" onClick={() => {
          const p = player.current;
          if (!p) return;
          p.playing = !p.playing;
          setPlaying(p.playing);
        }}>
          <Icon name={playing ? "pause" : "play"} /> {playing ? t("playback.pause") : t("playback.play")}
        </button>
        <div className="seg" role="group" aria-label={t("playback.speed")}>
          {SPEEDS.map((s) => (
            <button key={s} aria-pressed={speed === s} onClick={() => {
              if (player.current) player.current.speed = s;
              setSpeed(s);
            }}>{SPEED_LABEL[s]}</button>
          ))}
        </div>
        <button className="btn" aria-pressed={soundOn} onClick={() => {
          if (sound.current) {
            sound.current.dispose();
            sound.current = null;
            setSoundOn(false);
          } else {
            sound.current = new MotorSound();
            setSoundOn(true);
          }
        }}>
          <Icon name={soundOn ? "sound" : "soundOff"} /> {t("playback.sound")}
        </button>
        <label className="lp">
          <input type="checkbox" checked={loop} onChange={(e) => {
            if (player.current) player.current.loopPhase = e.target.checked;
            setLoop(e.target.checked);
          }} /> {t("playback.loop")}
        </label>
      </div>
      <div className="tl">
        <input ref={tlRef} type="range" min={0} max={1000} defaultValue={0} aria-label={t("playback.timeline")}
          onChange={(e) => seek((+e.target.value / 1000) * m.duration)}
          onPointerDown={() => (scrubbing.current = true)} onPointerUp={() => (scrubbing.current = false)} onPointerCancel={() => (scrubbing.current = false)} onBlur={() => (scrubbing.current = false)} />
        <div className="marks">
          {m.phases.map((p, i) => (
            <span key={p.id} style={{ width: `${((p.end - p.start) / m.duration) * 100}%` }}>{i + 1} {t(`figures.${m.id}.phases.${p.id}.title`)}</span>
          ))}
        </div>
      </div>

      <IllustrationNotes maneuver={m} />

      <div className="card strip">
        <h2>{t("strip.title")}</h2>
        <p className="hint">{t("strip.hint")}</p>
        <div className="sk" onClick={onStripClick}><canvas ref={skRef} /></div>
      </div>

      <div className="card overview">
        <p className="idea">{t(`figures.${m.id}.idea`)}</p>
        <div className="ov"><canvas ref={ocRef} role="img" aria-label={t("overview.title")} /></div>
      </div>

      <div className="phases" role="group" aria-label={t("playback.phase")}>
        {m.phases.map((p, i) => (
          <button key={p.id} aria-pressed={phase === i} onClick={() => seek(p.start + 0.001)}>{i + 1} {t(`figures.${m.id}.phases.${p.id}.title`)}</button>
        ))}
      </div>
      <PhaseCard maneuver={m} index={Math.min(phase, m.phases.length - 1)} />
    </div>
  );
}
