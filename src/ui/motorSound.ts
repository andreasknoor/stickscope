import { motorParams } from "../core/model/motor.ts";

/**
 * An optional, synthesised motor sound that follows the throttle (Web Audio, no sound files).
 * It must be created inside a click handler, because browsers only start audio after a user action.
 */
export class MotorSound {
  private ctx: AudioContext;
  private master: GainNode;
  private filter: BiquadFilterNode;
  private low: OscillatorNode;
  private high: OscillatorNode;
  private disposed = false;

  constructor() {
    this.ctx = new AudioContext();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0;
    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = "lowpass";
    this.filter.Q.value = 1.2;
    this.low = this.ctx.createOscillator();
    this.low.type = "sawtooth";
    this.high = this.ctx.createOscillator();
    this.high.type = "square";
    const highGain = this.ctx.createGain();
    highGain.gain.value = 0.35;
    this.low.connect(this.filter);
    this.high.connect(highGain).connect(this.filter);
    this.filter.connect(this.master).connect(this.ctx.destination);
    this.low.start();
    this.high.start();
    this.ctx.resume().catch(() => {
      // Closed again before it could start.
    });
  }

  /** Follows the throttle (0..100); silent while `active` is false (paused, motor off, view hidden). */
  update(throttle: number, active: boolean): void {
    if (this.disposed) return;
    const p = motorParams(throttle, active);
    const now = this.ctx.currentTime;
    this.low.frequency.setTargetAtTime(p.frequency, now, 0.08);
    this.high.frequency.setTargetAtTime(p.frequency * 2.02, now, 0.08);
    this.filter.frequency.setTargetAtTime(p.cutoff, now, 0.08);
    this.master.gain.setTargetAtTime(p.gain, now, 0.06);
  }

  /** Fades out and releases the audio resources. Safe to call more than once. */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    try {
      this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.02);
    } catch {
      // The context is already closed.
    }
    window.setTimeout(() => {
      try {
        this.low.stop();
        this.high.stop();
        this.ctx.close().catch(() => {
          // Already closed.
        });
      } catch {
        // Already stopped or closed: nothing left to release.
      }
    }, 120);
  }
}
