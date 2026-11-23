/** Small 3D vector and matrix helpers. Body axes: X forward, Y up, Z right; angles in radians. */
export type Vec3 = [number, number, number];
export type Mat3 = [Vec3, Vec3, Vec3];

export const DEG = Math.PI / 180;

export const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const dot = (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const norm = (a: Vec3): Vec3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};

/** Matrix product a·b. */
export const mul = (a: Mat3, b: Mat3): Mat3 =>
  a.map((r) => [0, 1, 2].map((j) => r[0] * b[0][j] + r[1] * b[1][j] + r[2] * b[2][j]) as Vec3) as Mat3;

/** Matrix times vector. */
export const apply = (m: Mat3, v: Vec3): Vec3 => [
  m[0][0] * v[0] + m[0][1] * v[1] + m[0][2] * v[2],
  m[1][0] * v[0] + m[1][1] * v[1] + m[1][2] * v[2],
  m[2][0] * v[0] + m[2][1] * v[1] + m[2][2] * v[2],
];

/** Rotation about the up axis (heading). */
export const rotY = (a: number): Mat3 => {
  const c = Math.cos(a), s = Math.sin(a);
  return [[c, 0, s], [0, 1, 0], [-s, 0, c]];
};
/** Rotation about the right axis seen as pitch of the nose (positive = nose up). */
export const rotZ = (a: number): Mat3 => {
  const c = Math.cos(a), s = Math.sin(a);
  return [[c, -s, 0], [s, c, 0], [0, 0, 1]];
};
/** Rotation about the nose axis (roll; positive = right wing down). */
export const rotX = (a: number): Mat3 => {
  const c = Math.cos(a), s = Math.sin(a);
  return [[1, 0, 0], [0, c, -s], [0, s, c]];
};
/** Rotation about the up axis in the opposite sense of `rotY` (used for the yaw wobble). */
export const rotYInv = (a: number): Mat3 => rotY(-a);
