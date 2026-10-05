# movie-react-express
> React + TypeScript · Node.js + Express로 만든 영화 리뷰/박스오피스 페이지 — Firestore · KOBIS Open API

---

## Why

Firestore에 쌓여 있는 영화 리뷰 데이터와 KOBIS 박스오피스 Open API를 소재로, React + TypeScript 프론트엔드와 Node.js + Express API를 직접 설계해서 만들어본 프로젝트다. 꼭 기존 구현에 문제가 있어서라기보다는, React의 선언적 컴포넌트 구조와 Express로 외부 API·DB 접근을 서버 쪽에 깔끔하게 캡슐화하는 구조를 직접 써보고 싶어서 시작했다.

읽기(리뷰 목록, 박스오피스 순위)는 Express API가 Firestore Admin SDK와 KOBIS API를 서버에서 호출해 내려주고, React는 그 결과를 받아 렌더링한다. 리뷰 등록(쓰기)은 클라이언트에서 비밀키를 입력받아 비교한 뒤 브라우저가 Firestore에 바로 쓰는 단순한 구조로 남겨뒀다 — 이번 프로젝트의 초점은 읽기 경로를 서버로 설계하는 쪽에 있었다.

배포 대상은 RAM 432MiB짜리 소형 서버였다. Node 프로세스 하나를 새로 띄우는 것 자체가 메모리 예산을 신경 써야 하는 결정이었다.

---

## Architecture

```
브라우저
 └─ HTTPS → nginx
             ├─ /                   → React 빌드 정적 파일 (alias + try_files)
             └─ /api/movie/v1/*     → Node.js API(Express) 컨테이너
                                          ├─ Firestore Admin SDK (movies 컬렉션)
                                          └─ KOBIS Open API (키는 서버에만 보관)

리뷰 등록 시: 브라우저 → (비밀키 비교, 클라이언트 측) → Firestore 직접 쓰기 (API 경유 안 함)
```

운영에서는 React 개발 서버를 띄우지 않는다. `vite build`로 만든 정적 파일을 nginx가 직접 서빙하고, 새로 상시 실행되는 프로세스는 Express API 하나뿐이다.

### 단계적 배포

Vite의 `base` 경로를 환경변수로 받게 만들어서, 같은 빌드를 경로만 바꿔 두 단계로 배포할 수 있게 했다.

```bash
VITE_BASE_PATH=/preview/ npm run build   # 1단계: 실 서버에 먼저 올려 메모리/동작 확인
npm run build                             # 2단계: 기본 경로로 재배포
```

1단계에서 실 서버의 메모리 사용량과 실제 동작을 확인한 뒤에만 2단계로 넘어갔다.

---

## API 엔드포인트

| 메서드 · 경로 | 설명 |
|---|---|
| `GET /api/movie/v1/reviews` | 전체 리뷰 목록. `{ items, total }` |
| `GET /api/movie/v1/reviews/:id` | 단일 리뷰. 없으면 404 |
| `GET /api/movie/v1/box-office` | KOBIS 박스오피스 상위 3개. `{ targetDate, items, stale, fetchedAt }` |
| `GET /api/movie/v1/health` | liveness 체크 |

내부 구조는 `router → service → repository` 3계층이다. `reviews/`, `box-office/`, `health/` 모듈이 각각 이 패턴을 따르고, `app.ts`는 미들웨어 조립만 담당하며 `server.ts`가 실제로 포트를 연다(테스트에서는 `app.ts`만 띄워서 listen 없이 `supertest`로 호출).

에러는 전부 `{ error: { code, message, requestId } }` 형태로 통일했고, Firestore 읽기 실패나 KOBIS 장애를 빈 배열(200)로 위장하지 않고 503으로 응답한다.

---

## Key Design Decisions

**리뷰 등록은 클라이언트 비밀키 방식으로 단순하게**

리뷰 등록 흐름은 클라이언트에서 비밀키 문자열을 비교하고 통과하면 브라우저가 Firestore에 직접 쓰는 단순한 구조로 설계했다. 이번 프로젝트는 읽기 경로를 서버로 옮겨 Firestore/KOBIS 접근을 캡슐화하는 데 초점을 뒀고, 쓰기 경로의 서버 인증은 범위 밖으로 뒀다.

**정규화 로직을 작성하기 전에 실제 Firestore 데이터를 먼저 조사**

