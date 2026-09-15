---
name: 보이지 않는 내부 복원소
description: 밝은 검사실의 측량반 — 제한 투영으로 2D 내부를 복원하는 25분 탐구 실험실
colors:
  enamel-bg: "#f8fafc"
  card: "#ffffff"
  ink: "#0f172a"
  ink-soft: "#334155"
  muted: "#e9eef5"
  muted-ink: "#475569"
  line: "#cbd5e1"
  lab-navy: "#1e3a5f"
  measure-blue: "#2563eb"
  measure-wash: "#eff6ff"
  dial-ochre: "#a16207"
  dial-wash: "#fef3c7"
  seal-red: "#b91c1c"
  ok-green: "#166534"
  sky-wash: "#dbeafe"
typography:
  display:
    fontFamily: "Pretendard, Noto Sans KR, Apple SD Gothic Neo, Segoe UI, sans-serif"
    fontSize: "1.3rem"
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Pretendard, Noto Sans KR, Apple SD Gothic Neo, Segoe UI, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "normal"
  title:
    fontFamily: "Pretendard, Noto Sans KR, Apple SD Gothic Neo, Segoe UI, sans-serif"
    fontSize: "1.35rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  section:
    fontFamily: "Pretendard, Noto Sans KR, Apple SD Gothic Neo, Segoe UI, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "-0.02em"
  field:
    fontFamily: "Pretendard, Noto Sans KR, Apple SD Gothic Neo, Segoe UI, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  control:
    fontFamily: "Pretendard, Noto Sans KR, Apple SD Gothic Neo, Segoe UI, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "normal"
  hint:
    fontFamily: "Pretendard, Noto Sans KR, Apple SD Gothic Neo, Segoe UI, sans-serif"
    fontSize: "0.92rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  meta:
    fontFamily: "Pretendard, Noto Sans KR, Apple SD Gothic Neo, Segoe UI, sans-serif"
    fontSize: "0.9rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  note:
    fontFamily: "Pretendard, Noto Sans KR, Apple SD Gothic Neo, Segoe UI, sans-serif"
    fontSize: "0.88rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  small:
    fontFamily: "Pretendard, Noto Sans KR, Apple SD Gothic Neo, Segoe UI, sans-serif"
    fontSize: "0.85rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  tiny:
    fontFamily: "Pretendard, Noto Sans KR, Apple SD Gothic Neo, Segoe UI, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  gridnum:
    fontFamily: "Pretendard, Noto Sans KR, Apple SD Gothic Neo, Segoe UI, sans-serif"
    fontSize: "0.7rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  dialnum:
    fontFamily: "Pretendard, Noto Sans KR, Apple SD Gothic Neo, Segoe UI, sans-serif"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "normal"
  readout:
    fontFamily: "Pretendard, Noto Sans KR, Apple SD Gothic Neo, Segoe UI, sans-serif"
    fontSize: "22px"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "normal"
  detcap:
    fontFamily: "Pretendard, Noto Sans KR, Apple SD Gothic Neo, Segoe UI, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "normal"
  monument:
    fontFamily: "Pretendard, Noto Sans KR, Apple SD Gothic Neo, Segoe UI, sans-serif"
    fontSize: "3rem"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "normal"
  compact:
    fontFamily: "Pretendard, Noto Sans KR, Apple SD Gothic Neo, Segoe UI, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  question-sm:
    fontFamily: "Pretendard, Noto Sans KR, Apple SD Gothic Neo, Segoe UI, sans-serif"
    fontSize: "1.15rem"
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: "-0.02em"
rounded:
  card: "14px"
  control: "12px"
  field: "10px"
  tag: "6px"
  meter: "5px"
  pill: "999px"
spacing:
  panel: "22px"
  gap: "20px"
  stack: "12px"
components:
  button-primary:
    backgroundColor: "{colors.lab-navy}"
    textColor: "{colors.card}"
    rounded: "{rounded.control}"
    padding: "12px 22px"
  button-ghost:
    backgroundColor: "{colors.card}"
    textColor: "{colors.lab-navy}"
    rounded: "{rounded.control}"
    padding: "8px 14px"
  card-panel:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "{spacing.panel}"
  seal-stamp:
    backgroundColor: "rgba(185, 28, 28, 0.05)"
    textColor: "{colors.seal-red}"
    rounded: "6px"
    padding: "4px 14px 4px 18px"
---

## Overview

