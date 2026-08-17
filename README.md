# 💒 모바일 청첩장 | 2026.12.12

홍정준 ♥ 신송희의 결혼식에 초대합니다.

React + TypeScript + Vite로 만든 1페이지 모바일 청첩장입니다.
라우터 없이 인트로 애니메이션 → 초대장 본문 순으로 이어지는 단일 스크롤 페이지 구조입니다.

## ✨ 구성 섹션

인트로(`IntroHost`, 몽타주 애니메이션) 이후 아래 순서로 렌더링됩니다.

| 섹션 | 설명 |
| --- | --- |
| Hero | 메인 사진 + 눈 내리는 캔버스 효과 |
| Message | 초대 인사말 |
| Info | 예식 일시·장소 안내 |
| CoupleIntro | 신랑·신부 소개 (MBTI, 취미 등) |
| Story | 타임라인 형식 연애 스토리 |
| Gallery | 그리드 / 단일 뷰 전환 갤러리 |
| GiftAccounts | 마스킹된 계좌번호 복사 + 카카오페이 링크 |
| Location | 네이버 지도 임베드 + 길찾기(네이버/카카오/티맵) |
| Footer | 마무리 문구 |

이 밖에 BGM 플로팅 버튼, 공유하기(Web Share API / 링크 복사), 하단 플로팅 CTA가 상시 동작합니다.

> `RsvpSection`(참석 의사 접수)과 `GuestbookSection`(Supabase 방명록)은 구현되어 있으나 현재 `src/pages/Invitation.tsx`에서 주석 처리되어 비활성 상태입니다. 방명록을 되살리려면 `import` / `onGuestbookToast` 콜백 / JSX **3곳**의 주석을 함께 해제하세요.

## 🛠 기술 스택

- **React 19** / **TypeScript 5.9**
- **Vite 7 (rolldown-vite)** — `overrides`로 rolldown 번들러 사용
- **TailwindCSS 3** — `wedding-*` 커스텀 색상 팔레트
- **GSAP + ScrollTrigger** — 섹션 진입 애니메이션
- **Supabase** — 방명록(`guestbook_messages`) 저장/조회 *(현재 비활성)*
- **Naver Maps API** — 지도 임베드
- **lucide-react** — 아이콘
- **sharp** — 이미지 WebP 변환 스크립트

## 🚀 실행

```bash
npm install
npm run dev       # 개발 서버 (--host, 모바일 실기기 확인용)
npm run build     # tsc -b && vite build
npm run preview   # 빌드 결과 미리보기
npm run lint      # ESLint
npm run img:webp  # public/images 의 jpg/png → webp 변환 (1080px, q78)
```

## ⚙️ 환경 변수

프로젝트 루트에 `.env` 생성 (git에 커밋되지 않음):

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_NAVER_MAP_CLIENT_ID=...
```

`src/lib/supabase.ts`는 Supabase 환경 변수가 없으면 모듈 로드 시점에 예외를 던집니다.

## 📁 구조

```
src/
├── components/   # 재사용 UI (Modal, Toast, Button, NaverMapEmbed, BgmFloating ...)
├── sections/     # 초대장 본문 섹션 (Hero, Story, Gallery, Guestbook ...)
├── intro/        # IntroHost — 진입 애니메이션
├── pages/        # Invitation — 섹션 조립 + 전역 상태(토스트/모달/BGM)
├── config/       # wedding.ts — 모든 콘텐츠 데이터 (단일 소스)
├── lib/          # supabase 클라이언트
├── utils/        # asset, bgm, share, mapNavigation
├── App.tsx       # 인트로 ↔ 본문 전환
└── main.tsx      # 엔트리
public/
├── images/       # 전부 webp — intro_1~44(인트로 후보, 매 접속 랜덤 20장 사용), gi_1~25(갤러리), main_img, og_image ...
├── audio/        # BGM 6곡 (랜덤 재생)
└── fonts/        # NotoSerifKR
```

## 🎨 커스터마이징

- **콘텐츠 수정**: `src/config/wedding.ts` — 신랑신부 정보, 예식 일시/장소, 좌표, 계좌, 스토리 타임라인 등이 모두 여기 있습니다.
- **색상 테마**: `tailwind.config.cjs` 의 `wedding.{ivory,gray,green,gold,silver}` 팔레트.
- **메타/OG 태그**: `index.html`.
- **PC 레이아웃**: `src/index.css` 에서 431px 이상일 때 430px 모바일 프레임으로 고정됩니다.

## 🔗 URL 옵션

- `?noIntro=1` — 인트로를 건너뛰고 초대장 본문부터 표시

## ⚠️ 알려진 이슈

- `npm run lint` 에서 `react-hooks/set-state-in-effect` 에러가 여러 파일(`GallerySection`, `InfoSection`, `StorySection`, `BgmFloating` 등)에 남아 있습니다. 동작에는 문제가 없으나 정리 대상입니다.
- `wedding.ts`의 `site.baseUrl` / `site.ogImageUrl`은 현재 코드 어디에서도 읽지 않는 값입니다. OG 태그는 `index.html`이, 공유 URL은 `window.location.href`가 담당합니다.

## 📝 라이선스

개인 용도로 자유롭게 사용하실 수 있습니다.

---

💕 Made with Love for 정준 ♥ 송희
