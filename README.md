# 💒 모바일 청첩장 | 2026.12.12

홍정준 ♥ 신송희의 결혼을 축하해주세요

## 📱 프로젝트 소개

React와 TypeScript로 제작된 현대적이고 인터랙티브한 모바일 청첩장입니다.
까사그랑데 센트로에서 열리는 소중한 날을 함께해주실 분들을 위한 디지털 초대장입니다.

### ✨ 주요 기능

- **다양한 인트로 애니메이션** - 4가지 스타일(Montage, Filmstrip, Game, Gate)의 인트로 화면
- **신랑신부 소개** - MBTI, 취미, 좋아하는 것 등 개인 정보 소개
- **우리의 이야기** - 타임라인 형식으로 보여주는 연애 스토리
- **갤러리** - 그리드/슬라이드 뷰로 전환 가능한 사진 갤러리
- **계좌 안내** - 마스킹 처리된 계좌번호와 카카오페이 연동
- **네이버 지도** - 실시간 지도 및 길찾기 (네이버/카카오/티맵)
- **RSVP** - 참석 의사 및 인원 접수
- **방명록** - Supabase 연동 실시간 축하 메시지
- **배경음악** - 자동재생 지원 BGM
- **공유하기** - 웹 공유 API 또는 링크 복사

## 🛠 기술 스택

### Frontend
- **React 19.2.0** - 최신 React
- **TypeScript** - 타입 안정성
- **Vite (Rolldown)** - 빠른 빌드 도구
- **TailwindCSS** - 유틸리티 퍼스트 CSS
- **Lucide React** - 아이콘 라이브러리

### Backend & Services
- **Supabase** - RSVP 및 방명록 데이터 저장
- **Naver Maps API** - 지도 및 위치 정보

### Dev Tools
- **ESLint** - 코드 품질 관리
- **Sharp** - 이미지 최적화 (WebP 변환)

## 🚀 시작하기

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

### 빌드

```bash
npm run build
```

### 프리뷰

```bash
npm preview
```

### 이미지 WebP 변환

```bash
npm run img:webp
```

## 📁 프로젝트 구조

```
src/
├── components/       # 재사용 가능한 컴포넌트
│   ├── SectionTitle.tsx
│   ├── Button.tsx
│   ├── Modal.tsx
│   └── ...
├── sections/        # 페이지 섹션 컴포넌트
│   ├── HeroSection.tsx
│   ├── CoupleIntroSection.tsx
│   ├── StorySection.tsx
│   ├── GallerySection.tsx
│   ├── GiftAccountsSection.tsx
│   ├── LocationSection.tsx
│   ├── RsvpSection.tsx
│   └── GuestbookSection.tsx
├── intro/           # 인트로 애니메이션
│   └── IntroHost.tsx
├── pages/           # 페이지 컴포넌트
│   └── Invitation.tsx
├── config/          # 설정 파일
│   └── wedding.ts
├── lib/             # 외부 라이브러리 설정
│   └── supabase.ts
├── utils/           # 유틸리티 함수
├── App.tsx          # 메인 앱
└── main.tsx         # 엔트리 포인트
```

## ⚙️ 환경 변수 설정

`.env` 파일을 생성하고 다음 환경 변수를 설정하세요:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_NAVER_MAP_CLIENT_ID=your_naver_map_client_id
```

## 🎨 커스터마이징

### 결혼식 정보 수정

`src/config/wedding.ts` 파일에서 신랑신부 정보, 결혼식 일시/장소, 계좌 정보 등을 수정할 수 있습니다.

### 색상 테마 변경

`tailwind.config.cjs` 파일에서 `wedding-gold` 색상을 원하는 테마 색상으로 변경할 수 있습니다.

## 🌐 배포

이 프로젝트는 다음 플랫폼에 쉽게 배포할 수 있습니다:

- **GitHub Pages**
- **Vercel**
- **Netlify**
- **Cloudflare Pages**

## 📝 라이선스

개인적인 용도로 자유롭게 사용하실 수 있습니다.

---

💕 Made with Love for 홍정준 ♥ 신송희
