/** Stage 1 — 스캔: 각도 선택, 예산, 검출기 판독. */
import { createDial } from './dial';
import { createDetectorView } from './detectorView';
import { budgetLeft, type Actions, type AppState } from '../state';

function evenSpread(n: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < n; i++) out.push(Math.round(((i * 180) / n) * 10) / 10);
  return out;
}

export function renderScan(host: HTMLElement, s: AppState, a: Actions): void {
  const visual = document.createElement('div');
  visual.className = 'panel';
  const h = document.createElement('h2');
  h.textContent = '스캔 벤치';
  visual.appendChild(h);

  const monument = document.createElement('div');
  monument.className = 'budget-monument';
  monument.setAttribute('role', 'status');
  const big = document.createElement('div');
  big.className = 'big num';
  big.textContent = String(budgetLeft(s));
  const cap = document.createElement('div');
  cap.textContent = `남은 측정 횟수 (전체 ${s.budgetTotal}회 · 완료된 스캔만 차감)`;
  monument.append(big, cap);
  visual.appendChild(monument);

  const detView = createDetectorView();
  detView.setScan(s.scans.length > 0 ? s.scans[s.scans.length - 1] : null);
  visual.appendChild(detView.el);

  const cond = document.createElement('div');
  cond.className = 'panel';
  const h2 = document.createElement('h2');
  h2.textContent = '각도 정하기';
  cond.appendChild(h2);

  let angle = s.lastAngle;
  const dial = createDial({
    initial: angle,
    disabled: s.measuring || budgetLeft(s) <= 0,
    onInput: (v) => {
      angle = v;
      syncDup();
    },
  });
  cond.appendChild(dial.el);

  const dup = document.createElement('p');
  dup.className = 'hint';
  cond.appendChild(dup);
  function syncDup(): void {
    const exists = s.scans.some((x) => Math.abs(x.angleDeg - angle) < 1e-9);
    if (!exists) {
      dup.textContent = `θ ${angle.toFixed(1)}° — 아직 측정하지 않은 새 각도입니다.`;
      return;
    }
    dup.textContent = s.avgMode
      ? `θ ${angle.toFixed(1)}° — 이미 측정한 각도입니다. 잡음 평균 모드이므로 평균용으로 추가됩니다.`
      : `θ ${angle.toFixed(1)}° — 이미 측정한 각도입니다. 잡음 평균 모드를 켜야 다시 잴 수 있습니다.`;
  }
  syncDup();

  const presets = document.createElement('div');
  presets.className = 'presets';
  presets.setAttribute('role', 'group');
  presets.setAttribute('aria-label', '각도 프리셋');
  const mkPreset = (t: string, fn: () => void) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn btn-ghost';
    b.textContent = t;
    b.disabled = s.measuring;
    b.addEventListener('click', fn);
    presets.appendChild(b);
  };
  mkPreset('0°로', () => {
    dial.set(0);
    angle = 0;
    syncDup();
  });
  mkPreset('90°로', () => {
    dial.set(90);
    angle = 90;
    syncDup();
  });
  mkPreset('균등 6각 제안', () => {
    const cands = evenSpread(6).filter((x) => !s.scans.some((y) => Math.abs(y.angleDeg - x) < 1e-9));
    if (cands.length > 0) {
      dial.set(cands[0]);
      angle = cands[0];
      syncDup();
    }
  });
  cond.appendChild(presets);

  const sigField = document.createElement('div');
  sigField.className = 'field';
  const sigLabel = document.createElement('label');
  sigLabel.htmlFor = 'sigma-sel';
  sigLabel.textContent = '잡음 크기 σ (모형값)';
  const sigSel = document.createElement('select');
  sigSel.id = 'sigma-sel';
  for (const v of [0, 0.01, 0.03]) {
    const o = document.createElement('option');
    o.value = String(v);
    o.textContent = v === 0 ? '0 — 무잡음' : String(v);
    if (s.noiseSigma === v) o.selected = true;
    sigSel.appendChild(o);
  }
  sigSel.disabled = s.measuring;
  sigSel.addEventListener('change', () => a.setSigma(Number(sigSel.value)));
  sigField.append(sigLabel, sigSel);
  cond.appendChild(sigField);

  const avgWrap = document.createElement('p');
  const avg = document.createElement('input');
  avg.type = 'checkbox';
  avg.id = 'avg-mode';
  avg.checked = s.avgMode;
  avg.disabled = s.measuring;
  avg.addEventListener('change', () => a.setAvgMode(avg.checked));
  const avgLabel = document.createElement('label');
  avgLabel.htmlFor = 'avg-mode';
  avgLabel.textContent = ' 잡음 평균 모드 — 같은 각도를 다시 재어 평균 효과를 본다';
  avgWrap.append(avg, avgLabel);
  cond.appendChild(avgWrap);

  if (s.error) {
    const err = document.createElement('p');
    err.className = 'error-text';
    err.setAttribute('role', 'alert');
    err.textContent = s.error;
    cond.appendChild(err);
  }

  const btnRow = document.createElement('div');
  btnRow.className = 'btn-row';
  const scanBtn = document.createElement('button');
  scanBtn.type = 'button';
  scanBtn.className = 'btn pulse';
  scanBtn.textContent = s.measuring ? '측정 중…' : '이 각도로 스캔';
  scanBtn.disabled = s.measuring || budgetLeft(s) <= 0;
  scanBtn.addEventListener('click', () => a.addScan(angle));
  btnRow.appendChild(scanBtn);
  if (s.scans.length > 0) {
    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'btn btn-ghost';
    next.textContent = '복원으로 이동';
    next.addEventListener('click', () => a.goStage(2));
    btnRow.appendChild(next);
  }
  cond.appendChild(btnRow);

  const status = document.createElement('p');
  status.className = 'status-line';
  status.innerHTML = '';
  const stateName = s.measuring ? 'measuring (측정 중)' : s.scans.length === 0 ? 'idle (대기)' : 'measured (측정됨)';
  status.innerHTML = `상태: <strong>${stateName}</strong> · 이미 잰 각도 ${s.scans.length}개`;
  cond.appendChild(status);

  if (s.scans.length > 0) {
    const h3 = document.createElement('h3');
    h3.textContent = '잰 각도 목록';
    const ul = document.createElement('ul');
    ul.className = 'angle-chips';
    s.scans.forEach((sc, i) => {
      const li = document.createElement('li');
      const isAvg = i > 0 && s.scans.slice(0, i).some((p) => Math.abs(p.angleDeg - sc.angleDeg) < 1e-9);
      if (isAvg) li.className = 'avg';
      li.textContent = `θ ${sc.angleDeg.toFixed(1)}°${isAvg ? ' · 평균용' : ''}`;
      ul.appendChild(li);
    });
    cond.append(h3, ul);
  }

  host.append(visual, cond);
}