밝은 낮 교실을 전제로 한 Operate 표면. 에나멜 흰 벤치 위에 방위각 다이얼과 검출기 레일, 네이비 잉크 기록표, 황토 다이얼 링을 올리고 빨강은 밀봉·공개 스탬프에만 쓴다. Restrained 전략(중성면 + 단일 액센트). 첫 화면은 질문 하나와 시작 버튼 하나.

## Colors

- 바닥은 에나멜 흰색, 카드는 흰색에 1px 라인 테두리. 그림자는 쓰지 않는다.
- 잉크는 랩 네이비 계열, 본문 보조 텍스트는 라인 색에서 직접 따온 회색이 아니라 뮤트 잉크.
- 계측 블루는 광선·진행·수치 강조에만, 황토는 다이얼 링·예산 기념비·gi-pulse 아우라에만, 스탬프 레드는 격리(미공개/공개) 상태에만 쓴다.
- 밀도 지도는 흰→계측 블루→랩 네이비 단일 색상 램프, 차이 지도는 흰→스탬프 레드. 모든 지도에 수치 범례와 최소·평균·최대 텍스트를 함께 둔다.

## Typography

- 한글 본문은 시스템 한글 스택(Pretendard/Noto Sans KR 우선). 학술 세리프(Crimson/EB Garamond)는 한글 커버리지가 없어 Operate 표면에서 쓰지 않는다.
- 측량 숫자는 전부 tabular-nums. 다이얼 판독·예산 기념비·잔차는 굵은 숫자로 물질처럼 크게 보여준다.
- 본문 행길이 65–75ch, 제목은 -0.02em 자간. 기호 ≤/≥는 한글 글꼴 폴백이 깨지므로 "이상/이하" 말로 쓴다.

## Layout

- 절차 레일(5단계)이 상단에 있고 현재 단계만 네이비로 채운다. 잠긴 단계는 비활성화한다.
- 데스크톱은 시각 패널과 조건 패널을 7:5로 나란히, 900px 아래에서는 시각→조건→실행→결과 순으로 쌓는다. 320px에서도 가로 넘침이 없다.
- 제목 위에는 작게 띄우고 아래는 좁게 둔다. 관련 요소는 모으고 단계 사이는 넓게 뗀다.

## Elevation & Depth

- 깊이는 테두리로만 말한다(1px 라인 카드). 오프셋·블러 그림자는 쓰지 않는다.
- 콜아웃(잔차 상자)은 전역 1px 계측 블루 테두리 + 옅은 블루 바탕. 측면 강조 테두리는 쓰지 않는다.
- gi-pulse 아우라는 한 화면에 하나의 버튼에만 걸고 reduced-motion에서는 정적 황토 테두리로 바뀐다.

## Shapes

- 카드 14px, 버튼 12px, 입력 10px, 칩·배지는 pill. 각도 칩의 평균용은 점선 테두리로 새 각도와 구분한다.
- 스탬프는 이중 테두리에 -6도 기울기. 다이얼은 황토 링 + 네이비 눈금 + 빨강 바늘.

## Components

- 방위각 다이얼: SVG role=slider, 5도 눈금·15도 굵은 눈금·30도 숫자, 드래그·숫자입력·±1도 버튼·방향키·프리셋이 모두 같은 값이다. 0~179.9도.
- 예산 기념비: 남은 횟수를 크게, 완료된 스캔만 차감한다는 문구를 함께 둔다.
- 밀도 지도: 캔버스 + 0~1 범례 + 통계 텍스트 + 격자 수치표 details. 캔버스 2D가 없으면 수치표가 대체 화면이 된다.
- 검출기 도식: 정사각형에 클립된 평행 광선 + 검출기 레일 눈금 + 각도 캡션, 항상 48행 수치표와 짝을 이룬다.
- 기록: 예측·조건·결과·해석을 구분하는 입력, 여정 트레일은 절차 레일이 맡는다.

## Do's and Don'ts

- 복원 이미지를 실제 사진처럼 말하지 않는다. 잔차 상자에는 항상 "작은 잔차가 정답을 뜻하지 않는다"는 문장을 함께 둔다.
- RMSE 값은 공개 화면에서만 보여준다. 공개 전에는 잔차와 측정 계획만 비교한다.
- 색만으로 상태를 말하지 않는다(범례·수치·모양 병행). 의료 영상·인체·마스코트·과한 게이미피케이션은 금지.
- 외관(밀봉 상자)은 내부를 암시하지 않는다. 내부 정답·투영·차이 지도는 엔진으로만 만든다.
