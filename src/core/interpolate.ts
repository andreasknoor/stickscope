/** Time series interpolation. Keyframes are arrays `[t, ...values]` with ascending t. */

/** Monotone cubic (PCHIP) interpolation of column `col`: no overshoot between keyframes. Used for position and attitude. */
export function pchip(keys: readonly (readonly number[])[], col: number): (x: number) => number {
  const t = keys.map((k) => k[0]);
  const y = keys.map((k) => k[col]);
  const n = t.length;
  const h: number[] = [];
  const d: number[] = [];
  const m: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    h[i] = t[i + 1] - t[i];
    d[i] = (y[i + 1] - y[i]) / h[i];
  }
  m[0] = d[0] || 0;
  m[n - 1] = d[n - 2] || 0;
  for (let i = 1; i < n - 1; i++) {
    if (d[i - 1] * d[i] <= 0) m[i] = 0;
    else {
      const w1 = 2 * h[i] + h[i - 1];
      const w2 = h[i] + 2 * h[i - 1];
      m[i] = (w1 + w2) / (w1 / d[i - 1] + w2 / d[i]);
    }
  }
  return (x) => {
    if (x <= t[0]) return y[0];
    if (x >= t[n - 1]) return y[n - 1];
    let i = 0;
    while (x > t[i + 1]) i++;
    const s = (x - t[i]) / h[i];
    const s2 = s * s;
    const s3 = s2 * s;
    return (2 * s3 - 3 * s2 + 1) * y[i] + (s3 - 2 * s2 + s) * h[i] * m[i] + (-2 * s3 + 3 * s2) * y[i + 1] + (s3 - s2) * h[i] * m[i + 1];
  };
}

/** Smoothstep interpolation of column `col`: eases in and out between keyframes. Used for sticks. */
export function smoothstep(keys: readonly (readonly number[])[], col: number): (x: number) => number {
  return (x) => {
    if (x <= keys[0][0]) return keys[0][col];
    for (let i = 0; i < keys.length - 1; i++) {
      const a = keys[i];
      const b = keys[i + 1];
      if (x <= b[0]) {
        let s = (x - a[0]) / (b[0] - a[0]);
        s = s * s * (3 - 2 * s);
        return a[col] + (b[col] - a[col]) * s;
      }
    }
    return keys[keys.length - 1][col];
  };
}
