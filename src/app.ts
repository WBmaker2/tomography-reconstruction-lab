/** App shell: procedure rail, stage host, history dialog, engine wiring. */
import {
  APP_ID,
  ENGINE_VERSION,
  GRID_N,
  SCENARIO_VERSION,
  SCHEMA_VERSION,
  type ExperimentRecord,
} from './engine/types';
import { defaultSeed, getPhantom } from './engine/phantom';
import { runScanBatch } from './engine/scanWorker';
import { backprojectDisplay, rmse, runIterative } from './engine/reconstruction';
import { downloadJson, loadChangelog, saveRecord } from './engine/storage';
import { hashSeed } from './engine/random';
import {
  STAGE_NAMES,
  budgetLeft,
  scanAngles,
  type Actions,
  type AppState,
  type ReconMethod,
  type SavedPlan,
  type Stage,
} from './state';
import { renderSealed } from './views/sealed';
import { renderScan } from './views/scan';
import { renderRecon } from './views/recon';
import { renderCompare } from './views/compare';
import { renderReveal } from './views/reveal';

const BUDGET = 12;
const LAMBDA = 0.001;
const MAX_ITER = 200;

function freshState(): AppState {
  const seed = defaultSeed('mission-1');
  return {
    stage: 0,
    maxStage: 0,
    prediction: null,
    predictionNote: '',
    phantomId: 'circle',
    seed,
    truth: getPhantom('circle', GRID_N, seed).densities,
    scans: [],
    budgetTotal: BUDGET,
    noiseSigma: 0.01,
    avgMode: false,
    measuring: false,
    lastAngle: 30,
    reconMethod: 'iterative',
    reconImage: null,
    reconIters: 0,
    reconResidual: null,
    reconRunning: false,
    reconProgress: 0,
    reconObjective: null,
    plans: [],
    transfer: null,
    transferRunning: false,
    revealed: false,
    explanation: '',
    recordSaved: false,
    storageOk: null,
    error: null,
    notice: null,
  };
}

function linspace(a: number, b: number, n: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < n; i++) out.push(Math.round((a + ((b - a) * i) / (n - 1)) * 10) / 10);
  return out;
}

