/** Test + teaching phantoms. Values are dimensionless model densities. */
import { Phantom } from './types';
import { hashSeed } from './random';

export function zeros(gridN: number): Float64Array {
  return new Float64Array(gridN * gridN);
}

export function uniform(gridN: number, v: number): Float64Array {
  const x = new Float64Array(gridN * gridN);
  x.fill(v);
  return x;
}

function pixelCenter(i: number, gridN: number): number {
  return -1 + ((i + 0.5) * 2) / gridN;
}

export function circlePhantom(gridN: number, r = 0.5, density = 0.8): Float64Array {
  const x = zeros(gridN);
  for (let iy = 0; iy < gridN; iy++) {
    for (let ix = 0; ix < gridN; ix++) {
      const cx = pixelCenter(ix, gridN);
      const cy = pixelCenter(iy, gridN);
      if (cx * cx + cy * cy <= r * r) x[iy * gridN + ix] = density;
    }
  }
  return x;
}

export function rectPhantom(
  gridN: number,
  x0 = -0.6,
  x1 = 0.3,
  y0 = -0.4,
  y1 = 0.4,
  density = 0.7,
): Float64Array {
  const x = zeros(gridN);
  for (let iy = 0; iy < gridN; iy++) {
    for (let ix = 0; ix < gridN; ix++) {
      const cx = pixelCenter(ix, gridN);
      const cy = pixelCenter(iy, gridN);
      if (cx >= x0 && cx <= x1 && cy >= y0 && cy <= y1) x[iy * gridN + ix] = density;
    }
  }
  return x;
}

export function getPhantom(id: 'circle' | 'rect', gridN: number, seed: number): Phantom {
  const densities = id === 'circle' ? circlePhantom(gridN) : rectPhantom(gridN);
  return {
    id,
    version: 'p0-1',
    gridSize: gridN,
    densities,
    shapes: id === 'circle' ? 'disc r=0.5 d=0.8' : 'rect [-0.6,0.3]x[-0.4,0.4] d=0.7',
    seed,
  };
}

/** Rotate an image 90 degrees counter-clockwise (for the rotation relation check). */
export function rotate90ccw(image: Float64Array, gridN: number): Float64Array {
  const out = new Float64Array(image.length);
  for (let iy = 0; iy < gridN; iy++) {
    for (let ix = 0; ix < gridN; ix++) {
      out[(gridN - 1 - ix) * gridN + iy] = image[iy * gridN + ix];
    }
  }
  return out;
}

/**
 * Intro pair for step 1: two 8x8 arrays with identical column sums but
 * different interiors. A holds mass in rows 1-2, B in rows 5-6.
 */
export function introPair8(): { a: number[][]; b: number[][]; colSums: number[] } {
  const n = 8;
  const a: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  const b: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  for (let c = 0; c < n; c++) {
    a[1][c] = 1;
    a[2][c] = 1;
    b[5][c] = 1;
    b[6][c] = 1;
  }
  const colSums = Array(n).fill(2);
  return { a, b, colSums };
}

export function defaultSeed(scenarioId: string): number {
  return hashSeed(`trlab:${scenarioId}`);
}
