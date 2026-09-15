/**
 * Density map: canvas rendering + legend with numeric labels + stats text.
 * Color never stands alone: every map ships min/mean/max readouts and a
 * <details> grid table fallback (also the automatic fallback when canvas
 * 2D is unavailable, per WebGL-failure spec).
 */
import { mean } from '../engine/reconstruction';

export type MapKind = 'density' | 'difference';

function colorFor(v: number, kind: MapKind): [number, number, number] {
  const t = Math.min(1, Math.max(0, v));
  if (kind === 'difference') {
    // white -> stamp red ramp for error magnitude.
    return [255 - Math.round(t * (255 - 185)), 255 - Math.round(t * (255 - 28)), 255 - Math.round(t * (255 - 28))];
  }
  // white -> measurement blue -> lab navy ramp for model density.
  if (t < 0.5) {
    const u = t / 0.5;
    return [
      Math.round(255 - u * (255 - 219)),
      Math.round(255 - u * (255 - 234)),
      Math.round(255 - u * (255 - 254)),
    ];
  }
  const u = (t - 0.5) / 0.5;
  return [
    Math.round(219 - u * (219 - 30)),
    Math.round(234 - u * (234 - 58)),
    Math.round(254 - u * (254 - 95)),
  ];
}

export interface DensityMap {
  el: HTMLElement;
  setImage(image: Float64Array, gridN: number): void;
}

export function canvas2dAvailable(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!c.getContext('2d');
  } catch {
    return false;
  }
}

export function createDensityMap(opts: {
  title: string;
  kind?: MapKind;
  scaleNote: string;
}): DensityMap {
  const { title, kind = 'density', scaleNote } = opts;
  const el = document.createElement('figure');
  el.className = 'map';

  const cap = document.createElement('figcaption');
  cap.className = 'map-title';
  cap.textContent = title;
  el.appendChild(cap);

  const useCanvas = canvas2dAvailable();
  let canvas: HTMLCanvasElement | null = null;
  if (useCanvas) {
    canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    canvas.className = 'map-canvas';
    canvas.setAttribute('role', 'img');
    el.appendChild(canvas);
  }

  const legend = document.createElement('div');
  legend.className = 'map-legend';
  legend.setAttribute('aria-hidden', 'true');
  legend.innerHTML = `<span>0</span><span class="map-legend-bar map-legend-bar-${kind}"></span><span>1</span>`;
  el.appendChild(legend);

  const stats = document.createElement('p');
  stats.className = 'map-stats';
  el.appendChild(stats);

  const note = document.createElement('p');
  note.className = 'map-note';
  note.textContent = scaleNote;
  el.appendChild(note);

  const details = document.createElement('details');
  details.className = 'map-table';
  const summary = document.createElement('summary');
  summary.textContent = useCanvas ? '격자 수치표로 보기' : '격자 수치표 (대체 화면)';
  details.appendChild(summary);
  const tableWrap = document.createElement('div');
  tableWrap.className = 'map-table-wrap';
  details.appendChild(tableWrap);
  el.appendChild(details);

  let current: Float64Array = new Float64Array(0);
  let currentN = 0;

  function paint(): void {
    if (current.length === 0) {
      stats.textContent = '아직 영상이 없습니다.';
      return;
    }
    let lo = Infinity;
    let hi = -Infinity;
    for (const v of current) {
      if (v < lo) lo = v;
      if (v > hi) hi = v;
    }
    stats.textContent = `최소 ${lo.toFixed(3)} · 평균 ${mean(current).toFixed(3)} · 최대 ${hi.toFixed(3)} (무차원 모형 밀도)`;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const cell = 256 / currentN;
        for (let iy = 0; iy < currentN; iy++) {
          for (let ix = 0; ix < currentN; ix++) {
            const [r, g, b] = colorFor(current[iy * currentN + ix], kind);
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fillRect(Math.floor(ix * cell), Math.floor(iy * cell), Math.ceil(cell), Math.ceil(cell));
          }
        }
        canvas.setAttribute(
          'aria-label',
          `${title}. 최소 ${lo.toFixed(2)}, 평균 ${mean(current).toFixed(2)}, 최대 ${hi.toFixed(2)}.`,
        );
      }
    }
    // Grid color table: numbers + swatches together, never color alone.
    tableWrap.innerHTML = '';
    const table = document.createElement('table');
    const capEl = document.createElement('caption');
    capEl.textContent = `${title} 격자 수치 (행 ${currentN}×열 ${currentN})`;
    table.appendChild(capEl);
    const tb = document.createElement('tbody');
    const stride = currentN > 16 ? 2 : 1;
    for (let iy = 0; iy < currentN; iy += stride) {
      const tr = document.createElement('tr');
      for (let ix = 0; ix < currentN; ix += stride) {
        const v = current[iy * currentN + ix];
        const td = document.createElement('td');
        const [r, g, b] = colorFor(v, kind);
        td.style.background = `rgb(${r},${g},${b})`;
        td.textContent = v.toFixed(stride > 1 ? 1 : 2);
        td.title = `(${ix},${iy}) ${v.toFixed(3)}`;
        tr.appendChild(td);
      }
      tb.appendChild(tr);
    }
    table.appendChild(tb);
    tableWrap.appendChild(table);
    if (stride > 1) {
      const p = document.createElement('p');
      p.className = 'map-note';
      p.textContent = '넓은 격자는 두 칸씩 묶어 표시합니다. 정확한 값은 JSON 내보내기로 확인하세요.';
      tableWrap.appendChild(p);
    }
  }

  return {
    el,
    setImage(image: Float64Array, gridN: number): void {
      current = Float64Array.from(image);
      currentN = gridN;
      paint();
    },
  };
}
