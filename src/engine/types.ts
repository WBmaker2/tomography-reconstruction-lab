/** Shared model types + version constants. Pure data, no DOM. */

export const APP_ID = 'tomography-reconstruction-lab';
export const SCHEMA_VERSION = 1;
export const ENGINE_VERSION = '0.1.0';
export const SCENARIO_VERSION = 'p0-1';

export const DOMAIN_MIN = -1;
export const DOMAIN_MAX = 1;
export const GRID_N = 32;
export const DETECTOR_COUNT = 48;
/** Half-width of the detector rail. sqrt(2) covers the square at every angle. */
export const DETECTOR_HALF_RANGE = Math.SQRT2;
export const DENSITY_MIN = 0;
export const DENSITY_MAX = 1;

export interface Phantom {
  id: string;
  version: string;
  gridSize: number;
  densities: Float64Array;
  shapes: string;
  seed: number;
}

export interface Scan {
  angleDeg: number;
  detectorCoordinates: number[];
  values: number[];
  noiseSigma: number;
  seed: number;
}

export interface Reconstruction {
  method: 'backproject' | 'iterative';
  iterations: number;
  regularization: number;
  residualNorm: number;
  image: Float64Array;
  completed: boolean;
}

export interface ExperimentRecord {
  schemaVersion: number;
  appId: string;
  createdAt: string;
  scenarioId: string;
  parameters: Record<string, unknown>;
  seed: number;
  observations: Record<string, unknown>;
  prediction: string;
  explanation: string;
}

/** Row-major pixel index for (ix, iy). */
export function pixelIndex(ix: number, iy: number, gridN: number): number {
  return iy * gridN + ix;
}
