/** Local persistence: experiment records only, never personal data. */
import { ExperimentRecord } from './types';

const RECORDS_KEY = 'trlab.records.v1';
const CHANGELOG_KEY = 'trlab.changelog.v1';

export interface ChangelogEntry {
  date: string;
  text: string;
}

export const INITIAL_CHANGELOG: ChangelogEntry[] = [
  { date: '2026-09-15', text: '최초 개발: P0 5화면(밀봉·스캔·복원·비교·공개)과 32×32 반복 재구성 흐름.' },
  { date: '2026-09-15', text: '수정: 다이얼 숫자 30도 간격, 검출기 캡션 겹침 해소, 광선 정사각형 클립, 부등호 말로 교체, 잔차 상식 전역 테두리로 변경.' },
  { date: '2026-09-15', text: '에셋: 자작 SVG 외관 3종·도입 카드 3종 추가. 외관은 seed로만 선택해 내부를 암시하지 않음.' },
  { date: '2026-09-15', text: '정규화 λ=0.001로 확정. 고정 예제 2종 검증 결과 0.01 후보를 기각함(docs/02).' },
  { date: '2026-09-15', text: '배포 준비: 파비콘·테마색 추가, 하위 경로 서빙 검증, 품질 패스 기록(docs/03·04).' },
  { date: '2026-09-16', text: '개선: 첫 화면 질문 위계, 스캔·비교만 gi-pulse, 25분 키커. 엔진·정답 공개 순서는 그대로.' },
];

function storageAvailable(): boolean {
  try {
    const k = '__trlab_probe__';
    localStorage.setItem(k, '1');
    localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

export function loadRecords(): ExperimentRecord[] {
  if (!storageAvailable()) return [];
  try {
    const raw = localStorage.getItem(RECORDS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as ExperimentRecord[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

/** Returns false when storage is unavailable (caller offers JSON export). */
export function saveRecord(rec: ExperimentRecord): boolean {
  if (!storageAvailable()) return false;
  try {
    const arr = loadRecords();
    arr.push(rec);
    localStorage.setItem(RECORDS_KEY, JSON.stringify(arr));
    return true;
  } catch {
    return false;
  }
}

export function loadChangelog(): ChangelogEntry[] {
  const base = INITIAL_CHANGELOG.slice();
  if (!storageAvailable()) return base;
  try {
    const raw = localStorage.getItem(CHANGELOG_KEY);
    if (!raw) return base;
    const extra = JSON.parse(raw) as ChangelogEntry[];
    return base.concat(Array.isArray(extra) ? extra : []);
  } catch {
    return base;
  }
}

export function downloadJson(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
