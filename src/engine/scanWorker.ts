/**
 * Measurement runner: forward projection + seeded gaussian noise.
 * Deterministic in (phantom, angles, sigma, seed). Budget accounting and
 * duplicate-angle meaning live in the app layer, not here.
 */
import { DETECTOR_COUNT, Scan } from './types';
import { forward } from './projector';
import { detectorCoordinates } from './rayGrid';
import { gaussian, mulberry32 } from './random';

export interface ScanBatch {
  scans: Scan[];
  noiseless: Float64Array;
}

export async function runScanBatch(
  image: Float64Array,
  gridN: number,
  anglesDeg: number[],
  noiseSigma: number,
  seed: number,
  detCount: number = DETECTOR_COUNT,
  onAngle?: (done: number, total: number) => void,
): Promise<ScanBatch> {
  const coords = detectorCoordinates(detCount);
  const noiseless = forward(image, gridN, anglesDeg, detCount);
  const rng = mulberry32(seed);
  const scans: Scan[] = anglesDeg.map((ang, a) => {
    const values: number[] = [];
    for (let k = 0; k < detCount; k++) {
      // Raw values are preserved even when noise pushes them negative
      // (spec: screen color range must not be confused with data range).
      values.push(noiseless[a * detCount + k] + gaussian(rng, noiseSigma));
    }
    onAngle?.(a + 1, anglesDeg.length);
    return {
      angleDeg: ang,
      detectorCoordinates: coords.slice(),
      values,
      noiseSigma,
      seed,
    };
  });
  // Yield once so the measuring state paints before heavy recon starts.
  await new Promise<void>((r) => setTimeout(r, 0));
  return { scans, noiseless };
}

/** Flatten scan values of one angle (or all) into a sinogram vector. */
export function scansToSinogram(scans: Scan[]): Float64Array {
  const total = scans.reduce((n, s) => n + s.values.length, 0);
  const y = new Float64Array(total);
  let o = 0;
  for (const s of scans) {
    for (const v of s.values) y[o++] = v;
  }
  return y;
}
