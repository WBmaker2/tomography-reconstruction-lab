/** Stage 4 — 공개: 정답·추정·차이 지도, RMSE(여기서만), 근거 기록. */
import { rmse } from '../engine/reconstruction';
import { mean } from '../engine/reconstruction';
import { createDensityMap } from './densityMap';
import type { Actions, AppState } from '../state';

export function renderReveal(host: HTMLElement, s: AppState, a: Actions): void {
  const visual = document.createElement('div');
  visual.className = 'panel';
  const h = document.createElement('h2');
  h.textContent = '정답 공개';
  visual.appendChild(h);

  const stampRow = document.createElement('p');
  const stamp = document.createElement('span');
  stamp.className = 'stamp';
  stamp.textContent = '공개됨';
  stampRow.appendChild(stamp);
  visual.appendChild(stampRow);

  const maps = document.createElement('div');
  maps.className = 'map-grid';
  const mTruth = createDensityMap({ title: '정답 내부', scaleNote: '무차원 모형 밀도. 학습용 가상 표본입니다.' });
  mTruth.setImage(s.truth, 32);
  maps.appendChild(mTruth.el);

  if (s.reconImage) {
    const mEst = createDensityMap({ title: '내 추정', scaleNote: '무차원 모형 밀도.' });
    mEst.setImage(s.reconImage, 32);
    maps.appendChild(mEst.el);

    const diff = new Float64Array(s.truth.length);
    for (let i = 0; i < diff.length; i++) diff[i] = Math.abs(s.reconImage[i] - s.truth[i]);
    const mDiff = createDensityMap({ title: '차이 지도 |추정−정답|', kind: 'difference', scaleNote: '빨강이 진할수록 오차가 큽니다. 수치와 함께 읽으세요.' });
    mDiff.setImage(diff, 32);
    maps.appendChild(mDiff.el);
  }
  visual.appendChild(maps);

  if (s.reconImage) {
    const r = rmse(s.reconImage, s.truth);
    const box = document.createElement('div');
    box.className = 'residual-box';
    let absMean = 0;
    for (let i = 0; i < s.truth.length; i++) absMean += Math.abs(s.reconImage[i] - s.truth[i]);
    absMean /= s.truth.length;
    void mean;
    box.innerHTML =
      `영상 오차 <strong class="num">RMSE = ${r.toFixed(4)}</strong> · 평균 절대오차 <span class="num">${absMean.toFixed(4)}</span>` +
      (s.reconResidual !== null ? ` · 측정 잔차 <span class="num">${s.reconResidual.toFixed(4)}</span>` : '');
    const warn = document.createElement('p');
    warn.className = 'hint';
    warn.textContent = 'RMSE는 공개 후에만 표시되는 영상 오차입니다. 복원 이미지를 실제 내부의 완벽한 사진으로 해석하지 마세요.';
    box.appendChild(warn);
    visual.appendChild(box);
  } else {
    const none = document.createElement('p');
    none.className = 'hint';
    none.textContent = '아직 복원 결과가 없습니다. 복원 단계에서 계산을 실행하면 추정·차이 지도가 여기에 표시됩니다.';
    visual.appendChild(none);
  }

  const cond = document.createElement('div');
  cond.className = 'panel';
  const h2 = document.createElement('h2');
  h2.textContent = '근거 기록';
  cond.appendChild(h2);

  const pred = document.createElement('p');
  pred.className = 'status-line';
  pred.innerHTML =
    `처음 예측: <strong>${s.prediction === 'A' ? '후보 갑' : s.prediction === 'B' ? '후보 을' : '기록 없음'}</strong>` +
    (s.predictionNote ? ` — “${s.predictionNote}”` : '');
  cond.appendChild(pred);

  const field = document.createElement('div');
  field.className = 'field';
  const label = document.createElement('label');
  label.htmlFor = 'expl';
  label.textContent = '남은 오차를 설명해 보세요 (조건·결과·해석 구분)';
  const ta = document.createElement('textarea');
  ta.id = 'expl';
  ta.maxLength = 600;
  ta.placeholder = '예: 옆 각도를 더했더니 잔차는 줄었지만 가장자리가 번졌다. 방향이 한쪽에 몰려서…';
  ta.value = s.explanation;
  ta.addEventListener('input', () => a.setExplanation(ta.value));
  field.append(label, ta);
  cond.appendChild(field);

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
  save.className = 'btn';
  save.textContent = s.recordSaved ? '기록 저장됨' : '실험 기록 저장';
  save.disabled = s.recordSaved;
  save.addEventListener('click', () => a.saveRecord());
  const exp = document.createElement('button');
  exp.type = 'button';
  exp.className = 'btn btn-ghost';
  exp.textContent = 'JSON 내보내기';
  exp.addEventListener('click', () => a.exportJson());
  btnRow.append(save, exp);
  cond.appendChild(btnRow);

  if (s.storageOk === false) {
    const fb = document.createElement('p');
    fb.className = 'hint';
    fb.textContent = '기기 저장소를 쓸 수 없어 현재 세션에만 기록됩니다. JSON 내보내기로 보관하세요.';
    cond.appendChild(fb);
  }

  const note = document.createElement('p');
  note.className = 'hint';
  note.textContent = '정답을 본 이 미션은 평가용으로 재사용하지 마세요. 새 미션으로 다시 시작할 수 있습니다.';
  cond.appendChild(note);

  const nav = document.createElement('div');
  nav.className = 'btn-row';
  const again = document.createElement('button');
  again.type = 'button';
  again.className = 'btn btn-ghost';
  again.textContent = '새 미션 시작';
  again.addEventListener('click', () => a.resetMission());
  nav.appendChild(again);
  cond.appendChild(nav);

  host.append(visual, cond);
}
