/** Stage 2 — 복원: 단순 역투영 vs 반복 재구성, 진행·취소, 잔차. */
import { createDensityMap } from './densityMap';
import type { Actions, AppState } from '../state';

export function renderRecon(host: HTMLElement, s: AppState, a: Actions): void {
  const visual = document.createElement('div');
  visual.className = 'panel';
  const h = document.createElement('h2');
  h.textContent = '내부 추정';
  visual.appendChild(h);

  const map = createDensityMap({
    title: s.reconMethod === 'simple' ? '단순 역투영 (흐릿한 참고용)' : '반복 재구성 추정',
    scaleNote:
      s.reconMethod === 'simple'
        ? 'Aᵀy를 0~1로 늘인 그림입니다. 정량 복원값이 아닙니다.'
        : '0 이상 1 이하 박스 제약하의 반복 추정입니다. 무차원 모형 밀도.',
  });
  if (s.reconImage) map.setImage(s.reconImage, 32);
  visual.appendChild(map.el);

  if (s.reconResidual !== null && s.reconMethod === 'iterative') {
    const box = document.createElement('div');
    box.className = 'residual-box';
    box.innerHTML = `측정 잔차 <strong class="num">‖Ax−y‖ = ${s.reconResidual.toFixed(4)}</strong> · ${s.reconIters}회 반복`;
    const warn = document.createElement('p');
    warn.className = 'hint';
    warn.textContent = '잔차가 작다고 정답 내부가 복원된 것은 아닙니다. 측정 오차와 영상 오차는 다릅니다.';
    box.appendChild(warn);
    visual.appendChild(box);
  }

  const cond = document.createElement('div');
  cond.className = 'panel';
  const h2 = document.createElement('h2');
  h2.textContent = '복원 계산';
  cond.appendChild(h2);

  const methodP = document.createElement('p');
  methodP.setAttribute('role', 'radiogroup');
  methodP.setAttribute('aria-label', '복원 방식');
  for (const [v, t] of [['simple', '단순 역투영'], ['iterative', '반복 재구성']] as const) {
    const label = document.createElement('label');
    label.style.display = 'block';
    label.style.margin = '6px 0';
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'method';
    radio.value = v;
    radio.checked = s.reconMethod === v;
    radio.disabled = s.reconRunning;
    radio.addEventListener('change', () => a.setMethod(v));
    label.append(radio, ` ${t}${v === 'simple' ? ' — 흐릿함을 확인하는 설명용' : ' — 목적함수 최소화, 최대 200회'}`);
    methodP.appendChild(label);
  }
  cond.appendChild(methodP);

  const lam = document.createElement('p');
  lam.className = 'hint num';
  lam.textContent = '정규화 λ = 0.001 (고정 예제 검증으로 확정, docs/02 참고), 걸음은 1/(‖A‖²+λ) 이하';
  cond.appendChild(lam);

  if (s.reconRunning) {
    const prog = document.createElement('div');
    prog.className = 'progress';
    prog.setAttribute('role', 'progressbar');
    prog.setAttribute('aria-valuemin', '0');
    prog.setAttribute('aria-valuemax', '200');
    prog.setAttribute('aria-valuenow', String(s.reconProgress));
    prog.setAttribute('aria-label', '반복 재구성 진행률');
    const bar = document.createElement('div');
    bar.style.width = `${Math.min(100, (s.reconProgress / 200) * 100)}%`;
    prog.appendChild(bar);
    const st = document.createElement('p');
    st.className = 'status-line';
    st.innerHTML = `상태: <strong>reconstructing</strong> · ${s.reconProgress}회`;
    if (s.reconObjective !== null) st.innerHTML += ` · 목적함수 <span class="num">${s.reconObjective.toFixed(5)}</span>`;
    cond.append(prog, st);
    const cancelRow = document.createElement('div');
    cancelRow.className = 'btn-row';
    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.className = 'btn btn-danger';
    cancel.textContent = '계산 취소 (마지막 완료 반복 보존)';
    cancel.addEventListener('click', () => a.abortRecon());
    cancelRow.appendChild(cancel);
    cond.appendChild(cancelRow);
  } else {
    if (s.error) {
      const err = document.createElement('p');
      err.className = 'error-text';
      err.setAttribute('role', 'alert');
      err.textContent = s.error;
      cond.appendChild(err);
    }
    const btnRow = document.createElement('div');
    btnRow.className = 'btn-row';
    const run = document.createElement('button');
    run.type = 'button';
    run.className = 'btn pulse';
    run.textContent = s.reconMethod === 'simple' ? '역투영 보기' : '반복 재구성 실행';
    run.disabled = s.scans.length === 0;
    run.addEventListener('click', () => a.runRecon());
    btnRow.appendChild(run);
    if (s.reconImage) {
      const toCompare = document.createElement('button');
      toCompare.type = 'button';
      toCompare.className = 'btn btn-ghost';
      toCompare.textContent = '비교로 이동';
      toCompare.addEventListener('click', () => a.goStage(3));
      btnRow.appendChild(toCompare);
    }
    cond.appendChild(btnRow);
    if (s.scans.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'hint';
      empty.textContent = '먼저 스캔 단계에서 각도를 재야 합니다. 빈 스캔으로는 복원할 수 없습니다.';
      cond.appendChild(empty);
    }
  }

  const back = document.createElement('div');
  back.className = 'btn-row';
  const bbtn = document.createElement('button');
  bbtn.type = 'button';
  bbtn.className = 'btn btn-ghost';
  bbtn.textContent = '스캔으로 돌아가기';
  bbtn.addEventListener('click', () => a.goStage(1));
  back.appendChild(bbtn);
  cond.appendChild(back);

  host.append(visual, cond);
}
