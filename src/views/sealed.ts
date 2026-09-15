/** Stage 0 — 밀봉 상자: 질문 하나, 예측 기록 하나, 시작 버튼 하나. */
import { introPair8 } from '../engine/phantom';
import type { Actions, AppState } from '../state';

const NS = 'http://www.w3.org/2000/svg';

const EXTERIORS = ['exterior-cube.svg', 'exterior-canister.svg', 'exterior-crate.svg'];

/** Exterior picked by seed only — never by phantom, so it cannot hint the interior. */
export function exteriorForSeed(seed: number): string {
  return EXTERIORS[((seed % EXTERIORS.length) + EXTERIORS.length) % EXTERIORS.length];
}

function sealedFigure(seed: number): HTMLElement {
  const fig = document.createElement('div');
  fig.className = 'sealed-figure';
  const img = document.createElement('img');
  img.src = `${import.meta.env.BASE_URL}assets/${exteriorForSeed(seed)}`;
  img.alt = '밀봉된 상자 외관. 내부는 보이지 않습니다.';
  img.width = 300;
  img.addEventListener('error', () => {
    img.remove();
    fig.appendChild(sealedBoxSvg());
  });
  fig.appendChild(img);
  return fig;
}

const INTRO_CARDS = [
  { file: 'intro-predict.svg', caption: '예측하기 — 답 보기 전 짧게 기록' },
  { file: 'intro-scan.svg', caption: '재기 — 각도를 정하고 12회 안에' },
  { file: 'intro-reveal.svg', caption: '공개하고 설명하기 — 남은 오차까지' },
];

function introCards(): HTMLElement {
  const wrap = document.createElement('div');
  wrap.className = 'intro-cards';
  for (const c of INTRO_CARDS) {
    const fig = document.createElement('figure');
    fig.className = 'intro-card';
    const img = document.createElement('img');
    img.src = `${import.meta.env.BASE_URL}assets/${c.file}`;
    img.alt = '';
    img.width = 220;
    const cap = document.createElement('figcaption');
    cap.textContent = c.caption;
    fig.append(img, cap);
    wrap.appendChild(fig);
  }
  return wrap;
}

function sealedBoxSvg(): SVGSVGElement {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 240 200');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', '밀봉된 정육면체 상자 외관. 내부는 보이지 않습니다.');
  // Isometric cube exterior only — no interior hints, no text inside.
  const top = document.createElementNS(NS, 'polygon');
  top.setAttribute('points', '120,18 208,62 120,106 32,62');
  top.setAttribute('fill', '#e9eef5');
  top.setAttribute('stroke', '#1e3a5f');
  top.setAttribute('stroke-width', '3');
  const left = document.createElementNS(NS, 'polygon');
  left.setAttribute('points', '32,62 120,106 120,188 32,144');
  left.setAttribute('fill', '#ffffff');
  left.setAttribute('stroke', '#1e3a5f');
  left.setAttribute('stroke-width', '3');
  const right = document.createElementNS(NS, 'polygon');
  right.setAttribute('points', '208,62 120,106 120,188 208,144');
  right.setAttribute('fill', '#cbd5e1');
  right.setAttribute('stroke', '#1e3a5f');
  right.setAttribute('stroke-width', '3');
  // Sealing tape bands.
  const tape1 = document.createElementNS(NS, 'polygon');
  tape1.setAttribute('points', '104,26 136,26 136,180 104,180');
  tape1.setAttribute('fill', 'none');
  tape1.setAttribute('stroke', '#a16207');
  tape1.setAttribute('stroke-width', '5');
  tape1.setAttribute('opacity', '0.85');
  svg.append(top, left, right, tape1);
  return svg;
}

function miniGrid(grid: number[][], title: string, pressed: boolean, onPick: () => void): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'choice';
  btn.setAttribute('aria-pressed', String(pressed));
  btn.setAttribute('aria-label', `${title} 후보 선택`);
  const strong = document.createElement('strong');
  strong.textContent = title;
  const table = document.createElement('table');
  table.setAttribute('aria-hidden', 'true');
  const tb = document.createElement('tbody');
  for (const row of grid) {
    const tr = document.createElement('tr');
    for (const v of row) {
      const td = document.createElement('td');
      if (v === 1) td.className = 'on';
      tr.appendChild(td);
    }
    tb.appendChild(tr);
  }
  table.appendChild(tb);
  btn.append(strong, table);
  btn.addEventListener('click', onPick);
  return btn;
}

