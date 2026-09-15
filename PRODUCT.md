# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Vite + TS (static web app, P0 single-surface build)

## Users

- Primary: 중학교 심화·고등학교 수학·과학·정보 학생. 25분 탐구 흐름을 직접 조작한다.
- Facilitator: 동일 UI를 쓰는 교사. 15~30분 활동 + 5분 정리로 운영한다.
- Scene answer: Both same UI — 학생 개별 탐구와 교사 주도 수업을 동일 UI로 지원, 별도 모드 분기 없음.

## Product Purpose

- 제한된 투영 측정으로 2D 내부 밀도 분포를 추정하는 과정을 체험한다.
- 한 방향 투영이 같아도 내부가 다를 수 있음을 이해한다.
- 측정 방향·횟수·잡음이 복원 품질에 미치는 영향을 비교한다.
- 복원 이미지를 실제 내부의 완벽한 사진으로 오해하지 않고, 잔차·오차·불확실성을 설명할 수 있게 한다.
- Success: 예산 안에서 각도 선택 근거를 말하고, 단순 역투영 vs 반복 재구성 차이와 남은 오차를 설명한다.

## Positioning

- 알려진 입체를 자르는 ‘차원 단면 박물관’과 달리, 모르는 내부를 측정값으로 추정한다.
- 지층 추론과 달리 선적분(y=Ax+ε)과 영상 재구성이 핵심이다.
- 계산과 오차를 검증 가능한 작은 격자(32×32, P0 무차원 모형 밀도)부터 시작한다.

## Operating Context

- 25분 흐름: 3분 예측(같은 열 합 8×8 두 배열 구분법) → 5분 0°·90° 투영 판독·후보 선택 → 5분 예산 12회 내 추가 각도 선택 → 7분 단순 역투영 vs 반복 재구성 비교·잔차 → 5분 정답 공개·남은 오차 설명. 전이: 12회를 좁은 각도에 몰기 vs 고르게 분산 비교.
- Screens: 밀봉 상자(외관·가설·예측 기록) → 스캔(각도·검출기 값·남은 횟수) → 복원(내부 추정·측정 잔차) → 비교(각도 목록·오차·후보) → 공개(정답·추정·차이 지도·근거 기록).
- States: idle → measuring → measured → reconstructing → review. 예산은 스캔 완료 시에만 소비. 동일 각도 반복은 잡음 평균 실험에서만 허용하고 새 각도와 의미를 구분 표시. 취소 시 마지막 완료 반복 결과 보존. 정답 공개 후 해당 미션은 평가용 재사용 금지.

## Capabilities and Constraints

