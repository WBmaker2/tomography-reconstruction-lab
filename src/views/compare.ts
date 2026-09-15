/** Stage 3 — 비교: 각도 목록, 잔차, 후보 + 전이 과제(몰기 vs 분산). */
import { createDensityMap } from './densityMap';
import { scanAngles, type Actions, type AppState } from '../state';

export function renderCompare(host: HTMLElement, s: AppState, a: Actions): void {
  const visual = document.createElement('div');
  visual.className = 'panel';
  const h = document.createElement('h2');
  h.textContent = '측정 계획 비교';
  visual.appendChild(h);

  const angles = scanAngles(s);
  const sum = document.createElement('p');
  sum.className = 'status-line';
  sum.innerHTML =
    angles.length === 0
      ? '아직 잰 각도가 없습니다.'
      : `현재 계획: <strong class="num">${angles.map((x) => `θ ${x.toFixed(1)}°`).join(' · ')}</strong>`;
  visual.appendChild(sum);

  if (s.reconResidual !== null && s.reconMethod === 'iterative') {
    const box = document.createElement('div');
    box.className = 'residual-box';
    box.innerHTML = `현재 계획의 측정 잔차 <strong class="num">${s.reconResidual.toFixed(4)}</strong> (${s.reconIters}회)`;
    visual.appendChild(box);
  }

  if (s.plans.length > 0) {
    const h3 = document.createElement('h3');
    h3.textContent = '저장된 후보';
    const ul = document.createElement('ul');
    ul.className = 'plan-list';
    for (const p of s.plans) {
      const li = document.createElement('li');
      const kindName = p.kind === 'manual' ? '직접 계획' : p.kind === 'clustered' ? '몰아쓰기' : '고르게 분산';
      li.innerHTML =
        `<strong>${p.name}</strong> (${kindName}) · 각도 ${p.angles.length}개 · ` +
        `잔차 <span class="num">${p.residual.toFixed(4)}</span> · ${p.iters}회` +
        (p.rmse !== undefined ? ` · 공개 후 RMSE <span class="num">${p.rmse.toFixed(4)}</span>` : '');
      ul.appendChild(li);
    }
    visual.append(h3, ul);
  }

  if (s.transfer) {
    const h3 = document.createElement('h3');
    h3.textContent = '전이 과제 결과 — 같은 12회, 쓰는 방법이 다르다';
    visual.appendChild(h3);
    const maps = document.createElement('div');
    maps.className = 'map-grid';
    const mc = createDensityMap({ title: '몰아쓰기 (75°~105°에 집중)', scaleNote: '무차원 모형 밀도.' });
    mc.setImage(s.transfer.clustered.image, 32);
    const ms = createDensityMap({ title: '고르게 분산 (0°~165°)', scaleNote: '무차원 모형 밀도.' });
    ms.setImage(s.transfer.spread.image, 32);
    maps.append(mc.el, ms.el);
    visual.appendChild(maps);
    const res = document.createElement('div');
    res.className = 'residual-box';
    res.innerHTML =
      `몰아쓰기 잔차 <strong class="num">${s.transfer.clustered.residual.toFixed(4)}</strong> · ` +
      `분산 잔차 <strong class="num">${s.transfer.spread.residual.toFixed(4)}</strong>`;
    const warn = document.createElement('p');
    warn.className = 'hint';
    warn.textContent = s.revealed
      ? '공개 후에는 RMSE까지 함께 보세요. 잔차가 작다고 정답에 가깝다는 뜻은 아닙니다.'
      : '아직 공개 전이므로 잔차와 측정 계획만 비교합니다. RMSE는 공개 후에 표시됩니다.';
    res.appendChild(warn);
    visual.appendChild(res);
  }

  const cond = document.createElement('div');
  cond.className = 'panel';
  const h2 = document.createElement('h2');
  h2.textContent = '후보 실행';
  cond.appendChild(h2);

  const guide = document.createElement('p');
  guide.className = 'hint';
  guide.textContent =
    '현재까지의 측정으로 복원한 결과를 후보로 저장하세요. 전이 과제는 같은 12회를 비슷한 각도에 몰아 쓴 경우와 고르게 분산한 경우를 같은 표본·잡음·seed 조건에서 계산합니다.';
  cond.appendChild(guide);

  if (s.error) {
    const err = document.createElement('p');
    err.className = 'error-text';
    err.setAttribute('role', 'alert');
    err.textContent = s.error;
    cond.appendChild(err);
  }

  const btnRow = document.createElement('div');
  btnRow.className = 'btn-row';
  const save = document.createElement('button');
  save.type = 'button';
  save.className = 'btn btn-ghost';
  save.textContent = '현재 복원을 후보로 저장';
  save.disabled = !s.reconImage || s.reconMethod !== 'iterative';
  save.addEventListener('click', () => a.savePlan());
  btnRow.appendChild(save);

  const transfer = document.createElement('button');
  transfer.type = 'button';
  transfer.className = 'btn pulse';
  transfer.textContent = s.transferRunning ? '전이 과제 계산 중…' : '전이 과제 실행 (12회씩 두 계획)';
  transfer.disabled = s.transferRunning;
  transfer.addEventListener('click', () => a.runTransfer());
  btnRow.appendChild(transfer);
  cond.appendChild(btnRow);

  const nav = document.createElement('div');
  nav.className = 'btn-row';
  const back = document.createElement('button');
  back.type = 'button';
  back.className = 'btn btn-ghost';
  back.textContent = '복원으로 돌아가기';
  back.addEventListener('click', () => a.goStage(2));
  const fwd = document.createElement('button');
  fwd.type = 'button';
  fwd.className = 'btn btn-ghost';
  fwd.textContent = '공개로 이동';
  fwd.addEventListener('click', () => a.reveal());
  nav.append(back, fwd);
  cond.appendChild(nav);

  host.append(visual, cond);
}
