/**
 * Angle dial: drag + tramo numeric field + buttons + arrow keys + presets
 * all mean the same thing. role=slider, detent snap at 1 degree,
 * numeric field allows 0.1 steps down to the 179.9 edge.
 */
export interface DialOptions {
  initial?: number;
  disabled?: boolean;
  onInput?: (deg: number) => void;
}

export interface Dial {
  el: HTMLElement;
  get(): number;
  set(deg: number): void;
  setDisabled(d: boolean): void;
}

export function normalizeAngle(deg: number): number {
  let v = deg % 180;
  if (v < 0) v += 180;
  if (v >= 180) v = 179.9;
  return Math.round(v * 10) / 10;
}

const NS = 'http://www.w3.org/2000/svg';

export function createDial(opts: DialOptions = {}): Dial {
  let value = normalizeAngle(opts.initial ?? 30);
  let disabled = !!opts.disabled;

  const wrap = document.createElement('div');
  wrap.className = 'dial-wrap';

  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 200 200');
  svg.setAttribute('role', 'slider');
  svg.setAttribute('tabindex', disabled ? '-1' : '0');
  svg.setAttribute('aria-label', '투영 각도 다이얼');
  svg.setAttribute('aria-valuemin', '0');
  svg.setAttribute('aria-valuemax', '179.9');
  svg.classList.add('dial');
  if (disabled) svg.setAttribute('aria-disabled', 'true');

  // Face.
  const face = document.createElementNS(NS, 'circle');
  face.setAttribute('cx', '100');
  face.setAttribute('cy', '100');
  face.setAttribute('r', '92');
  face.setAttribute('class', 'dial-face');
  svg.appendChild(face);

  // Ticks every 5 deg, major every 15, numerals every 30 (crowding guard).
  for (let a = 0; a < 180; a += 5) {
    const major = a % 15 === 0;
    const numbered = a % 30 === 0;
    const rad = ((a - 90) * Math.PI) / 180;
    const r1 = major ? 74 : 80;
    const r2 = 86;
    const line = document.createElementNS(NS, 'line');
    line.setAttribute('x1', String(100 + r1 * Math.cos(rad)));
    line.setAttribute('y1', String(100 + r1 * Math.sin(rad)));
    line.setAttribute('x2', String(100 + r2 * Math.cos(rad)));
    line.setAttribute('y2', String(100 + r2 * Math.sin(rad)));
    line.setAttribute('class', major ? 'dial-tick-major' : 'dial-tick');
    svg.appendChild(line);
    if (numbered) {
      const label = document.createElementNS(NS, 'text');
      label.setAttribute('x', String(100 + 62 * Math.cos(rad)));
      label.setAttribute('y', String(100 + 62 * Math.sin(rad) + 4));
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('class', 'dial-num');
      label.textContent = String(a);
      svg.appendChild(label);
    }
  }

  // Degree readout under the hub.
  const readout = document.createElementNS(NS, 'text');
  readout.setAttribute('x', '100');
  readout.setAttribute('y', '148');
  readout.setAttribute('text-anchor', 'middle');
  readout.setAttribute('class', 'dial-readout');
  svg.appendChild(readout);

  // Needle group (rotated).
  const needle = document.createElementNS(NS, 'g');
  const shaft = document.createElementNS(NS, 'line');
  shaft.setAttribute('x1', '100');
  shaft.setAttribute('y1', '100');
  shaft.setAttribute('x2', '100');
  shaft.setAttribute('y2', '26');
  shaft.setAttribute('class', 'dial-needle');
  const hub = document.createElementNS(NS, 'circle');
  hub.setAttribute('cx', '100');
  hub.setAttribute('cy', '100');
  hub.setAttribute('r', '10');
  hub.setAttribute('class', 'dial-hub');
  needle.appendChild(shaft);
  needle.appendChild(hub);
  svg.appendChild(needle);

  function paint(): void {
    needle.setAttribute('transform', `rotate(${value} 100 100)`);
    readout.textContent = `${value.toFixed(1)}°`;
    svg.setAttribute('aria-valuenow', String(value));
    svg.setAttribute('aria-valuetext', `투영 각도 ${value.toFixed(1)}도`);
  }

  function commit(v: number): void {
    if (disabled) return;
    value = normalizeAngle(v);
    paint();
    opts.onInput?.(value);
  }

  // Pointer drag: angle of pointer around hub, snapped to 1 deg detents.
  let dragging = false;
  function angleFromEvent(ev: PointerEvent): number {
    const rect = svg.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = ev.clientX - cx;
    const dy = ev.clientY - cy;
    const pointerDeg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    return Math.round(pointerDeg);
  }
  svg.addEventListener('pointerdown', (ev) => {
    if (disabled) return;
    dragging = true;
    svg.setPointerCapture(ev.pointerId);
    commit(angleFromEvent(ev));
  });
  svg.addEventListener('pointermove', (ev) => {
    if (!dragging || disabled) return;
    commit(angleFromEvent(ev));
  });
  svg.addEventListener('pointerup', () => {
    dragging = false;
  });
  svg.addEventListener('keydown', (ev) => {
    if (disabled) return;
    const big = ev.shiftKey ? 10 : 1;
    if (ev.key === 'ArrowRight' || ev.key === 'ArrowUp') {
      ev.preventDefault();
      commit(value + big);
    } else if (ev.key === 'ArrowLeft' || ev.key === 'ArrowDown') {
      ev.preventDefault();
      commit(value - big);
    } else if (ev.key === 'Home') {
      ev.preventDefault();
      commit(0);
    } else if (ev.key === 'End') {
      ev.preventDefault();
      commit(179.9);
    }
  });

  // Paired numeric field + step buttons (same meaning, per shared principles).
  const row = document.createElement('div');
  row.className = 'dial-row';
  const minus = document.createElement('button');
  minus.type = 'button';
  minus.className = 'btn btn-ghost';
  minus.textContent = '−1°';
  minus.setAttribute('aria-label', '각도 1도 감소');
  const input = document.createElement('input');
  input.type = 'number';
  input.min = '0';
  input.max = '179.9';
  input.step = '0.1';
  input.value = String(value);
  input.setAttribute('aria-label', '각도 직접 입력 (0부터 179.9도)');
  input.className = 'dial-input';
  const plus = document.createElement('button');
  plus.type = 'button';
  plus.className = 'btn btn-ghost';
  plus.textContent = '+1°';
  plus.setAttribute('aria-label', '각도 1도 증가');

  minus.addEventListener('click', () => commit(value - 1));
  plus.addEventListener('click', () => commit(value + 1));
  input.addEventListener('change', () => {
    const n = Number(input.value);
    if (!Number.isFinite(n)) {
      input.value = String(value);
      return;
    }
    commit(Math.min(179.9, Math.max(0, n)));
    input.value = String(value);
  });

  row.append(minus, input, plus);
  wrap.append(svg, row);
  paint();

  return {
    el: wrap,
    get: () => value,
    set: (deg: number) => {
      value = normalizeAngle(deg);
      input.value = String(value);
      paint();
    },
    setDisabled: (d: boolean) => {
      disabled = d;
      svg.setAttribute('tabindex', d ? '-1' : '0');
      if (d) svg.setAttribute('aria-disabled', 'true');
      else svg.removeAttribute('aria-disabled');
      input.disabled = d;
      minus.disabled = d;
      plus.disabled = d;
      wrap.classList.toggle('is-disabled', d);
    },
  };
}
