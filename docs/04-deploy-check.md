# 04. 배포 점검 — 공개 배포 확인

작성일: 2026-09-16. 상태: GitHub Pages 공개 완료. 코드 커밋 `1864f6ebb59e11b7551f51e913f09212b6185dc5`.

## 최종 게이트 (전부 통과)

- `npx tsc --noEmit` 통과.
- `npx vitest run` 13/13 통과 (엔진 12 + λ 고정 1).
- `npm run build` 통과 → `dist/` 산출.
- `impeccable detect` clean.
- 하위 경로 서빙 검증: `dist/`를 `/sub/`에 복사해 `python http.server`로 게시,
  타이틀·외관(180px)·실패 리소스 0건·스캔→예산 11·반복 재구성(잔차 0.0470, 185회) 확인.
  에셋 URL이 전부 상대 경로(`./`)라 저장소 하위 경로에서도 깨지지 않는다.

## 배포 절차 (정적 호스팅 공통)

1. `npm run build`
2. `dist/` 통째로 게시 (루트 또는 하위 경로 모두 가능).
3. 아래 확인 항목을 직접 클릭해 검증한다.

## 공개 확인 항목 (원칙 §6-6,7)

- [x] 공개 URL: https://wbmaker2.github.io/tomography-reconstruction-lab/
- [x] 하위 경로 에셋: 외관 3종·도입 카드 3종·파비콘 표시 확인(외관 180px, 실패 리소스 0).
- [x] 한 학습 흐름 완주: 예측 → 스캔(예산 차감 확인) → 반복 재구성. 전이·공개·기록 저장은 로컬 검증済, 공개 URL에서 동일 코드이므로 동일 동작.
- [x] 공개 URL 실제 완주: 후보 갑 → 30° 스캔(예산 12→11) → 반복 재구성(잔차 0.0470, 185회) → 비교 전이 → 정답 공개(RMSE 0.2850).
- [ ] HVC 확인용 주소: (미정 — HVC 등록은 별도 범위)
- [ ] 수동 확인 3종: Canvas 차단 시 표 대체, 저장소 차단 시 JSON 폴백, 실제 기기 360px.

## 배포 주소·HVC 링크

- 배포 주소: https://wbmaker2.github.io/tomography-reconstruction-lab/ (GitHub Pages, main 푸시 시 자동 배포)
- 레포지토리: https://github.com/WBmaker2/tomography-reconstruction-lab
- Actions 실행: https://github.com/WBmaker2/tomography-reconstruction-lab/actions/runs/35038114294
- HVC 확인용: (미정 — 승인 후 기입)
- HVC 등록과 공개 갤러리 동기화는 별도 범위다.
