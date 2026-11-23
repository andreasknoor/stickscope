import type { Vec3 } from "../math3.ts";

/** The pilot's eye as used by the renderer (render/camera.ts EYE); duplicated here so core stays independent of render. */
export const EYE_FOR_TESTS: Vec3 = [0, 1.7, 30];