`movies` 컬렉션 전체를 Admin SDK로 한 번 읽어서 전체 문서 수, `created_at` 타입 분포, `star` 필드의 실제 값 형태를 확인한 뒤에 정규화 함수를 작성했다(`api/scripts/investigate-movies.ts`). 그 결과 문서 중 1개는 `created_at`만 없는 게 아니라 **필드가 하나도 없는 완전히 빈 문서**라는 걸 발견했고, 이 문서는 "날짜 미상"으로 표시하는 대신 응답에서 제외하기로 했다(진단 로그는 남김).

`star` 값은 전부 "⭐" 문자의 반복이었다. 그래서 정규화 함수는 문자열 안의 "⭐" 개수를 세는 방식으로 작성했다.

**Firestore 필드명은 원본 그대로 내부에서 사용**

API 내부에서는 Firestore 문서의 필드명(`image`, `title`, `comment`, `star`, `created_at`)을 그대로 쓰고, 공개 API 응답에서만 `imageUrl`, `rating`, `createdAt` 같은 이름으로 변환한다. 기존 데이터를 변환 없이 그대로 읽고 쓸 수 있게 하기 위해서다.

---

## Tech Stack

| 항목 | 내용 |
|---|---|
| 프론트엔드 | React 19, TypeScript, Vite 8 |
| 백엔드 API | Node.js, Express, TypeScript |
| 데이터 | Firestore (Admin SDK), KOBIS Open API |
| 배포 | Docker 멀티스테이지 빌드, docker-compose, nginx (alias + proxy_pass) |
| 테스트 | Vitest + Supertest (contract test) |

---

## How to Run

로컬 개발:

```bash
cd api
npm install
cp .env.example .env   # FIRESTORE_PROJECT_ID, GOOGLE_APPLICATION_CREDENTIALS, KOBIS_API_KEY 채우기
npm run dev             # tsx watch, :4000

cd web
npm install
cp .env.example .env    # Firebase 웹 config, VITE_SAVE_KEY 채우기
npm run dev              # Vite dev server, :5173, /api 프록시 → :4000
```

API 빌드 + 검증:

```bash
cd api
npm run typecheck
npm test                # vitest run
npm run build && npm start
```

Docker 이미지 빌드:

```bash
cd api
docker build -t movie-api .
```

---

## Known Issues & Lessons

**tsconfig `rootDir` 미지정 → 로컬/Docker 빌드 출력 경로 불일치**

로컬에는 `scripts/`(1회성 조사 스크립트)와 `src/`가 나란히 있어서 TypeScript가 공통 루트를 repo 루트로 추론해 `dist/src/server.js`를 만들었다. Docker 빌드 스테이지에는 `scripts/`를 복사하지 않았는데, 이 경우 TypeScript가 `src/`만 보고 루트를 다시 추론해 `dist/server.js`를 만들었다. 두 환경의 출력 경로가 달라서 컨테이너가 `Cannot find module '/app/dist/src/server.js'`로 바로 죽었다. 운영 서버에서 `docker logs`로 실제 에러를 확인한 뒤 원인을 찾았고, `tsconfig.json`에 `rootDir: "src"`를 명시해서 환경에 무관하게 출력 경로가 고정되도록 고쳤다.

**KOBIS 필드 오매핑**

화면에 "Total Audience"로 표시하려던 값을 처음엔 `audiCnt`(일별 관객수)로 매핑했는데, 실제로는 `audiAcc`(누적 관객수) 필드가 맞았다. 실제 KOBIS 응답을 직접 호출해서 화면에 보이는 숫자와 비교하는 과정에서 발견하고 고쳤다.

**운영 서버 메모리 — 로컬 측정치는 신뢰할 수 없었다**

로컬(macOS) 개발 환경에서는 같은 API 프로세스가 idle 상태에서 RSS 약 103MB, 요청 몇 번 후 약 138MB를 썼다. 하지만 실제 운영 서버(Linux, Alpine 컨테이너)에 올려서 `docker stats`로 측정하니 idle 47.55MiB, 실제 트래픽(페이지 로드 + box-office/reviews 조회 + 리뷰 등록 1회) 후 52.05MiB로, 로컬보다 훨씬 낮았다. `free -h`의 `available`은 컨테이너 기동 전 약 189Mi에서 실제 트래픽 이후 약 154Mi로 줄었는데, 이 수치는 이 컨테이너를 추가하기 전에 별도로 측정해 둔 이전 베이스라인(약 153MiB)과 거의 같아서, 서버의 일상적인 부하 변동 폭 안에 들어간다고 판단하고 배포를 진행했다. 로컬 macOS 수치만으로 432MiB 서버의 배포 가능 여부를 판단하면 안 된다는 걸 확인한 셈이다.