export function createApp(root: HTMLElement): void {
  let s = freshState();
  let aborter: AbortController | null = null;
  let lastFocus: HTMLElement | null = null;

  const shell = document.createElement('div');
  shell.className = 'shell';
  const topbar = document.createElement('header');
  topbar.className = 'topbar';
  const title = document.createElement('h1');
  title.textContent = '보이지 않는 내부 복원소';
  const badge = document.createElement('span');
  badge.className = 'seed-badge num';
  const spacer = document.createElement('span');
  spacer.className = 'spacer';
  const histBtn = document.createElement('button');
  histBtn.type = 'button';
  histBtn.className = 'btn btn-ghost';
  histBtn.textContent = '업데이트 내역';
  topbar.append(title, badge, spacer, histBtn);
  const rail = document.createElement('nav');
  rail.className = 'rail';
  rail.setAttribute('aria-label', '학습 절차');
  const stageHost = document.createElement('main');
  stageHost.className = 'stage';
  stageHost.id = 'stage';
  const foot = document.createElement('footer');
  foot.className = 'hint';
  foot.style.marginTop = '24px';
  foot.textContent =
    'P0 학습용 모형 · 밀도·잡음·예산은 설계 목표 검증용이며 측정 결과가 아닙니다. 가상 표본이며 실제 의료 영상이 아닙니다.';
  shell.append(topbar, rail, stageHost, foot);
  root.appendChild(shell);

  // Update-history dialog (always reachable, focus returns on close).
  const dialog = document.createElement('dialog');
  dialog.className = 'history';
  dialog.setAttribute('aria-label', '업데이트 내역');
  const dh = document.createElement('h2');
  dh.textContent = '업데이트 내역';
  const ul = document.createElement('ul');
  for (const e of loadChangelog()) {
    const li = document.createElement('li');
    li.innerHTML = `<strong class="num">${e.date}</strong> — ${e.text}`;
    ul.appendChild(li);
  }
  const closeRow = document.createElement('div');
  closeRow.className = 'btn-row';
  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'btn btn-ghost';
  closeBtn.textContent = '닫기';
  closeRow.appendChild(closeBtn);
  dialog.append(dh, ul, closeRow);
  root.appendChild(dialog);
  histBtn.addEventListener('click', () => {
    lastFocus = document.activeElement as HTMLElement | null;
    dialog.showModal();
    closeBtn.focus();
  });
  closeBtn.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => lastFocus?.focus?.());

  // Pause computation when the tab hides; resume policy is stated in the notice.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && s.reconRunning) {
      aborter?.abort();
      s.notice = '탭이 숨겨져 계산을 멈추고 마지막 완료 반복을 보존했습니다. 다시 실행하면 이어서 계산합니다.';
    }
  });

  function render(): void {
    badge.textContent = `seed ${s.seed} · engine ${ENGINE_VERSION}`;
    rail.innerHTML = '';
    STAGE_NAMES.forEach((name, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'rail-step' + (i < s.stage ? ' done' : '');
      b.disabled = i > s.maxStage;
      if (i === s.stage) b.setAttribute('aria-current', 'step');
      const n = document.createElement('span');
      n.className = 'rail-n num';
      n.textContent = String(i + 1);
      b.append(n, name);
      b.addEventListener('click', () => {
        s.stage = i as Stage;
        s.error = null;
        render();
      });
      rail.appendChild(b);
    });
    stageHost.innerHTML = '';
    if (s.notice) {
      const note = document.createElement('p');
      note.className = 'status-line';
      note.setAttribute('role', 'status');
      note.style.gridColumn = '1 / -1';
      note.style.margin = '0';
      note.textContent = s.notice;
      stageHost.appendChild(note);
    }
    const acts = actions;
    if (s.stage === 0) renderSealed(stageHost, s, acts);
    else if (s.stage === 1) renderScan(stageHost, s, acts);
    else if (s.stage === 2) renderRecon(stageHost, s, acts);
    else if (s.stage === 3) renderCompare(stageHost, s, acts);
    else renderReveal(stageHost, s, acts);
  }

  const actions: Actions = {
    goStage(n) {
      if (n <= s.maxStage) {
        s.stage = n;
        s.error = null;
        s.notice = null;
        render();
      }
    },
    setPrediction(p) {
      s.prediction = p;
      s.error = null;
      render();
    },
    setPredictionNote(t) {
      s.predictionNote = t;
    },
    setPhantom(id) {
      if (s.phantomId === id) return;
      s.phantomId = id;
      s.truth = getPhantom(id, GRID_N, s.seed).densities;
      s.scans = [];
      s.plans = [];
      s.transfer = null;
      s.revealed = false;
      s.recordSaved = false;
      s.reconImage = null;
      s.reconIters = 0;
      s.reconResidual = null;
      s.notice = `표본을 ${id === 'circle' ? '원형' : '직사각형'}으로 바꿨습니다. 측정을 새로 시작하세요.`;
      render();
    },
    regenSeed() {
      s.seed = (Math.random() * 2 ** 31) >>> 0;
      s.scans = [];
      s.reconImage = null;
      s.notice = `seed가 ${s.seed}로 바뀌었습니다. 같은 seed에서는 같은 스캔이 재현됩니다.`;
      render();
    },
    start() {
      if (!s.prediction) {
        s.error = '먼저 내부 후보(갑/을)를 하나 고르고, 구분 방법도 짧게 적어 주세요.';
        render();
        return;
      }
      s.error = null;
      s.stage = 1;
      s.maxStage = 1;
      render();
    },
    async addScan(angle) {
      s.error = null;
      s.notice = null;
      if (budgetLeft(s) <= 0) {
        s.error = '예산 12회를 다 썼습니다. 복원으로 이동하거나 비교에서 계획을 정리하세요.';
        render();
        return;
      }
      const dup = s.scans.some((x) => Math.abs(x.angleDeg - angle) < 1e-9);
      if (dup && !s.avgMode) {
        s.error = '이미 잰 각도입니다. 잡음 평균 모드를 켜면 평균용으로 다시 잴 수 있습니다.';
        render();
        return;
      }
      s.measuring = true;
      s.error = null;
      render();
      try {
        const occ = s.scans.filter((x) => Math.abs(x.angleDeg - angle) < 1e-9).length;
        const scanSeed = hashSeed(`${s.seed}:${angle.toFixed(1)}:${occ}`);
        const { scans } = await runScanBatch(s.truth, GRID_N, [angle], s.noiseSigma, scanSeed);
        s.scans = [...s.scans, ...scans];
        s.lastAngle = angle;
        s.measuring = false;
        // New data invalidates the current estimate; saved candidates keep theirs.
        if (s.reconImage) {
          s.reconImage = null;
          s.reconIters = 0;
          s.reconResidual = null;
          s.notice = '측정이 추가되어 현재 추정은 초기화됐습니다. 복원을 다시 실행하세요.';
        }
        s.maxStage = Math.max(s.maxStage, 2) as AppState['maxStage'];
        render();
      } catch (e) {
        s.measuring = false;
        s.error = e instanceof Error ? e.message : '측정 중 오류가 발생했습니다. 다시 시도하세요.';
        render();
      }
    },
    setSigma(v) {
      s.noiseSigma = v;
      render();
    },
    setAvgMode(on) {
      s.avgMode = on;
      render();
    },
    setMethod(m: ReconMethod) {
      s.reconMethod = m;
      s.error = null;
      render();
    },
    async runRecon() {
      s.error = null;
      s.notice = null;
      if (s.scans.length === 0) {
        s.error = '빈 스캔: 먼저 스캔 단계에서 각도를 재야 합니다.';
        render();
        return;
      }
      const angles = scanAngles(s);
      const y = new Float64Array(s.scans.length * s.scans[0].values.length);
      let o = 0;
      for (const sc of s.scans) for (const v of sc.values) y[o++] = v;

      if (s.reconMethod === 'simple') {
        s.reconImage = backprojectDisplay(y, GRID_N, angles);
        s.reconIters = 1;
        s.reconResidual = null;
        s.maxStage = Math.max(s.maxStage, 3) as AppState['maxStage'];
        s.notice = '단순 역투영은 흐릿한 참고 그림입니다. 정량값이 아니므로 잔차를 표시하지 않습니다.';
        render();
        return;
      }

      // Iterative: resume from the preserved image when the angle set is unchanged.
      const resume = s.reconImage && !s.revealed ? Float64Array.from(s.reconImage) : undefined;
      const baseIters = resume ? s.reconIters : 0;
      s.reconRunning = true;
      s.reconProgress = baseIters;
      aborter = new AbortController();
      render();
      try {
        const res = await runIterative(y, GRID_N, angles, {
          lambda: LAMBDA,
          maxIter: MAX_ITER,
          signal: aborter.signal,
          initial: resume,
          onProgress: (done, _total, obj) => {
            s.reconProgress = baseIters + done;
            s.reconObjective = obj;
            render();
          },
        });
        s.reconRunning = false;
        s.reconImage = res.image;
        s.reconIters = baseIters + res.iterations;
        s.reconResidual = res.residualNorm;
        s.reconObjective = res.objectiveHistory[res.objectiveHistory.length - 1];
        s.maxStage = Math.max(s.maxStage, 3) as AppState['maxStage'];
        if (res.aborted) {
          s.notice = `계산을 멈추고 마지막 완료 반복(${s.reconIters}회)을 보존했습니다. 다시 실행하면 이어서 계산합니다.`;
        } else {
          s.notice = null;
        }
        render();
      } catch (e) {
        s.reconRunning = false;
        s.error = e instanceof Error ? e.message : '복원 중 오류가 발생했습니다. 다시 시도하세요.';
        render();
      }
    },
    abortRecon() {
      aborter?.abort();
    },
    savePlan() {
      if (!s.reconImage || s.reconMethod !== 'iterative' || s.reconResidual === null) {
        s.error = '반복 재구성을 먼저 실행해야 후보로 저장할 수 있습니다.';
        render();
        return;
      }
      const plan: SavedPlan = {
        name: `후보 ${s.plans.length + 1}`,
        kind: 'manual',
        angles: scanAngles(s),
        sigma: s.noiseSigma,
        seed: s.seed,
        residual: s.reconResidual,
        iters: s.reconIters,
        image: Float64Array.from(s.reconImage),
        rmse: s.revealed ? rmse(s.reconImage, s.truth) : undefined,
      };
      s.plans = [...s.plans, plan];
      s.error = null;
      s.notice = `${plan.name}을 저장했습니다.`;
      render();
    },
    async runTransfer() {
      s.transferRunning = true;
      s.error = null;
      render();
      try {
        const mk = async (kind: 'clustered' | 'spread', angles: number[], seed: number) => {
          const { scans } = await runScanBatch(s.truth, GRID_N, angles, s.noiseSigma, seed);
          const yy = new Float64Array(scans.length * scans[0].values.length);
          let p = 0;
          for (const sc of scans) for (const v of sc.values) yy[p++] = v;
          const res = await runIterative(yy, GRID_N, angles, { lambda: LAMBDA, maxIter: MAX_ITER });
          const plan: SavedPlan = {
            name: kind === 'clustered' ? '몰아쓰기 12회' : '분산 12회',
            kind,
            angles,
            sigma: s.noiseSigma,
            seed,
            residual: res.residualNorm,
            iters: res.iterations,
            image: res.image,
            rmse: s.revealed ? rmse(res.image, s.truth) : undefined,
          };
          return plan;
        };
        const clustered = await mk('clustered', linspace(75, 105, BUDGET), hashSeed(`${s.seed}:transfer:clustered`));
        const spread = await mk('spread', linspace(0, 165, BUDGET), hashSeed(`${s.seed}:transfer:spread`));
        s.transfer = { clustered, spread };
        s.transferRunning = false;
        s.maxStage = Math.max(s.maxStage, 3) as AppState['maxStage'];
        render();
      } catch (e) {
        s.transferRunning = false;
        s.error = e instanceof Error ? e.message : '전이 과제 계산 중 오류가 발생했습니다.';
        render();
      }
    },
    reveal() {
      s.revealed = true;
      for (const p of [...s.plans, ...(s.transfer ? [s.transfer.clustered, s.transfer.spread] : [])]) {
        if (p.rmse === undefined) p.rmse = rmse(p.image, s.truth);
      }
      s.stage = 4;
      s.maxStage = 4;
      s.error = null;
      render();
    },
    setExplanation(t) {
      s.explanation = t;
    },
    saveRecord() {
      const rec: ExperimentRecord = {
        schemaVersion: SCHEMA_VERSION,
        appId: APP_ID,
        createdAt: new Date().toISOString(),
        scenarioId: `${SCENARIO_VERSION}:${s.phantomId}`,
        parameters: {
          engineVersion: ENGINE_VERSION,
          gridSize: GRID_N,
          angles: scanAngles(s),
          noiseSigma: s.noiseSigma,
          lambda: LAMBDA,
          method: s.reconMethod,
          iterations: s.reconIters,
          residualNorm: s.reconResidual,
          rmse: s.reconImage ? rmse(s.reconImage, s.truth) : null,
        },
        seed: s.seed,
        observations: {
          budgetUsed: s.scans.length,
          plans: s.plans.map((p) => ({ name: p.name, kind: p.kind, residual: p.residual, rmse: p.rmse ?? null })),
        },
        prediction: `${s.prediction ?? '없음'}: ${s.predictionNote}`,
        explanation: s.explanation,
      };
      const ok = saveRecord(rec);
      s.storageOk = ok;
      s.recordSaved = true;
      s.notice = ok ? '실험 기록을 기기에 저장했습니다.' : '기기 저장 불가 — 현재 세션 기록과 JSON 내보내기를 이용하세요.';
      render();
    },
    exportJson() {
      const rec: ExperimentRecord = {
        schemaVersion: SCHEMA_VERSION,
        appId: APP_ID,
        createdAt: new Date().toISOString(),
        scenarioId: `${SCENARIO_VERSION}:${s.phantomId}`,
        parameters: {
          engineVersion: ENGINE_VERSION,
          gridSize: GRID_N,
          angles: scanAngles(s),
          noiseSigma: s.noiseSigma,
          lambda: LAMBDA,
          method: s.reconMethod,
          iterations: s.reconIters,
          residualNorm: s.reconResidual,
          rmse: s.reconImage ? rmse(s.reconImage, s.truth) : null,
          scans: s.scans,
        },
        seed: s.seed,
        observations: {
          budgetUsed: s.scans.length,
          plans: s.plans,
          transfer: s.transfer,
        },
        prediction: `${s.prediction ?? '없음'}: ${s.predictionNote}`,
        explanation: s.explanation,
      };
      downloadJson(`trlab-${s.phantomId}-${s.seed}.json`, rec);
    },
    resetMission() {
      const seed = (Math.random() * 2 ** 31) >>> 0;
      const keepPhantom = s.phantomId;
      s = { ...freshState(), phantomId: keepPhantom, seed, truth: getPhantom(keepPhantom, GRID_N, seed).densities };
      s.notice = '새 미션을 시작합니다. 이 미션의 정답은 이전과 다릅니다.';
      render();
    },
  };

  render();
}
