/**
 * P0 reconstruction methods.
 * - backprojectDisplay: A^T y normalized to [0,1]. Blurry illustration only,
 *   never a quantitative value (spec section 5).
 * - runIterative: projected gradient descent on
 *   0.5||Ax-y||^2 + 0.5*lambda||x||^2, box [0,1].
 *   Chunked + abortable; abort preserves the last completed chunk.
 */
import { DETECTOR_COUNT, Reconstruction } from './types';
import { adjoint, forward, l2norm, operatorNorm } from './projector';

export interface IterativeOptions {
  lambda?: number;
  maxIter?: number;
  relTol?: number;
  chunkIters?: number;
  initial?: Float64Array;
  signal?: AbortSignal;
  onProgress?: (done: number, total: number, objective: number) => void;
  detCount?: number;
}

function objective(
  image: Float64Array,
  sino: Float64Array,
  gridN: number,
  anglesDeg: number[],
  lambda: number,
  detCount: number,
): number {
  const ax = forward(image, gridN, anglesDeg, detCount);
  let data = 0;
  for (let i = 0; i < ax.length; i++) {
    const d = ax[i] - sino[i];
    data += d * d;
  }
  let reg = 0;
  for (let i = 0; i < image.length; i++) reg += image[i] * image[i];
  return 0.5 * data + 0.5 * lambda * reg;
}

function projectBox(image: Float64Array): void {
  for (let i = 0; i < image.length; i++) {
    if (image[i] < 0) image[i] = 0;
    else if (image[i] > 1) image[i] = 1;
  }
}

export function backprojectDisplay(
  sino: Float64Array,
  gridN: number,
  anglesDeg: number[],
  detCount: number = DETECTOR_COUNT,
): Float64Array {
  const raw = adjoint(sino, gridN, anglesDeg, detCount);
  let lo = Infinity;
  let hi = -Infinity;
  for (let i = 0; i < raw.length; i++) {
    if (raw[i] < lo) lo = raw[i];
    if (raw[i] > hi) hi = raw[i];
  }
  const out = new Float64Array(raw.length);
  if (!(hi > lo)) return out;
  for (let i = 0; i < raw.length; i++) out[i] = (raw[i] - lo) / (hi - lo);
  return out;
}

const tick = () => new Promise<void>((r) => setTimeout(r, 0));

export async function runIterative(
  sino: Float64Array,
  gridN: number,
  anglesDeg: number[],
  opts: IterativeOptions = {},
): Promise<Reconstruction & { objectiveHistory: number[]; aborted: boolean }> {
  const {
    lambda = 0.01,
    maxIter = 200,
    relTol = 1e-6,
    chunkIters = 5,
    initial,
    signal,
    onProgress,
    detCount = DETECTOR_COUNT,
  } = opts;
  if (anglesDeg.length === 0 || sino.length === 0) {
    throw new Error('빈 스캔: 측정 각도가 없어 복원할 수 없습니다.');
  }
  const sigma = operatorNorm(gridN, anglesDeg, detCount);
  const step = 1 / (sigma * sigma + lambda);
  const x = initial ? Float64Array.from(initial) : new Float64Array(gridN * gridN);
  projectBox(x);

  const history: number[] = [];
  let prev = objective(x, sino, gridN, anglesDeg, lambda, detCount);
  history.push(prev);
  let done = 0;
  let aborted = false;

  outer: while (done < maxIter) {
    const chunk = Math.min(chunkIters, maxIter - done);
    for (let c = 0; c < chunk; c++) {
      if (signal?.aborted) {
        aborted = true;
        break outer;
      }
      const ax = forward(x, gridN, anglesDeg, detCount);
      for (let i = 0; i < ax.length; i++) ax[i] -= sino[i];
      const grad = adjoint(ax, gridN, anglesDeg, detCount);
      for (let i = 0; i < x.length; i++) {
        x[i] -= step * (grad[i] + lambda * x[i]);
      }
      projectBox(x);
      done++;
    }
    const cur = objective(x, sino, gridN, anglesDeg, lambda, detCount);
    history.push(cur);
    onProgress?.(done, maxIter, cur);
    const denom = Math.max(1e-12, Math.abs(prev));
    if (Math.abs(prev - cur) / denom < relTol) break;
    prev = cur;
    await tick();
  }
  if (signal?.aborted) aborted = true;

  const axFinal = forward(x, gridN, anglesDeg, detCount);
  let r = 0;
  for (let i = 0; i < axFinal.length; i++) {
    const d = axFinal[i] - sino[i];
    r += d * d;
  }
  onProgress?.(done, maxIter, history[history.length - 1]);
  return {
    method: 'iterative',
    iterations: done,
    regularization: lambda,
    residualNorm: Math.sqrt(r),
    image: x,
    completed: !aborted && done > 0,
    objectiveHistory: history,
    aborted,
  };
}

/** RMSE is shown only after reveal, never before (spec section 6). */
export function rmse(estimate: Float64Array, truth: Float64Array): number {
  let s = 0;
  for (let i = 0; i < estimate.length; i++) {
    const d = estimate[i] - truth[i];
    s += d * d;
  }
  return Math.sqrt(s / estimate.length);
}

export function mean(v: Float64Array): number {
  let s = 0;
  for (let i = 0; i < v.length; i++) s += v[i];
  return s / v.length;
}

export { l2norm };
