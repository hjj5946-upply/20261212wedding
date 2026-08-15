# CLAUDE.md

이 저장소에서 작업할 때 참고할 지침입니다.

## 프로젝트 개요

2026.12.12 결혼식용 **모바일 청첩장** SPA. React 19 + TypeScript + Vite(rolldown) + TailwindCSS.
라우터가 없는 단일 페이지: `App.tsx`가 `IntroHost`(인트로 애니메이션) → `Invitation`(본문) 전환만 담당합니다.

## 명령어

```bash
npm run dev       # 개발 서버 (--host)
npm run build     # tsc -b && vite build  ← 타입 에러가 곧 빌드 실패
npm run lint      # ESLint
npm run img:webp  # public/images jpg/png → webp (1080px, quality 78)
```

변경 후에는 최소한 `npm run build`로 타입 체크까지 통과시키세요.

## 아키텍처 규칙

- **콘텐츠는 전부 `src/config/wedding.ts`에.** 이름, 날짜, 장소, 좌표, 계좌, 스토리 타임라인, 카피 문구를 컴포넌트에 하드코딩하지 마세요. 섹션은 `data: WeddingConfig` prop을 받아 렌더링만 합니다.
- **섹션 조립과 전역 상태는 `src/pages/Invitation.tsx`에 모입니다.** 토스트, 지도 선택 모달, 플로팅 CTA, BGM 자동재생이 여기서 관리되고 콜백(`onToast`, `onCopy`, `onShare`)으로 하위에 내려갑니다. 섹션이 직접 토스트를 띄우지 않습니다.
- **public 자산 경로는 반드시 `asset()`(`src/utils/asset.ts`)을 거칩니다.** `import.meta.env.BASE_URL`을 붙여주므로, 서브패스 배포 시 경로가 깨지지 않습니다. `/images/...` 같은 절대 경로를 직접 쓰지 마세요.
- **`src/components/`는 범용 UI, `src/sections/`는 청첩장 전용 섹션**입니다. 이 경계를 유지하세요.
- 외부 SDK(Naver Maps 등)는 `NaverMapEmbed`처럼 **중복 로드를 막는 loadScriptOnce 패턴**으로 감쌉니다.

## UI / 스타일

- 모든 스타일은 **TailwindCSS 유틸리티**로 작성합니다. 색상은 `tailwind.config.cjs`의 `wedding-*` 팔레트(ivory/gray/green/gold/silver)에서 고르고, 임의의 hex를 새로 추가하지 마세요.
- 조건부 클래스는 이 코드베이스 관례인 **배열 + `.join(" ")`** 패턴을 씁니다.
- **모바일 퍼스트**입니다. 431px 이상에서는 `#root`가 430px 프레임으로 고정되므로(`src/index.css`), `fixed inset-0` 오버레이에는 `.mobile-fixed-overlay`, 우상단 고정 요소에는 `.mobile-fixed-tr` 클래스를 함께 붙여야 프레임 밖으로 새지 않습니다.
- 애니메이션은 **GSAP + ScrollTrigger**를 사용합니다. `gsap.registerPlugin`은 `App.tsx`에서 이미 한 번 호출되므로 중복 호출하지 마세요. `useEffect` 안에서는 `gsap.context`로 감싸고 cleanup에서 revert 하는 기존 방식을 따르세요.
- 텍스트는 한국어입니다. 사용자에게 보이는 문구는 한국어로 작성합니다.

## 데이터 / 외부 연동

- Supabase 테이블은 **`guestbook_messages`** (`id`, `created_at`, `name`, `message`) 하나뿐입니다. 다만 방명록 섹션이 현재 주석 처리되어 있어 **런타임에서 Supabase를 호출하는 코드는 없습니다.** `rsvps` 테이블 쪽도 마찬가지로 주석 상태입니다.
- 방명록에는 **허니팟 필드 + 12초 쿨다운(localStorage)** 스팸 방지가 들어 있습니다. 이 장치를 제거하지 마세요.
- 환경 변수는 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_NAVER_MAP_CLIENT_ID` 세 개이며 `.env`는 gitignore 대상입니다. **키 값을 커밋하거나 문서에 적지 마세요.**
- 지도 이동은 `src/utils/mapNavigation.ts`의 딥링크 → 웹 폴백 로직을 재사용합니다. 앱 미설치 시 무반응 문제를 이미 처리해 두었습니다.

## BGM

- `src/utils/bgm.ts`가 모듈 레벨 싱글턴 `HTMLAudioElement`를 관리합니다(랜덤 트랙, 2초 페이드 인/아웃, 곡 종료 시 다음 곡). 컴포넌트에서 `new Audio()`를 직접 만들지 마세요.
- 브라우저 자동재생 정책 때문에 `Invitation.tsx`가 **첫 사용자 제스처(click/touchend)를 캡처해 재생을 시도**합니다. 이 리스너 로직은 민감하니 건드릴 때 실기기에서 확인하세요.
- 재생 여부는 `bgm_enabled_v1` localStorage 키에 저장됩니다.

## 주의사항

- `RsvpSection.tsx`와 `GuestbookSection.tsx`는 파일이 살아 있지만 `Invitation.tsx`에서 주석 처리되어 **화면에 없습니다.** RSVP·방명록 관련 요청을 받으면 먼저 활성화 여부를 확인하세요.
- 방명록을 되살리려면 `Invitation.tsx`의 **3곳**(`import`, `onGuestbookToast` 콜백, JSX) 주석을 함께 해제해야 합니다. `noUnusedLocals: true`라 하나만 풀면 빌드가 깨집니다.
- `GallerySection`은 갤러리 전용 사진 `gi_1~gi_25.webp`를 씁니다(`IMAGE_PREFIX = "gi"`, `IMAGE_COUNT = 25`). 인트로의 `intro_*.webp`와는 별개입니다. 사진을 추가/삭제하면 `IMAGE_COUNT`를 `public/images`의 실제 `${IMAGE_PREFIX}_*.webp` 장수와 반드시 맞추세요 — 크게 두면 없는 번호가 404 + 깨진 타일이 됩니다.
- **배포 도메인은 `https://jjsh-261212.com` 입니다.** `index.html`의 OG/트위터 태그와 `wedding.ts`의 `site.baseUrl`/`ogImageUrl`이 모두 이 주소를 씁니다. 도메인이 나오면 다시 묻지 말고 이 값을 쓰세요.
- 참고: `site.baseUrl`/`site.ogImageUrl`은 현재 **어디에서도 읽히지 않습니다**(공유는 `Invitation.tsx`가 `window.location.href`를 사용, OG는 `index.html`이 처리). 값이 틀려도 화면 동작에는 영향이 없습니다.
- 새 사진을 추가하면 `npm run img:webp`로 WebP를 생성하고, 코드에서는 `.webp`를 참조합니다.
- `public/images`는 이제 **`.webp`만** 있습니다(변환 원본 jpg/png는 전부 삭제, 필요하면 git 이력에서 복구). 코드는 전부 `.webp`를 참조하며 `index.html`의 OG/트위터 이미지도 `og_image.webp`입니다.
- 원본을 다시 넣게 되면 `vite.config.ts`의 `prunePublicSources` 플러그인이 **같은 이름의 `.webp`가 있는 원본을 `dist`에서 제외**한다는 점에 주의하세요. 원본 확장자를 절대 URL로 참조해야 하는 자산이 생기면 `KEEP_IMAGES`(현재 비어 있음)에 추가해야 합니다.
- 우클릭 차단과 핀치 줌 차단이 `App.tsx`에 의도적으로 들어가 있습니다(사진 보호 목적). 제거하지 마세요.
