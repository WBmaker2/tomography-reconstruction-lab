# 00. 배포 직전(pre-deploy) 진행 계획

작성일: 2026-09-15. 대상: `tomography-reconstruction-lab` P0.
원칙 문서: `00-shared-design-principles.md` §6(검증과 완료 판정), `03-tomography-reconstruction-lab.md` §10.

## 단계와 산출물 (각 단계 = md 1건 + 코드 변경 + 검증)

| 단계 | md | 내용 | 완료 기준 |
|---|---|---|---|
| 1 | `docs/01-assets.md` | 외관 3종·도입 카드 3종 제작, 자산 레코드 | 에셋 표시 + 레코드 일치 + 용량 기록 |
| 2 | `docs/02-lambda-validation.md` | 고정 예제로 λ 확정 (0/0.001/0.01/0.1 비교) | λ 결정 + 테스트 코드로 고정 |
| 3 | `docs/03-quality-pass.md` | 키보드·reduced-motion·320px·오류/빈 상태·성능 수치 | 항목별 수치 기록, 결함 수정 |
| 4 | `docs/04-deploy-check.md` | 하위 경로 서빙 검증 + 배포 절차 + 승인 후 확인 항목 | `dist/` 하위 경로에서 에셋·기능 정상 |

## 공통 종료 조건 (배포 승인 전)

- `npx tsc --noEmit`, `npx vitest run`, `npm run build` 전부 통과.
- `impeccable detect` clean.
- 실제 변경만 업데이트 내역에 기록 (예정·목표 수치 금지).
- 배포 승인과 공개 URL 확인(원칙 §6-6,7)은 승인 후 별도 단계로 분리한다.
