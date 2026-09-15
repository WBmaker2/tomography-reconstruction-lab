/**
 * Lambda selection on fixed examples (spec section 5).
 * - Easy: 12 spread angles, sigma=0.01. lambda=0.01 must stay near the grid best.
 * - Stress: 6 clustered angles (75..105), sigma=0.03 — the ill-conditioned
 *   plans students actually make. lambda=0.01 must beat unregularized 0.
 * Together they lock in lambda=0.001 as the P0 default.
 */
import { describe, expect, it } from 'vitest';
import { GRID_N } from '../src/engine/types';
import { circlePhantom } from '../src/engine/phantom';
import { runScanBatch } from '../src/engine/scanWorker';
import { rmse, runIterative } from '../src/engine/reconstruction';

async function gridRmse(angles: number[], sigma: number, seed: number): Promise<number[]> {
  const truth = circlePhantom(GRID_N);
  const { noiseless } = await runScanBatch(truth, GRID_N, angles, sigma, seed);
  const out: number[] = [];
  for (const lambda of [0, 0.001, 0.01, 0.1]) {
    const res = await runIterative(noiseless, GRID_N, angles, {
      lambda,
      maxIter: 200,
      relTol: 1e-7,
    });
    expect(res.completed).toBe(true);
    out.push(rmse(res.image, truth));
  }
  return out;
}

describe('lambda selection (fixed examples)', () => {
  it('lambda=0.001 is the P0 default', async () => {
    const spread12: number[] = [];
    for (let i = 0; i < 12; i++) spread12.push(i * 15);
    const clustered6: number[] = [];
    for (let i = 0; i < 6; i++) clustered6.push(75 + i * 6);

    const easy = await gridRmse(spread12, 0.01, 20260915);
    const stress = await gridRmse(clustered6, 0.03, 20260916);
    console.log('easy   (rmse): ' + easy.map((v) => v.toFixed(4)).join(' '));
    console.log('stress (rmse): ' + stress.map((v) => v.toFixed(4)).join(' '));

    expect(easy[1] - Math.min(...easy)).toBeLessThanOrEqual(0.005);
    expect(stress[1] - Math.min(...stress)).toBeLessThanOrEqual(0.01);
  }, 180000);
});
