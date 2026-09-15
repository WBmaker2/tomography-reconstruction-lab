/**
 * Detector schematic: SVG parallel rays across the square + detector rail,
 * always paired with the numeric table (spec: visualization failure must
 * keep angle/measurement comparison through tables).
 */
import type { Scan } from '../engine/types';

const NS = 'http://www.w3.org/2000/svg';

export function createDetectorView(): {
  el: HTMLElement;
  setScan(scan: Scan | null): void;
} {
  const el = document.createElement('div');
  el.className = 'detector';

  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 300 244');
  svg.setAttribute('role', 'img');
  svg.classList.add('detector-svg');
  el.appendChild(svg);

  const details = document.createElement('details');
  details.className = 'detector-table';
  const summary = document.createElement('summary');
  summary.textContent = '검출기 수치표 보기';
  details.appendChild(summary);
  const wrap = document.createElement('div');
  wrap.className = 'detector-table-wrap';
  details.appendChild(wrap);
  el.appendChild(details);

  function paintSchematic(angleDeg: number, count: number): void {
    svg.innerHTML = '';
    svg.setAttribute('aria-label', `투영 각도 ${angleDeg.toFixed(1)}도의 광선과 검출기 배치도`);
    // Clip must be (re)created here: innerHTML='' above wipes earlier defs.
    const defs = document.createElementNS(NS, 'defs');
    const clip = document.createElementNS(NS, 'clipPath');
    clip.setAttribute('id', 'det-square-clip');
    const clipRect = document.createElementNS(NS, 'rect');
    clipRect.setAttribute('x', '70');
    clipRect.setAttribute('y', '35');
    clipRect.setAttribute('width', '140');
    clipRect.setAttribute('height', '140');
    clip.appendChild(clipRect);
    defs.appendChild(clip);
    svg.appendChild(defs);
    // Domain square centered at (140,105), half-size 70.
    const cx = 140;
    const cy = 105;
    const half = 70;
    const rect = document.createElementNS(NS, 'rect');
    rect.setAttribute('x', String(cx - half));
    rect.setAttribute('y', String(cy - half));
    rect.setAttribute('width', String(half * 2));
    rect.setAttribute('height', String(half * 2));
    rect.setAttribute('class', 'det-square');
    svg.appendChild(rect);
    const th = (angleDeg * Math.PI) / 180;
    const dx = Math.cos(th);
    const dy = Math.sin(th);
    const nx = -Math.sin(th);
    const ny = Math.cos(th);
    // A few representative rays across the rail, clipped to the square.
    const rays = document.createElementNS(NS, 'g');
    rays.setAttribute('clip-path', 'url(#det-square-clip)');
    for (let k = 0; k < count; k += 4) {
      const s = (-Math.SQRT2 + ((k + 0.5) * (2 * Math.SQRT2)) / count) * (half / Math.SQRT2);
      const ox = cx + s * nx;
      const oy = cy + s * ny;
      const line = document.createElementNS(NS, 'line');
      line.setAttribute('x1', String(ox - dx * 110));
      line.setAttribute('y1', String(oy - dy * 110));
      line.setAttribute('x2', String(ox + dx * 110));
      line.setAttribute('y2', String(oy + dy * 110));
      line.setAttribute('class', 'det-ray');
      rays.appendChild(line);
    }
    svg.appendChild(rays);
    // Detector rail: segment along the detector axis n, downstream of center.
    const rx = cx + 95 * dx;
    const ry = cy + 95 * dy;
    const span = half; // s in [-sqrt2, sqrt2] maps onto [-half, half].
    for (let k = 0; k < count; k++) {
      const s = -Math.SQRT2 + ((k + 0.5) * (2 * Math.SQRT2)) / count;
      const u = (s / Math.SQRT2) * span;
      const px = rx + u * nx;
      const py = ry + u * ny;
      const tick = document.createElementNS(NS, 'line');
      tick.setAttribute('x1', String(px - 4 * dx));
      tick.setAttribute('y1', String(py - 4 * dy));
      tick.setAttribute('x2', String(px + 4 * dx));
      tick.setAttribute('y2', String(py + 4 * dy));
      tick.setAttribute('class', 'det-tick');
      svg.appendChild(tick);
    }
    const cap = document.createElementNS(NS, 'text');
    cap.setAttribute('x', String(cx));
    cap.setAttribute('y', '234');
    cap.setAttribute('text-anchor', 'middle');
    cap.setAttribute('class', 'det-cap');
    cap.textContent = `θ ${angleDeg.toFixed(1)}° · 검출기 ${count}개`;
    svg.appendChild(cap);
  }

  function setScan(scan: Scan | null): void {
    wrap.innerHTML = '';
    if (!scan) {
      svg.innerHTML = '';
      const t = document.createElementNS(NS, 'text');
      t.setAttribute('x', '150');
      t.setAttribute('y', '110');
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('class', 'det-cap');
      t.textContent = '아직 측정이 없습니다. 각도를 정하고 스캔하세요.';
      svg.appendChild(t);
      svg.setAttribute('aria-label', '아직 측정이 없습니다.');
      return;
    }
    paintSchematic(scan.angleDeg, scan.values.length);
    const table = document.createElement('table');
    const cap = document.createElement('caption');
    cap.textContent = `θ ${scan.angleDeg.toFixed(1)}° 검출기 측정값 (σ=${scan.noiseSigma}, seed ${scan.seed})`;
    table.appendChild(cap);
    const thead = document.createElement('thead');
    const hr = document.createElement('tr');
    for (const h of ['검출기', '좌표 s', '측정값']) {
      const th = document.createElement('th');
      th.scope = 'col';
      th.textContent = h;
      hr.appendChild(th);
    }
    thead.appendChild(hr);
    table.appendChild(thead);
    const tb = document.createElement('tbody');
    scan.values.forEach((v, k) => {
      const tr = document.createElement('tr');
      const tdK = document.createElement('td');
      tdK.textContent = String(k);
      const tdS = document.createElement('td');
      tdS.textContent = scan.detectorCoordinates[k].toFixed(3);
      const tdV = document.createElement('td');
      tdV.textContent = v.toFixed(4);
      tr.append(tdK, tdS, tdV);
      tb.appendChild(tr);
    });
    table.appendChild(tb);
    wrap.appendChild(table);
  }

  setScan(null);
  return { el, setScan };
}
