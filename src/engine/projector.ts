/**
 * Forward projector y = A x and its exact transpose x = A^T y.
 * Both go through the same rayPixelLengths traversal, so the adjoint
 * test holds to floating-point precision by construction.
 */
import { DETECTOR_COUNT } from './types';
import { detectorCoordinates, rayPixelLengths } from './rayGrid';
import { mulberry32 } from './random';

export function rowCount(anglesDeg: number[], detCount: number = DETECTOR_COUNT): number {
  return anglesDeg.length * detCount;
}

/** y_i = sum_j A_ij x_j (+ caller adds noise). */
export function forward(
  image: Float64Array,
  gridN: number,
  anglesDeg: number[],
  detCount: number = DETECTOR_COUNT,
): Float64Array {
  const coords = detectorCoordinates(detCount);
  const y = new Float64Array(anglesDeg.length * detCount);
  anglesDeg.forEach((ang, a) => {
    coords.forEach((s, k) => {
      const runs = rayPixelLengths(ang, s, gridN);
      let v = 0;
      for (const r of runs) v += r.len * image[r.idx];
      y[a * detCount + k] = v;
    });
  });
  return y;
}

/** x = A^T y. */
export function adjoint(
  sino: Float64Array,
  gridN: number,
  anglesDeg: number[],
  detCount: number = DETECTOR_COUNT,
): Float64Array {
  const coords = detectorCoordinates(detCount);
  const x = new Float64Array(gridN * gridN);
  anglesDeg.forEach((ang, a) => {
    coords.forEach((s, k) => {
      const w = sino[a * detCount + k];
      if (w === 0) return;
      const runs = rayPixelLengths(ang, s, gridN);
      for (const r of runs) x[r.idx] += r.len * w;
    });
  });
  return x;
}

export function dot(a: Float64Array, b: Float64Array): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

export function l2norm(v: Float64Array): number {
  return Math.sqrt(dot(v, v));
}

/**
 * Operator norm ||A|| via power iteration on A^T A, with a 1.05 safety
 * margin folded in. Deterministic start vector, so runs reproduce.
 */
export function operatorNorm(
  gridN: number,
  anglesDeg: number[],
  detCount: number = DETECTOR_COUNT,
  iters: number = 30,
): number {
  const n = gridN * gridN;
  const rng = mulberry32(0x9e3779b9);
  let b = new Float64Array(n);
  for (let i = 0; i < n; i++) b[i] = rng() - 0.5;
  let nb = l2norm(b);
  for (let i = 0; i < n; i++) b[i] /= nb;
  for (let k = 0; k < iters; k++) {
    const ab = forward(b, gridN, anglesDeg, detCount);
    const atab = adjoint(ab, gridN, anglesDeg, detCount);
    const nrm = l2norm(atab);
    if (!(nrm > 0)) return 0;
    for (let i = 0; i < n; i++) b[i] = atab[i] / nrm;
  }
  const ab = forward(b, gridN, anglesDeg, detCount);
  return Math.sqrt(dot(ab, ab)) * 1.05;
}

/** ||A x - y||. */
export function residualNorm(
  image: Float64Array,
  sino: Float64Array,
  gridN: number,
  anglesDeg: number[],
  detCount: number = DETECTOR_COUNT,
): number {
  const ax = forward(image, gridN, anglesDeg, detCount);
  let s = 0;
  for (let i = 0; i < ax.length; i++) {
    const d = ax[i] - sino[i];
    s += d * d;
  }
  return Math.sqrt(s);
}