export function renderSealed(host: HTMLElement, s: AppState, a: Actions): void {
  const visual = document.createElement('div');
  visual.className = 'panel';
  const fig = sealedFigure(s.seed);
  const stampRow = document.createElement('p');
  stampRow.style.textAlign = 'center';
  const stamp = document.createElement('span');
  stamp.className = 'stamp';
  stamp.textContent = '미공개';
  stampRow.appendChild(stamp);
  const phantomLine = document.createElement('p');
  phantomLine.className = 'hint';
  phantomLine.textContent = `표본 ${s.phantomId === 'circle' ? '원형' : '직사각형'} · 격자 32×32 · 외관은 내부를 암시하지 않습니다.`;
  visual.append(fig, stampRow, phantomLine);

  const cond = document.createElement('div');
  cond.className = 'panel';
  const h = document.createElement('h2');
  h.textContent = '밀봉 상자';
  const q = document.createElement('p');
  q.className = 'question';
  q.textContent = '한 방향에서 같은 그림자가 생기는 물체는 내부도 같을까?';
  const intro = document.createElement('p');
  intro.className = 'hint';
  intro.textContent =
    '아래 두 8×8 배열은 위에서 본 열 합이 완전히 같습니다. 어느 쪽이 상자 안에 있을지, 그리고 어떻게 구분할지 예측해 보세요.';
  cond.append(h, q, intro);
  cond.appendChild(introCards());

  const pair = introPair8();
  const row = document.createElement('div');
  row.className = 'choice-row';
  row.setAttribute('role', 'group');
  row.setAttribute('aria-label', '내부 후보 예측');
  row.append(
    miniGrid(pair.a, '후보 갑', s.prediction === 'A', () => a.setPrediction('A')),
    miniGrid(pair.b, '후보 을', s.prediction === 'B', () => a.setPrediction('B')),
  );
  cond.appendChild(row);

  const sums = document.createElement('p');
  sums.className = 'hint num';
  sums.textContent = `열 합(공통): ${pair.colSums.join(' · ')} — 한 방향 투영만으로는 구분할 수 없습니다.`;
  cond.appendChild(sums);

  const field = document.createElement('div');
  field.className = 'field';
  const label = document.createElement('label');
  label.htmlFor = 'pred-note';
  label.textContent = '구분 방법 예측 (짧게)';
  const note = document.createElement('input');
  note.type = 'text';
  note.id = 'pred-note';
  note.maxLength = 140;
  note.placeholder = '예: 옆에서 한 번 더 잰다';
  note.value = s.predictionNote;
  note.addEventListener('input', () => a.setPredictionNote(note.value));
  field.append(label, note);
  cond.appendChild(field);

  const mission = document.createElement('div');
  mission.className = 'field';
  const mlabel = document.createElement('label');
  mlabel.htmlFor = 'phantom-sel';
  mlabel.textContent = '표본 선택';
  const sel = document.createElement('select');
  sel.id = 'phantom-sel';
  for (const [v, t] of [['circle', '원형 표본'], ['rect', '직사각형 표본']] as const) {
    const o = document.createElement('option');
    o.value = v;
    o.textContent = t;
    if (s.phantomId === v) o.selected = true;
    sel.appendChild(o);
  }
  sel.addEventListener('change', () => a.setPhantom(sel.value as 'circle' | 'rect'));
  mission.append(mlabel, sel);
  cond.appendChild(mission);

  if (s.error) {
    const err = document.createElement('p');
    err.className = 'error-text';
    err.setAttribute('role', 'alert');
    err.textContent = s.error;
    cond.appendChild(err);
  }

  const btnRow = document.createElement('div');
  btnRow.className = 'btn-row';
  const startBtn = document.createElement('button');
  startBtn.type = 'button';
  startBtn.className = 'btn pulse';
  startBtn.textContent = '상자 열기 — 스캔 시작';
  startBtn.addEventListener('click', () => a.start());
  btnRow.appendChild(startBtn);
  cond.appendChild(btnRow);

  host.append(visual, cond);
}
