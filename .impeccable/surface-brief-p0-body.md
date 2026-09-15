# Surface brief — P0 첫 표면 (밀봉상자→스캔→복원→비교→공개)

Scope: P0 단일 흐름 5화면. 밀봉 상자, 스캔, 복원, 비교, 공개. 32×32, 검출기 48, 예산 12회, 단순 역투영+반복 재구성.
Visitor mode: Operate — 방문자는 측정을 계획·실행하고 잔차를 읽는 과업을 완수한다.
Audience/job/action: 중·고등 학생이 25분 안에 각도 선택 근거를 말하고, 두 복원 방식 차이와 남은 오차를 설명한다. 교사도 동일 UI로 진행한다.
Proof/content: 실제 광선-격자 엔진의 투영값·잔차·RMSE(공개 후), seed 재현. 외관 3D 없음, P0 도입 카드 텍스트로 대체.
Constraints: 밝은 한국어 UI 첫 화면 질문 하나+시작 하나. 320·360·768·1280. 드래그 대체조작, 키보드·다이얼로그 복귀, reduced-motion 정적 테두리, 색 단독구분 금지, 업데이트 내역 상시. 의료·인체·마스코트·과한 게이미피케이션 금지. VoiceOver 제외.

## Chosen direction — 밝은 검사실의 측량반 (ASSIGNED, seed 81c18c9b, FORM 3/7)

World: 낮의 학교 검사실. 에나멜 흰 벤치 위에 놓인 방위각 다이얼과 검출기 레일, 네이비 잉크 기록표, 황토색(ochre) 다이얼 링, 빨강은 밀봉·공개 스탬프에만 쓴다. Restrained 전략: 중성면 + 단일 액센트.
First viewport: 밀봉된 정육면체 상자(내부 암시 금지, 기하학 SVG 외관) + 질문 한 줄(“한 방향 그림자가 같으면 내부도 같을까?”) + 예측 기록(8×8 두 배열 선택) + 시작 버튼 하나에 gi-pulse. 다이얼은 잠긴 채로 보인다.
Visitor path: 예측 기록 → 다이얼 잠금 해제 → 예산 12 안에서 각도 스캔(기념비적 잔여 횟수) → 역투영 흐릿함 vs 반복 재구성 비교·잔차 → 공개 스탬프와 함께 정답·추정·차이 지도.
Signature interaction: 방위각 다이얼 — 드래그·숫자입력·버튼·방향키·프리셋(0°/90°·균등분산)이 모두 같은 의미. 디텐트(눈금 걸림) 감각과 트리거-고정 판독.
Cross-surface reach: 다이얼·검출기 레일·기록표·스탬프 어휘가 5화면 전체와 여정 트레일·수직 절차 레일에 통한다.
Honest risk: 계측기 감성이 차갑게 읽힐 수 있다 — 예측·근거 기록의 손글씨적 기록표 질감과 교실 말투 카피로 데운다.
Memorable moment: 예산 12가 다이얼 중앙에 크게 새겨지고, 스캔할 때마다 하나씩 찍히는 검사 도장.
Raises (donor → line): HyperCard → 여정 트레일(되돌아가기가 정확한 궤적을 밟는다). Oscilloscope → 트리거-고정 판독(고정된 검출기 수치를 자로 읽는다). Deep dive → 수직 절차 레일(한 축이 전 절차를 관통한다). Alphabet storm → 기념비적 잔여 횟수(숫자 하나가 물질처럼 크게). Parametric → 시드 배지(seed→팬텀 매핑을 명시해 reseeding을 보인다). Anime wall → 밀봉 프레임(공개 전 격리감을 프레임이 말한다).
Challenger verdicts: oscilloscope — competitive. parametric identity — competitive. hypercard/deep-dive/alphabet/anime — declined (위 raises로 흡수).
Standing exit: 카테고리 표준(밝은 ed-tech 대시보드: 사이드바+카드+차트)은 요청 시 곧바로, 멋 없이 정석대로.

## Direction contract

THESIS: 각도 선택이 곧 실험 설계다. 이 표면은 슬라이더 나열을 거부하고, 방위각 다이얼 하나가 예산·측정·잔차를 한 손에 쥐는 검사 의식을 만든다.
OWN-WORLD: 에나멜 흰 바탕(#F8FAFC), 네이비 잉크(#1E3A5F), 계측 블루(#2563EB), 황토 다이얼 링(#A16207), 스탬프 레드(격리 전용). 모눈·눈금·레일·도장 어휘. 본문 65–75ch, 숫자 tabular.
STORY: 방문자는 같은 그림자의 두 후보를 예측하고, 12번의 도장을 어디에 찍을지 계획하고, 흐릿한 역투영과 조여드는 반복 재구성을 잔차로 읽고, 공개 후 남은 오차를 말로 설명한다.
FIRST VIEWPORT: 상단 수직 절차 레일(5단계 중 1). 중앙 밀봉상자 외관. 질문 한 줄. 8×8 두 후보 선택. 시작 버튼(유일 gi-pulse). 다이얼은 잠김 표시. 우하단 업데이트 내역. 데스크톱은 상자|기록 병렬, 모바일은 상자→질문→예측→시작 적층.
FORM: grounded 7 중 3번 측량 방위각반, seed key 81c18c9b.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

Unresolved: λ 최종값(고정 예제 검증 후 확정), 배포 타깃(정적 호스팅 하위 경로), 외관·도입 이미지 6장(P0 제작 예정, 현재 텍스트·SVG 대체).
