/**
 * Parallel-beam ray vs pixel-grid intersection lengths (Siddon-style DDA).
 * Domain: [-1,1]x[-1,1], N x N pixels, row-major.
 * A ray at angleDeg travels along d=(cos,sin); its detector coordinate s
 * is measured along n=(-sin,cos). Pure functions, no DOM.
 */
import { DETECTOR_COUNT, DETECTOR_HALF_RANGE } from './types';

export interface PixelRun {
  idx: number;
  len: number;
}

const EPS = 1e-12;

function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Detector center coordinates, shared by every angle. */
export function detectorCoordinates(count: number = DETECTOR_COUNT): number[] {
  const half = DETECTOR_HALF_RANGE;
  const coords: number[] = [];
  for (let k = 0; k < count; k++) {
    coords.push(-half + ((k + 0.5) * (2 * half)) / count);
  }
  return coords;
}

/**
 * Length of one ray inside each traversed pixel.
 * Returns runs of [pixelIdx, length]; empty when the ray misses the square.
 */
export function rayPixelLengths(
  angleDeg: number,
  s: number,
  gridN: number,
): PixelRun[] {
  const th = degToRad(angleDeg);
  const dx = Math.cos(th);
  const dy = Math.sin(th);
  const nx = -Math.sin(th);
  const ny = Math.cos(th);
  const ox = s * nx;
  const oy = s * ny;

  // Slab intersection with [-1,1]^2.
  let tEnter = -Infinity;
  let tExit = Infinity;
  const o = [ox, oy];
  const d = [dx, dy];
  for (let a = 0; a < 2; a++) {
    const da = d[a];
    const oa = o[a];
    if (Math.abs(da) < EPS) {
      if (oa < -1 || oa > 1) return [];
    } else {
      let t1 = (-1 - oa) / da;
      let t2 = (1 - oa) / da;
      if (t1 > t2) {
        const tmp = t1;
        t1 = t2;
        t2 = tmp;
      }
      if (t1 > tEnter) tEnter = t1;
      if (t2 < tExit) tExit = t2;
    }
  }
  if (!(tEnter < tExit)) return [];

  const h = 2 / gridN;
  const px = ox + tEnter * dx;
  const py = oy + tEnter * dy;
  let ix = Math.min(gridN - 1, Math.max(0, Math.floor((px + 1) / h)));
  let iy = Math.min(gridN - 1, Math.max(0, Math.floor((py + 1) / h)));

  const stepX = dx > EPS ? 1 : dx < -EPS ? -1 : 0;
  const stepY = dy > EPS ? 1 : dy < -EPS ? -1 : 0;
  const tDeltaX = stepX === 0 ? Infinity : h / Math.abs(dx);
  const tDeltaY = stepY === 0 ? Infinity : h / Math.abs(dy);
  let tMaxX =
    stepX === 0
      ? Infinity
      : ((-1 + (stepX > 0 ? ix + 1 : ix) * h - ox) / dx);
  let tMaxY =
    stepY === 0
      ? Infinity
      : ((-1 + (stepY > 0 ? iy + 1 : iy) * h - oy) / dy);

  const runs: PixelRun[] = [];
  let t = tEnter;
  const guard = 4 * gridN + 16;
  for (let iter = 0; iter < guard; iter++) {
    const tNext = Math.min(tMaxX, tMaxY, tExit);
    const segLen = tNext - t;
    if (segLen > 1e-13 && ix >= 0 && ix < gridN && iy >= 0 && iy < gridN) {
      runs.push({ idx: iy * gridN + ix, len: segLen });
    }
    t = tNext;
    if (tNext >= tExit - 1e-13) break;
    if (tMaxX < tMaxY) {
      ix += stepX;
      tMaxX += tDeltaX;
    } else {
      iy += stepY;
      tMaxY += tDeltaY;
    }
    if (ix < 0 || ix >= gridN || iy < 0 || iy >= gridN) {
      // Left the grid before tExit (fp edge): stop, lengths stay exact.
      break;
    }
  }
  return runs;
}
