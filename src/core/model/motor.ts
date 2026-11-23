/** Parameters of the synthesised motor sound for a throttle position. Pure, so it can be tested without audio. */
export interface MotorParams {
  /** Hz, the fundamental of the sound. */
  frequency: number;
  /** Hz, low-pass cutoff: a higher throttle sounds brighter. */
  cutoff: number;
  /** 0..1 master gain; 0 when the motor is off or the animation is paused. */
  gain: number;
}

const IDLE_HZ = 55;
const FULL_HZ = 245;
const MAX_GAIN = 0.13;

export function motorParams(throttle: number, active: boolean): MotorParams {
  const level = Math.max(0, Math.min(1, throttle / 100));
  if (!active || throttle <= 1) return { frequency: IDLE_HZ, cutoff: 350, gain: 0 };
  return { frequency: IDLE_HZ + (FULL_HZ - IDLE_HZ) * level, cutoff: 350 + 1800 * level, gain: 0.03 + (MAX_GAIN - 0.03) * level };
}
