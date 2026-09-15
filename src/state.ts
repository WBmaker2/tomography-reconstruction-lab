/** App state + actions contract shared by all views. */
import type { Scan } from './engine/types';

export type Stage = 0 | 1 | 2 | 3 | 4;
export const STAGE_NAMES = ['밀봉 상자', '스캔', '복원', '비교', '공개'] as const;

export type ReconMethod = 'simple' | 'iterative';

export interface SavedPlan {
  name: string;
  kind: 'manual' | 'clustered' | 'spread';
  angles: number[];
  sigma: number;
  seed: number;
  residual: number;
  iters: number;
  image: Float64Array;
  rmse?: number;
}

export interface TransferResult {
  clustered: SavedPlan;
  spread: SavedPlan;
}

export interface AppState {
  stage: Stage;
  maxStage: Stage;
  prediction: 'A' | 'B' | null;
  predictionNote: string;
  phantomId: 'circle' | 'rect';
  seed: number;
  truth: Float64Array;
  scans: Scan[];
  budgetTotal: number;
  noiseSigma: number;
  avgMode: boolean;
  measuring: boolean;
  lastAngle: number;
  reconMethod: ReconMethod;
  reconImage: Float64Array | null;
  reconIters: number;
  reconResidual: number | null;
  reconRunning: boolean;
  reconProgress: number;
  reconObjective: number | null;
  plans: SavedPlan[];
  transfer: TransferResult | null;
  transferRunning: boolean;
  revealed: boolean;
  explanation: string;
  recordSaved: boolean;
  storageOk: boolean | null;
  error: string | null;
  notice: string | null;
}

export interface Actions {
  goStage(n: Stage): void;
  setPrediction(p: 'A' | 'B'): void;
  setPredictionNote(t: string): void;
  setPhantom(id: 'circle' | 'rect'): void;
  regenSeed(): void;
  start(): void;
  addScan(angle: number): void;
  setSigma(s: number): void;
  setAvgMode(on: boolean): void;
  setMethod(m: ReconMethod): void;
  runRecon(): void;
  abortRecon(): void;
  savePlan(): void;
  runTransfer(): void;
  reveal(): void;
  setExplanation(t: string): void;
  saveRecord(): void;
  exportJson(): void;
  resetMission(): void;
}

export function budgetLeft(s: AppState): number {
  return s.budgetTotal - s.scans.length;
}

export function scanAngles(s: AppState): number[] {
  return s.scans.map((x) => x.angleDeg);
}