- P0 only (confirmed): 원·직사각형 팬텀, 32×32, 각도 선택, 두 복원 방식, 예산, 공개 후 차이. P1(64×64·정규화 비교·단층 3D 적층·필터 역투영)은 범위 밖.
- Model: 영역 [-1,1]×[-1,1] 모형 길이 단위, 32×32 픽셀, 밀도 x∈[0,1]. 검출기 48개, θ∈[0,180)°, 미션당 2~24회(본 흐름 예산 12회). y=ΣA·x+ε, A는 광선-픽셀 통과 길이. P0는 로그 변환 후 이상화된 선적분, 광자 감쇠·산란·검출기 보정 제외. ε는 seed 기반 평균 0 가우스, σ=0/0.01/0.03. 음수 원자료 보존, 화면 색 범위≠데이터 범위.
- Reconstruction: 설명용 단순 역투영(Aᵀy 누적, 흐릿함, 정량값 아님) + 반복 복원 min 0.5||Ax-y||²+0.5λ||x||², 0≤x≤1, 투영 경사하강, 경사 Aᵀ(Ax-y)+λx, step≤1/(||A||²+λ), 노름은 power iteration+안전 여유, 최대 200회·상대 목적함수 변화 조기 종료, λ=0.001 확정(고정 예제 검증, docs/02). 측정 오차≠영상 오차. 공개 전 RMSE 금지, 잔차·측정 계획만 표시. 공개 후 RMSE=√mean((est-truth)²).
- UI constraints (from 00-shared): 밝은 한국어 UI, 첫 화면 질문 하나+시작 버튼 하나. 미션·실험·비교·기록 구성. 320·360·768·1280px 흐름 검증, 데스크톱 병렬(시각+조건), 모바일 적층(시각→조건→실행→결과). 모든 드래그에 숫자 입력·버튼·방향키 대체. 키보드 포커스·다이얼로그 닫기/복귀 검증. gi-pulse 아우라는 중요 다음 행동 하나에만(스캔/비교 단계), reduced-motion은 정적 테두리. 색 단독 구분 금지(범례·텍스트·모양 병행). 작은 ‘업데이트 내역’ 버튼 상시 접근, 최초 개발일·개선일·설명만 실제 변경 때 기록. TTS·녹음·자동재생 오디오 없음.
- Engine constraints: 계산 엔진은 렌더러 분리 순수 함수(DOM·Three.js 의존 금지). 구조 engine/models/scenarios/views/assets/tests, 파일 500줄 전 분리. 모듈 rayGrid.ts, projector.ts, reconstruction.ts, phantom.ts, scanWorker.ts, ScanView.tsx, RevealView.tsx. 입력 유효범위·단위 명시, 범위 밖·NaN·무한대·중복 실행 차단. 재현 키 seed·engineVersion·scenarioVersion·입력·시행 수. 프레임 속도≠수치 시간 간격, 탭 숨김 시 계산 중단+재개 정책 명시. 무거운 계산 Worker 검토(취소·stale 무시·진행·재시도). WebGL 실패 시 SVG/Canvas/표 대체(지원 불가 기능 설명). localStorage는 비식별 실험 기록만, 불가 시 세션+JSON 내보내기. 기록 포맷 schemaVersion, appId, createdAt, scenarioId, parameters, seed, observations, prediction, explanation.
- Exclusions: 임상 진단·실제 장비 제어·임의 사진의 진짜 내부 추정 금지. 실제 의료 영상·인체 대상 금지. 외관 이미지가 내부 정답을 암시 금지. 내부 정답·투영·차이 지도는 엔진 생성. 클라이언트 정답은 보안 은닉이 아니라 공개 순서 제어.
- Undecided: 배포 타깃(정적 호스팅 하위 경로 검증 방법은 배포 승인 후 확정), λ 최종값(고정 예제 검증 후), P1 도입 시점.

## Brand Commitments

- App id: `tomography-reconstruction-lab`. Title: ‘보이지 않는 내부 복원소’.
- Voice: 밝은 교육용 한국어, 예측→조건→실행/관찰→근거 기록→재검증→전이 순서.
- Exterior 3D라도 복원 모델이 2D임을 명시 (P0). 가상 자료 vs 실제 관측 자료 구분 표시.
- Binding visual constraints volunteered: 없음 (미학적 방향은 init에서 묻지 않음).

## Evidence on Hand

- `./00-shared-design-principles.md` (공통 원칙, 2026-09-15, 구현 전 설계).
- `./03-tomography-reconstruction-lab.md` (앱 설계, 우선순위 3, P0/M1-M5 정의).
- Reference link (전문 검증 아님): NIST CT 기하 오차·재구성 연구 https://nvlpubs.nist.gov/nistpubs/jres/124/jres.124.014.pdf — 열람일·버전 별도 기록 필요.
- Absent (fabrication 금지): 구현 코드·측정 데이터·팬텀 정답셋·생성 이미지(P0 외관 3장·도입 카드 3장 미제작)·성능 측정치·수업 효과 수치. 모든 수량·오차·예산은 설계 목표.

## Product Principles

- 예측 먼저: 답을 보기 전 짧은 예측 기록이 모든 실행보다 앞선다.
- 조건·결과·해석 분리: 바뀐 조건을 이전 결과에 덮어쓰지 않는다.
- 불확실성 가시화: 잔차와 오차를 숨기지 않고, 작은 잔차≠정답 복원으로 가르친다.
- 작은 격자로 검증: 32×32에서 재현·수반·경계 케이스를 먼저 통과한다.
- 실패가 다음 수를 가르친다: 막힌 지점과 바꿀 조건을 알려주고 임의 성공 수치를 만들지 않는다.

## Accessibility & Inclusion

- Required: 키보드 완전 조작(각도 숫자 입력·버튼·방향키), 포커스 순서·다이얼로그 복귀, 모바일 가로 넘침 없음(320px~), reduced-motion 정적 대체, 오류 복구 경로, 2D 표 대체 화면으로 흐름 완료 가능.
- Color: 색 단독 의미 전달 금지, 범례+수치+모양 병행, 대비 4.5:1(본문) 목표.
- Excluded per scope: VoiceOver 구현·검증 제외. TTS·음성 녹음·자동 재생 없음. 이를 커버리지로 주장하지 않는다.
