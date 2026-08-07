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

- Supabase 테이블은 **`guestbook_messages`** (`id`, `created_at`, `name`, `message`) 하나만 실제 사용 중입니다. `rsvps` 테이블에 쓰는 코드는 `Invitation.tsx`에서 주석 처리된 상태입니다.
- 방명록에는 **허니팟 필드 + 12초 쿨다운(localStorage)** 스팸 방지가 들어 있습니다. 이 장치를 제거하지 마세요.
- 환경 변수는 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_NAVER_MAP_CLIENT_ID` 세 개이며 `.env`는 gitignore 대상입니다. **키 값을 커밋하거나 문서에 적지 마세요.**
- 지도 이동은 `src/utils/mapNavigation.ts`의 딥링크 → 웹 폴백 로직을 재사용합니다. 앱 미설치 시 무반응 문제를 이미 처리해 두었습니다.

## BGM

- `src/utils/bgm.ts`가 모듈 레벨 싱글턴 `HTMLAudioElement`를 관리합니다(랜덤 트랙, 2초 페이드 인/아웃, 곡 종료 시 다음 곡). 컴포넌트에서 `new Audio()`를 직접 만들지 마세요.
- 브라우저 자동재생 정책 때문에 `Invitation.tsx`가 **첫 사용자 제스처(click/touchend)를 캡처해 재생을 시도**합니다. 이 리스너 로직은 민감하니 건드릴 때 실기기에서 확인하세요.
- 재생 여부는 `bgm_enabled_v1` localStorage 키에 저장됩니다.

## 주의사항

- `RsvpSection.tsx`는 살아 있지만 `Invitation.tsx`에서 주석 처리되어 **화면에 없습니다.** RSVP 관련 요청을 받으면 먼저 활성화 여부를 확인하세요.
- `GallerySection`의 `IMAGE_COUNT`(현재 15)는 `public/images`의 실제 `intro_*.webp` 장수와 반드시 일치해야 합니다. 사진을 추가/삭제하면 이 값도 함께 고치세요.
- `index.html`의 OG 도메인(`jjsh-261212.com`)과 `wedding.ts`의 `site.baseUrl`(GitHub Pages)이 불일치합니다. 배포 관련 작업 시 어느 쪽이 정답인지 사용자에게 확인하세요.
- 새 사진을 추가하면 `npm run img:webp`로 WebP를 생성하고, 코드에서는 `.webp`를 참조합니다.
- `public/images`에는 변환 원본(jpg/png)이 함께 있지만, `vite.config.ts`의 `prunePublicSources` 플러그인이 **같은 이름의 `.webp`가 있는 원본을 `dist`에서 제외**합니다(약 -70MB). 그래서 코드가 원본 확장자를 직접 참조하면 배포본에서 깨집니다. 예외는 `KEEP_IMAGES`(현재 `og_image.jpg` — OG 메타가 절대 URL로 참조)뿐입니다.
- 우클릭 차단과 핀치 줌 차단이 `App.tsx`에 의도적으로 들어가 있습니다(사진 보호 목적). 제거하지 마세요.
