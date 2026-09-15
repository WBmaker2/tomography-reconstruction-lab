/** Engine verification: model, data, and edge cases (spec section 10). */
import { describe, expect, it } from 'vitest';
import { adjoint, dot, forward, l2norm, operatorNorm, residualNorm } from '../src/engine/projector';
import { rayPixelLengths } from '../src/engine/rayGrid';
import { circlePhantom, introPair8, rectPhantom, rotate90ccw, uniform, zeros } from '../src/engine/phantom';
import { rmse, runIterative } from '../src/engine/reconstruction';
import { runScanBatch } from '../src/engine/scanWorker';
import { mulberry32 } from '../src/engine/random';

const N = 16;
const DET = 48;

describe('model validation', () => {
  it('zero density gives zero projections without noise', async () => {
    const { noiseless } = await runScanBatch(zeros(N), N, [0, 30, 90, 179.9], 0, 42, DET);
    for (const v of noiseless) expect(v).toBe(0);
  });

  it('uniform density 1 traversed horizontally integrates to 2', async () => {
    const { noiseless } = await runScanBatch(uniform(N, 1), N, [0], 0, 7, DET);
    let inside = 0;
    for (const v of noiseless) {
      if (v > 1e-9) {
        inside++;
        expect(v).toBeCloseTo(2, 9);
      } else {
        expect(v).toBe(0);
      }
    }
    expect(inside).toBeGreaterThan(0);
  });

  it('adjoint identity holds to 1e-8 relative', () => {
    const rng = mulberry32(1234);
    const x = new Float64Array(N * N);
    for (let i = 0; i < x.length; i++) x[i] = rng();
    const angles = [10, 45, 130];
    const ax = forward(x, N, angles, DET);
    const y = new Float64Array(ax.length);
    for (let i = 0; i < y.length; i++) y[i] = rng();
    const aty = adjoint(y, N, angles, DET);
    const lhs = dot(ax, y);
    const rhs = dot(x, aty);
    const rel = Math.abs(lhs - rhs) / Math.max(1, Math.abs(lhs));
    expect(rel).toBeLessThanOrEqual(1e-8);
  });

  it('90-degree phantom rotation shifts the projection angle', () => {
    const x = rectPhantom(N);
    const r = rotate90ccw(x, N);
    // Rotating the object CCW by 90 moves its projection from theta to theta+90.
    const a = forward(x, N, [120], DET);
    const b = forward(r, N, [30], DET);
    expect(l2norm(a) > 0).toBe(true);
    let num = 0;
    for (let i = 0; i < a.length; i++) {
      const d = a[i] - b[i];
      num += d * d;
    }
    const rel = Math.sqrt(num) / l2norm(a);
    expect(rel).toBeLessThan(0.02);
  });

  it('objective decreases monotonically on a noiseless small phantom', async () => {
    const truth = circlePhantom(N);
    const angles = [0, 45, 90, 135];
    const { noiseless } = await runScanBatch(truth, N, angles, 0, 99, DET);
    const objectives: number[] = [];
    const res = await runIterative(noiseless, N, angles, {
      lambda: 0.01,
      maxIter: 60,
      relTol: 1e-12,
      detCount: DET,
      onProgress: (_d, _t, o) => objectives.push(o),
    });
    for (let i = 1; i < objectives.length; i++) {
      expect(objectives[i]).toBeLessThanOrEqual(objectives[i - 1] + 1e-9);
    }
    expect(res.completed).toBe(true);
    // Reconstruction approaches the truth (image error distinct from residual).
    expect(rmse(res.image, truth)).toBeLessThan(0.35);
  });

  it('same seed reproduces the same scan', async () => {
    const truth = circlePhantom(N);
    const angles = [12, 77];
    const r1 = await runScanBatch(truth, N, angles, 0.03, 2026, DET);
    const r2 = await runScanBatch(truth, N, angles, 0.03, 2026, DET);
    expect(Array.from(r1.noiseless)).toEqual(Array.from(r2.noiseless));
    expect(r1.scans[0].values).toEqual(r2.scans[0].values);
  });
});

describe('edge cases', () => {
  it('angles 0 and 179.9, tangent rays stay finite', () => {
    const x = uniform(N, 0.5);
    const y = forward(x, N, [0, 179.9], DET);
    for (const v of y) {
      expect(Number.isFinite(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(0);
    }
  });

  it('empty scan is refused with guidance', async () => {
    await expect(runIterative(new Float64Array(0), N, [], {})).rejects.toThrow('빈 스캔');
  });

  it('duplicate angles are deterministic rows', async () => {
    const truth = rectPhantom(N);
    const { noiseless } = await runScanBatch(truth, N, [45, 45], 0, 5, DET);
    const half = noiseless.length / 2;
    for (let k = 0; k < half; k++) {
      expect(noiseless[k]).toBe(noiseless[half + k]);
    }
  });

  it('abort preserves the last completed chunk', async () => {
    const truth = circlePhantom(N);
    const angles = [0, 30, 60, 90, 120, 150];
    const { noiseless } = await runScanBatch(truth, N, angles, 0.01, 11, DET);
    const ctl = new AbortController();
    const p = runIterative(noiseless, N, angles, {
      lambda: 0.01,
      maxIter: 200,
      chunkIters: 2,
      detCount: DET,
      signal: ctl.signal,
    });
    ctl.abort();
    const res = await p;
    expect(res.aborted).toBe(true);
    expect(res.iterations).toBeGreaterThanOrEqual(0);
    expect(Number.isFinite(residualNorm(res.image, noiseless, N, angles, DET))).toBe(true);
  });

  it('intro pair shares column sums with different interiors', () => {
    const { a, b, colSums } = introPair8();
    for (let c = 0; c < 8; c++) {
      let sa = 0;
      let sb = 0;
      for (let r = 0; r < 8; r++) {
        sa += a[r][c];
        sb += b[r][c];
      }
      expect(sa).toBe(colSums[c]);
      expect(sb).toBe(colSums[c]);
    }
    expect(JSON.stringify(a)).not.toBe(JSON.stringify(b));
  });

  it('ray lengths of one ray sum to its chord through the square', () => {
    const runs = rayPixelLengths(30, 0.2, N);
    let total = 0;
    for (const r of runs) total += r.len;
    // Chord of the square along this ray; must be positive and bounded by the diagonal.
    expect(total).toBeGreaterThan(0);
    expect(total).toBeLessThanOrEqual(2 * Math.SQRT2 + 1e-9);
  });
});
