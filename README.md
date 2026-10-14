# 반계리 지금 · Bangye Ginkgo Watch

반계리 은행나무 방문 전 CCTV, 현장 사진, 날씨와 길찾기를 함께 확인하는 웹사이트의 소스 백업입니다.

- 운영 사이트: https://bangye-ginkgo-watch.bzbone.chatgpt.site/
- 백업 기준: 2026년 10월 14일, Sites 소스 커밋 `5f7c90f1f150d4d7ebf4ed08db96ab93ee687c76`
- 원본 운영 사이트의 공개 설정과 GitHub 저장소의 공개 설정은 서로 독립적입니다.

## 주요 기능

- 반계IC 주변 ITS CCTV 조회·재생과 전체 화면
- 영상 1~4배 확대, 두 손가락 확대·축소, 확대한 화면 드래그 이동
- 현장 사진 또는 CCTV 장면의 나뭇잎 영역을 선택해 색 비율 추출
- 넓은 수관과 여러 줄기를 참고한 3D 은행나무 회전·확대·올려다보기
- 선택 영역 보간 확대·선명도 보정, 이미지 저장
- 은행잎 배경 효과, 효과 끄기, 동작 줄이기 설정 존중
- 현재 위치에서 네이버 지도 앱·카카오맵으로 자동차 길찾기
- 문막읍 주변 날씨·5일 예보, 최근 방문 사진·영상 검색 링크

## 두 가지 실행 형태

| 구분 | 루트 `index.html` | `web/` + `worker/` 원본 |
| --- | --- | --- |
| 용도 | 독립 HTML 보관, 정적 호스팅 | 운영 사이트 복원·개발 |
| CCTV | 지도에서 확인하는 안내·링크 | 서버에 ITS 키를 설정하면 직접 조회·재생 |
| 사진 색 분석·3D | 지원 | 지원 |
| 날씨·3D 라이브러리 | 인터넷 필요 | 인터넷 필요 |
| 현재 위치 길찾기 | HTTPS 호스팅 또는 지도 앱에서 위치 사용 | 동일 |
| 비밀값 | 포함하지 않음 | 실제 값은 호스팅 환경에 별도 등록 |

루트 HTML에는 화면 자산과 스크립트가 포함됩니다. **완전한 오프라인 앱은 아닙니다.** Three.js CDN, 날씨와 외부 지도는 네트워크를 사용합니다.

## 빠르게 확인하기

`index.html`을 브라우저로 열면 독립 버전을 확인할 수 있습니다. 모바일 파일 뷰어가 HTML 실행을 제한하면 PC 브라우저 또는 HTTPS 정적 호스팅을 사용하세요.

로컬 HTTP 미리보기:

```sh
python3 -m http.server 8080
```

브라우저에서 `http://localhost:8080/`을 엽니다. 이 명령은 정적 HTML만 제공합니다. CCTV Worker는 실행하지 않습니다. 휴대폰에서 PC의 일반 HTTP 주소로 접속하면 브라우저 위치 기능이 제한될 수 있습니다.

## 소스 수정 후 검증

프로젝트 자체는 npm 패키지를 설치하지 않고 Node.js 내장 모듈로 빌드합니다.

```sh
node scripts/build.mjs
node scripts/test-worker.mjs
node scripts/test-cctv-zoom.mjs
node scripts/test-directions.mjs
```

Worker 배포 파일은 `dist/server/index.js`에 만들어집니다. 테스트는 모의 ITS 응답과 모의 위치·터치 이벤트를 사용하며, 실제 현장 영상이나 휴대폰 지도 앱 전환을 보증하지 않습니다.

독립 HTML 재생성:

```sh
node scripts/export-html.mjs /absolute/path/to/bangye-ginkgo-watch/index.html
```

출력 인자는 실제 **절대 경로**로 바꾸세요. 화면을 수정했다면 루트 `index.html`도 다시 생성해 함께 커밋합니다.

## CCTV 키와 복원

CCTV에는 ITS 승인 키가 필요합니다. 서버 런타임의 비밀값 `ITS_API_KEY`에만 설정하며, GitHub·HTML·README에 실제 키를 입력하지 않습니다. 이 백업에는 운영 키와 GitHub/Sites 인증 정보가 들어 있지 않습니다.

기존 Sites를 복원할 때는 `.openai/hosting.json`의 프로젝트 연결을 확인하고, 빌드한 Worker를 해당 사이트에 게시합니다. **새로운 별도 사이트를 만들 때는 기존 프로젝트 ID를 그대로 사용하지 마세요.** 자세한 순서는 [복원 안내](docs/RESTORE.md)에 있습니다.

## 파일 안내

| 경로 | 내용 |
| --- | --- |
| `index.html` | 독립 실행·정적 호스팅용 HTML |
| `web/` | 운영 프런트엔드 원본, 3D, CCTV 확대, 길찾기, 은행잎 이미지 |
| `worker/index.js` | ITS 조회와 암호화된 미디어 중계 |
| `scripts/` | 빌드, HTML 내보내기, 동작 검증 |
| `.openai/hosting.json` | 원래 Sites 프로젝트 연결 정보 |
| `docs/ARCHITECTURE.md` | 구조·데이터 흐름·알려진 제약 |
| `docs/RESTORE.md` | 실행·복원·정적 호스팅 안내 |
| `docs/HANDOFF.md` | 이후 Codex 작업 인수인계 |
| `docs/REFERENCES.md` | 외부 서비스·참고 자료 |
| `BACKUP-MANIFEST.json` | 기준 소스 커밋과 파일별 SHA-256 |

## 사용상 구분

3D 모델은 실제 나무를 참고한 근사 모델이며 실측 스캔이 아닙니다. 분석 값은 선택한 영역의 잎 색 후보 비중으로, 나무 전체의 단풍률·오늘 현황·미래 절정 예측이 아닙니다. 확대 보정도 보간과 약한 선명화이며 AI 복원은 아닙니다.

운영 사이트는 도로 CCTV라 카메라 방향·제공 기관 사정에 따라 나무가 보이지 않거나 영상이 중단될 수 있습니다. 이 저장소는 영상 자체를 보관하지 않습니다.
