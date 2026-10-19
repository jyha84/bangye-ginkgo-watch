# 다음 Codex 작업용 인수인계

## 프로젝트

- 이름: 반계리 지금 / Bangye Ginkgo Watch
- 운영 URL: https://bangye-ginkgo-watch.bzbone.chatgpt.site/
- 백업 기준 소스: `5bb300b3ced35881c2aa52d44eadc37ee4014b54`
- 운영 사이트는 공개 상태이며, 백업 저장소의 가시성과 별도로 관리합니다.
- 프런트엔드는 순수 HTML/CSS/JavaScript, 백엔드는 Worker ESM입니다.
- npm 런타임 의존성은 없고 브라우저에서 Three.js·HLS.js CDN을 읽습니다.

## 유지할 동작

1. CCTV가 재생되는 현재 연결·리다이렉트 처리와 서버 비밀값 보호.
2. 두 손가락 1~4배 확대, 확대 후 드래그 이동, 슬라이더와 초기화 연동.
3. 사진 색 분석과 근사 3D. 현장 단풍률·미래 예측으로 표시하지 않기.
4. 낙엽 효과 on/off와 동작 줄이기 설정.
5. 모바일에서도 정돈된 짙은 녹색·금색 UI와 공통 버튼 스타일.
6. 현재 위치에서 반계리 은행나무까지 네이버 지도 앱·카카오맵 길찾기.
7. 현장 CCTV·3D 나무·방문 정보 탭, 지연 로딩과 CCTV 장면 가져오기 전환.
8. 화면 수정 시 독립 HTML도 재생성하기.

## 비밀값

필요한 키의 이름은 `ITS_API_KEY`뿐입니다. 실제 값은 서버 호스팅 환경에서만 관리합니다. 이 저장소에는 포함하지 않았습니다. 복원 과정에서 키를 요청문·README·공개 HTML로 옮기지 마세요.

## 검증

```sh
node scripts/build.mjs
node scripts/test-worker.mjs
node scripts/test-cctv-zoom.mjs
node scripts/test-directions.mjs
node scripts/test-ui.mjs
```

테스트는 모의 데이터 기반입니다. 실제 CCTV 가용성·휴대폰 앱 전환·GPS 위치는 별도로 확인합니다. 문서만 바꾸거나 백업만 할 때는 운영 사이트를 불필요하게 재게시하지 않습니다.

## 이어서 작업할 때 사용할 요청문

> 이 저장소는 반계리 은행나무 현황 확인 사이트의 전체 소스 백업입니다. README.md와 docs/ARCHITECTURE.md, docs/RESTORE.md를 먼저 읽고 작업해 주세요. 운영 코드와 루트 독립 HTML의 차이를 유지하고, 기존 CCTV·핀치 확대·3D·길찾기 동작을 보존하세요. API 키는 서버 비밀값으로만 관리하고, 화면을 수정하면 scripts/export-html.mjs로 루트 index.html도 갱신해 주세요.
