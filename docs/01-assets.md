# 01. 에셋 6종 — 외관 3종·도입 카드 3종

작성일: 2026-09-15. 상태: 완료(검증 포함).

## 결정: 생성 이미지 대신 자작 SVG

- `00-shared` 원칙은 image 2.5 모델 사용을 전제로 하나, 본 세션에는 이미지 생성 수단이 없다.
  조용히 대체하지 않기 위해 여기에 명시한다: P0 6종은 기하 SVG로 자작했다.
- 근거: 외관 조건이 "내부 투시·문자 없음, 일정한 시점"이라 기하 도형으로 충분히 만족한다.
  내부 정답·투영·차이 지도는 원칙대로 엔진이 만든다(생성 이미지 사용 안 함).
- 실제 의료 영상으로 보이지 않으며 사람 신체를 대상으로 하지 않는다(원칙 §8 준수).
- 용량: 전 파일 1KB 미만. 카드당 150KB 이하 목표를 여유 있게 만족한다.
- `dist/assets/` 복사 확인済. `base: './'` 상대 경로라 하위 경로 배포에서도 동작한다(§4에서 재검증).

## 외관 선택 규칙 (중요)

- 외관은 `seed % 3`으로만 고른다(`exteriorForSeed`, `src/views/sealed.ts`).
  표본(원/직사각형)과 무관하므로 외관이 내부를 암시할 수 없다.
- 이미지 로드 실패 시 인라인 SVG 정육면체로 대체된다(에셋 없어도 흐름 완료 가능).

## 자산 레코드

| id | purpose | modelUsed | semanticLabels | alt | dimensions | licenseNote | reviewStatus |
|---|---|---|---|---|---|---|---|
| exterior-cube | 밀봉 상자 외관 1 | authored-svg v1 | cube, tape, sealed | 밀봉된 상자 외관. 내부는 보이지 않습니다. | viewBox 240×200 | 자작, 권리 문제 없음 | 화면 확인済 |
| exterior-canister | 밀봉 상자 외관 2 | authored-svg v1 | canister, band, sealed | 밀봉된 원통 용기 외관 | viewBox 240×200 | 자작 | 화면 확인 예정(§3) |
| exterior-crate | 밀봉 상자 외관 3 | authored-svg v1 | crate, frame, sealed | 밀봉된 나무 상자 외관 | viewBox 240×200 | 자작 | 화면 확인 예정(§3) |
| intro-predict | 도입 카드: 예측 | authored-svg v1 | grid, record | 도입 카드: 예측하기 | viewBox 240×150 | 자작 | 화면 확인 예정(§3) |
| intro-scan | 도입 카드: 측정 | authored-svg v1 | dial, angle | 도입 카드: 측정하기 | viewBox 240×150 | 자작 | 화면 확인 예정(§3) |
| intro-reveal | 도입 카드: 공개 | authored-svg v1 | split, compare | 도입 카드: 공개하고 설명하기 | viewBox 240×150 | 자작 | 화면 확인 예정(§3) |

- promptVersion: 해당 없음(자작). referenceIds: 없음. 문자·수치는 이미지에 넣지 않고 별도 레이어(HTML)로 합성했다.
- 확장 24장(P1)은 범위 밖. MVP 6종으로 마감한다.

## 검증

- `npx tsc --noEmit` 통과, `npm run build` 통과, `dist/assets/` 6종 존재 확인.
- 화면 게시는 §3 품질 패스에서 데스크톱·모바일 캡처로 확인한다.
