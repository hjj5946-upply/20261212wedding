import React, { useEffect, useMemo, useRef, useState } from "react";
import { asset } from "../utils/asset";

export type IntroStyle = "montage" | "filmstrip" | "game" | "gate";

const INTRO_IMAGES = Array.from({ length: 15 }).map(
  (_, i) => asset(`images/intro_${i + 1}.webp`)
);

function usePreloadImages(urls: string[]) {
  useEffect(() => {
    let cancelled = false;

    (async () => {
      for (const url of urls) {
        if (cancelled) break;

        const img = new Image();
        img.decoding = "async";
        img.loading = "eager";
        img.src = url;

        // 지원 브라우저에서 디코딩까지 미리
        try {
          // @ts-ignore
          if (img.decode) await img.decode();
        } catch {
          // decode 실패해도 무시
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [urls]);
}

export function IntroHost({ style, onDone, }: { style: IntroStyle; onDone: () => void; }) {
  usePreloadImages(INTRO_IMAGES);
  
  switch (style) {
    case "montage":
      return <MontageIntro onDone={onDone} />;
    case "filmstrip":
      return <FilmStripIntro onDone={onDone} />;
    case "game":
      return <GameIntro onDone={onDone} />;
    case "gate":
      return <GateIntro onDone={onDone} />;
    default:
      return <GateIntro onDone={onDone} />;
  }
}

/** -------------------------
 * A) 마블 코믹스 스타일 몽타주
 * ------------------------- */
function MontageIntro({ onDone }: { onDone: () => void }) {
  const [currentImage, setCurrentImage] = useState(0);
  const [showTextAndOverlay, setShowTextAndOverlay] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
  
    const totalImages = 15;
  
    const BASE_MS = isMobile ? 180 : 180; // 초반 속도
    const FAST_MS = isMobile ? 100 : 90;   // 가속 속도
  
    // ✅ 문구/배경이 "몇 ms 뒤"에 등장할지 (여기만 조절)
    const SHOW_AT = 1800; // 1.8
  
    // ✅ 문구/배경 뜬 "살짝 직후"부터 계속 빠르게 (여기만 조절)
    const FAST_AFTER = 950;               // 0.7초 뒤부터 가속
    const FAST_START_AT = SHOW_AT + FAST_AFTER;
  
    const FADE_AT = 6500;
    const DONE_AT = 7500;
  
    const startedAt = performance.now();
    let cancelled = false;
    let timer: number | null = null;
  
    const tick = () => {
      if (cancelled) return;
  
      const elapsed = performance.now() - startedAt;
  
      // ✅ 가속은 "FAST_START_AT 이후부터 계속"
      const ms = elapsed >= FAST_START_AT ? FAST_MS : BASE_MS;
  
      setCurrentImage((prev) => (prev + 1) % totalImages);
      timer = window.setTimeout(tick, ms);
    };
  
    tick();
  
    // ✅ 문구/배경도 장수 기준 말고 시간으로
    const showTimer = window.setTimeout(() => {
      setShowTextAndOverlay(true);
    }, SHOW_AT);
  
    const fadeTimer = window.setTimeout(() => setFadeOut(true), FADE_AT);
    const doneTimer = window.setTimeout(() => onDone(), DONE_AT);
  
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
      window.clearTimeout(showTimer);
      window.clearTimeout(fadeTimer);
      window.clearTimeout(doneTimer);
    };
  }, [onDone]);
  
  const images = useMemo(
    () => Array.from({ length: 15 }).map((_, i) => ({
      id: i + 1,
      src: asset(`images/intro_${i + 1}.webp`),
    })),
    []
  );

  return (
    <div
      className={`fixed inset-0 z-[100] bg-black transition-opacity duration-1000 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* 계속 전환되는 이미지 배경 */}
      <div className="absolute inset-0 overflow-hidden">
        {images.map((img, idx) => (
          <img
            key={img.id}
            src={img.src}
            alt=""
            decoding="async"
            loading="eager"
            className={[
              "absolute inset-0 h-full w-full object-cover object-center",
              "transition-all duration-150 will-change-transform will-change-opacity",
              currentImage === idx ? "opacity-100 scale-105" : "opacity-0 scale-100",
            ].join(" ")}
          />
        ))}
      </div>

      {/* 배경 서서히 검정으로 덮음 - 3초에 걸쳐 천천히 */}
      <div
        className={`absolute inset-0 bg-black transition-opacity ease-in-out ${
          showTextAndOverlay ? "opacity-100" : "opacity-0"
        }`}
        style={{
          transitionDuration: '2700ms'
        }}
      />

      {/* 문구 - 크게 시작해서 축소되며 나타남 */}
      {showTextAndOverlay && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center animate-zoom-in">
            <h1
              className="text-clip-image font-black leading-none"
              style={{
                fontSize: "96px",
                backgroundImage: `url(${images[currentImage].src})`,
              }}
            >
              2026
            </h1>
            <h2
              className="text-clip-image font-black leading-none mt-1"
              style={{
                fontSize: "96px",
                backgroundImage: `url(${images[currentImage].src})`,
              }}
            >
              12&nbsp;&nbsp;12
            </h2>
            <div className="mt-10" />
            <p
              className="text-clip-image font-semibold tracking-[0.2em] leading-tight"
              style={{
                fontSize: "36px",
                backgroundImage: `url(${images[currentImage].src})`,
              }}
            >
              Wedding<br />
              Invitation
            </p>
          </div>
        </div>
      )}

      {/* 스킵 버튼 */}
      <button
        onClick={onDone}
        className="absolute bottom-8 right-8 text-sm text-white/60 underline hover:text-white/90"
      >
        건너뛰기
      </button>

      {/* 스타일 */}
      <style>{`
        /* 텍스트 안쪽으로만 이미지 보이게! */
        .text-clip-image {
          background-size: cover;
          background-position: center;
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          -webkit-text-stroke: 2px rgba(255, 255, 255, 0.8);
          text-stroke: 2px rgba(255, 255, 255, 0.8);
          filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.5));
        }

        /* 크게 시작해서 축소되며 나타남 (3초) */
        @keyframes zoom-in {
          0% {
            transform: scale(1.8);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .animate-zoom-in {
          animation: zoom-in 3s ease-out;
        }
      `}</style>
    </div>
  );
}

/** -------------------------
 * B) 필름 스트립 레트로
 * ------------------------- */
function FilmStripIntro({ onDone }: { onDone: () => void }) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [showText1, setShowText1] = useState(false);
  const [showText2, setShowText2] = useState(false);
  const [showText3, setShowText3] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // 필름이 계속 내려오는 효과
    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    const interval = setInterval(() => {
      setScrollPosition((prev) => prev + (isMobile ? 12 : 14));
    }, isMobile ? 35 : 30);

    // 타이밍 - 총 10초
    const timers = [
      // 첫 번째 문구 - 나타남
      setTimeout(() => setShowText1(true), 700),
      // 첫 번째 문구 - 사라짐
      setTimeout(() => setShowText1(false), 2700),
      
      // 두 번째 문구 - 나타남
      setTimeout(() => setShowText2(true), 3600),
      // 두 번째 문구 - 사라짐
      setTimeout(() => setShowText2(false), 5600),
      
      // 세 번째 문구 - 나타남
      setTimeout(() => setShowText3(true), 6700),
      
      // 전체 fade out
      setTimeout(() => setFadeOut(true), 9000),
      
      // 다음 화면으로
      setTimeout(onDone, 10000),
    ];

    return () => {
      clearInterval(interval);
      timers.forEach(clearTimeout);
    };
  }, [onDone]);

  // 랜덤하게 섞인 프레임 배열
  const frames = useMemo(() => {
    const shuffledImages = [...INTRO_IMAGES];
    for (let i = shuffledImages.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledImages[i], shuffledImages[j]] = [
        shuffledImages[j],
        shuffledImages[i],
      ];
    }
  
    return shuffledImages.map((src, idx) => ({
      id: idx + 1,
      label: String(idx + 1).padStart(2, "0"),
      src,
    }));
  }, []);

  // 프레임 하나의 높이
  const FRAME_HEIGHT = 400;
  const TOTAL_HEIGHT = frames.length * FRAME_HEIGHT;

  const copyWrapClass = "mx-auto w-full max-w-[22rem] px-7 text-center";

  const copyTextClass =
    [
      "font-noto-serif",
      "text-white/95 drop-shadow-lg",
      "font-[350] tracking-[-0.01em]",
      "leading-[1.6]",
      // 반응형 크기(모바일 기준 안정)
      "text-[19px] sm:text-[21px]",
    ].join(" ");

  const copyEnterClass = (show: boolean) =>
    [
      "absolute inset-0 z-20 flex items-center justify-center",
      "transition-all duration-[1800ms] ease-out",
      show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
    ].join(" ");

  return (
    <div 
      className={`fixed inset-0 z-[100] bg-neutral-900 transition-opacity duration-1000 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* 필름 스트립 */}
      <div className="relative mx-auto h-full w-full max-w-md overflow-hidden">
        {/* 필름 홀 (좌우) */}
        <div className="absolute left-0 top-0 z-10 h-full w-8 border-r-2 border-neutral-700 bg-neutral-800">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="mx-auto mt-8 h-4 w-4 rounded-sm border border-neutral-600 bg-neutral-300"
            />
          ))}
        </div>
        <div className="absolute right-0 top-0 z-10 h-full w-8 border-l-2 border-neutral-700 bg-neutral-800">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="mx-auto mt-8 h-4 w-4 rounded-sm border border-neutral-600 bg-neutral-300"
            />
          ))}
        </div>

        {/* 필름 프레임들 - 완전한 무한 반복 */}
        <div className="absolute inset-x-8">
          {Array.from({ length: 3 }).map((_, setIndex) => (
            <div
              key={setIndex}
              className="transition-transform duration-100 ease-linear"
              style={{
                transform: `translateY(${-scrollPosition + setIndex * TOTAL_HEIGHT}px)`,
              }}
            >
              {frames.map((frame) => (
                <div key={`${setIndex}-${frame.id}`} className="mb-4 px-2">
                  <div className="relative overflow-hidden border-2 border-neutral-700 bg-neutral-800">
                    <img
                      src={frame.src}
                      alt={`Frame ${frame.label}`}
                      className="aspect-[3/4] w-full object-cover opacity-90 grayscale"
                    />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* 배경 흐림 - 덜 흐리게 */}
        <div
          className={`absolute inset-0 z-15 bg-black/25 backdrop-blur-[2px] transition-opacity duration-1000 ${
            (showText1 || showText2 || showText3) ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* 첫 번째 문구 */}
        <div className={copyEnterClass(showText1)}>
          <div className={copyWrapClass}>
            <p className={copyTextClass}>
              좋은 날, 가장 먼저<br/>
              떠오른 분들이 있습니다
            </p>
          </div>
        </div>

        {/* 두 번째 문구 */}
        <div className={copyEnterClass(showText2)}>
          <div className={copyWrapClass}>
            <p className={copyTextClass}>
              저희의 시작을 완성해 줄<br/>
              소중한 한 사람
            </p>
          </div>
        </div>

        {/* 세 번째 문구 */}
        <div className={copyEnterClass(showText3)}>
          <div className={copyWrapClass}>
            <p className={copyTextClass}>
              그 소중한 당신과 함께<br/>
              이 기쁨을 나누고 싶습니다.
            </p>

            <div className="mt-7 font-noto-serif text-[24px] sm:text-[30px] text-white/80 tracking-[0.18em]">
              2026. 12. 12
            </div>
          </div>
        </div>
      </div>

      {/* 레트로 노이즈 오버레이 */}
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' /%3E%3C/svg%3E\")",
        }}
      />

      <button
        onClick={onDone}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 text-sm text-white/60 underline hover:text-white/90"
      >
        건너뛰기
      </button>
    </div>
  );
}

/** -------------------------
 * C) 인터랙티브 게임
 * 도트 게임 스타일 - 신랑신부 터치하면 하트 나오고 잠금 해제
 * ------------------------- */
function GameIntro({ onDone }: { onDone: () => void }) {
  const [groomTouched, setGroomTouched] = useState(false);
  const [brideTouched, setBrideTouched] = useState(false);
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>(
    []
  );
  const heartIdRef = useRef(0);

  const allTouched = groomTouched && brideTouched;

  useEffect(() => {
    if (allTouched) {
      const timer = setTimeout(onDone, 1500);
      return () => clearTimeout(timer);
    }
  }, [allTouched, onDone]);

  const handleTouch = (person: "groom" | "bride", e: React.MouseEvent) => {
    // const rect = e.currentTarget.getBoundingClientRect();
    // const x = e.clientX - rect.left;
    // const y = e.clientY - rect.top;

    // 하트 생성
    setHearts((prev) => [
      ...prev,
      { id: heartIdRef.current++, x: e.clientX, y: e.clientY },
    ]);

    if (person === "groom") setGroomTouched(true);
    else setBrideTouched(true);

    // 하트 제거
    setTimeout(() => {
      setHearts((prev) => prev.slice(1));
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-b from-pink-100 via-purple-100 to-blue-100">
      <div className="mx-auto flex h-full max-w-md flex-col items-center justify-center px-8">
        <div className="mb-8 text-center">
          <div className="mb-2 font-mono text-sm text-purple-600">
            🎮 GAME START
          </div>
          <h2 className="text-xl font-bold text-neutral-800">
            신랑과 신부를 터치하세요!
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            두 사람 모두 터치하면 입장합니다
          </p>
        </div>

        {/* 게임 영역 */}
        <div className="relative flex items-center justify-center gap-12">
          {/* 신랑 */}
          <button
            onClick={(e) => handleTouch("groom", e)}
            className={`group relative transition-all ${
              groomTouched ? "scale-110" : "scale-100 hover:scale-105"
            }`}
            disabled={groomTouched}
          >
            <div
              className={`relative h-24 w-24 transition-all ${
                groomTouched
                  ? "animate-bounce bg-blue-400"
                  : "bg-blue-300 group-hover:bg-blue-400"
              }`}
              style={{ imageRendering: "pixelated" }}
            >
              {/* 도트 신랑 아이콘 */}
              <div className="absolute inset-0 flex items-center justify-center text-4xl">
                🤵
              </div>
            </div>
            <div className="mt-2 text-center font-mono text-xs text-neutral-700">
              {groomTouched ? "✓ 정준" : "정준"}
            </div>
          </button>

          {/* 하트 연결선 */}
          {allTouched && (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="animate-pulse text-4xl">💕</div>
            </div>
          )}

          {/* 신부 */}
          <button
            onClick={(e) => handleTouch("bride", e)}
            className={`group relative transition-all ${
              brideTouched ? "scale-110" : "scale-100 hover:scale-105"
            }`}
            disabled={brideTouched}
          >
            <div
              className={`relative h-24 w-24 transition-all ${
                brideTouched
                  ? "animate-bounce bg-pink-400"
                  : "bg-pink-300 group-hover:bg-pink-400"
              }`}
              style={{ imageRendering: "pixelated" }}
            >
              {/* 도트 신부 아이콘 */}
              <div className="absolute inset-0 flex items-center justify-center text-4xl">
                👰
              </div>
            </div>
            <div className="mt-2 text-center font-mono text-xs text-neutral-700">
              {brideTouched ? "✓ 송희" : "송희"}
            </div>
          </button>
        </div>

        {/* 완료 메시지 */}
        {allTouched && (
          <div className="mt-8 animate-fadeIn text-center">
            <div className="rounded-lg bg-white/80 px-6 py-4 shadow-lg backdrop-blur-sm">
              <div className="mb-2 text-2xl">🎉</div>
              <div className="font-bold text-neutral-800">완료!</div>
              <div className="mt-1 text-sm text-neutral-600">
                곧 입장합니다...
              </div>
            </div>
          </div>
        )}

        {/* 진행 표시 */}
        <div className="mt-8 flex gap-2">
          <div
            className={`h-2 w-12 rounded-full transition-all ${
              groomTouched ? "bg-blue-500" : "bg-neutral-300"
            }`}
          />
          <div
            className={`h-2 w-12 rounded-full transition-all ${
              brideTouched ? "bg-pink-500" : "bg-neutral-300"
            }`}
          />
        </div>
      </div>

      {/* 플로팅 하트들 */}
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="pointer-events-none absolute z-50 animate-float text-2xl"
          style={{
            left: heart.x,
            top: heart.y,
            animation: "float 1s ease-out forwards",
          }}
        >
          ❤️
        </div>
      ))}

      <button
        onClick={onDone}
        className="absolute bottom-8 right-8 text-sm text-neutral-600 underline hover:text-neutral-800"
      >
        스킵
      </button>

      <style>{`
        @keyframes float {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) scale(1.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

/** -------------------------
 * D) 문/빛 입장
 * 우아한 빛 효과와 "함께 축복하러 들어가시겠습니까?" 컨셉
 * ------------------------- */
function GateIntro({ onDone }: { onDone: () => void }) {
  const [touched, setTouched] = useState(false);
  const [entering, setEntering] = useState(false);

  const handleClick = () => {
    setTouched(true);
    setTimeout(() => {
      setEntering(true);
    }, 300);
    setTimeout(onDone, 1800);
  };

  return (
    <div
      className="fixed inset-0 z-[100] cursor-pointer overflow-hidden bg-gradient-to-b from-amber-50 via-yellow-50 to-orange-50"
      onClick={!touched ? handleClick : undefined}
    >
      {/* 빛 효과 배경 */}
      <div className="absolute inset-0">
        <div
          className={`absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-radial from-yellow-200/40 via-orange-100/20 to-transparent transition-all duration-1000 ${
            entering ? "scale-[3] opacity-100" : "scale-100 opacity-60"
          }`}
        />
        <div
          className={`absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-radial from-white/60 via-yellow-100/30 to-transparent transition-all duration-1000 ${
            entering ? "scale-[4] opacity-100" : "scale-100 opacity-50"
          }`}
        />
      </div>

      {/* 문 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          {/* 왼쪽 문 */}
          <div
            className={`absolute right-0 top-0 h-[500px] w-[150px] border-r-4 border-yellow-600/30 bg-gradient-to-r from-amber-100/80 to-yellow-100/60 shadow-2xl backdrop-blur-sm transition-all duration-1000 ${
              entering
                ? "-translate-x-[160px] opacity-0"
                : "translate-x-0 opacity-100"
            }`}
          >
            {/* 문 장식 */}
            <div className="absolute left-1/2 top-32 h-12 w-12 -translate-x-1/2 rounded-full border-2 border-yellow-600/40 bg-yellow-200/50" />
            <div className="absolute left-1/2 top-[280px] h-20 w-1 -translate-x-1/2 bg-yellow-600/20" />
          </div>

          {/* 오른쪽 문 */}
          <div
            className={`absolute left-0 top-0 h-[500px] w-[150px] border-l-4 border-yellow-600/30 bg-gradient-to-l from-amber-100/80 to-yellow-100/60 shadow-2xl backdrop-blur-sm transition-all duration-1000 ${
              entering
                ? "translate-x-[160px] opacity-0"
                : "translate-x-0 opacity-100"
            }`}
          >
            {/* 문 장식 */}
            <div className="absolute left-1/2 top-32 h-12 w-12 -translate-x-1/2 rounded-full border-2 border-yellow-600/40 bg-yellow-200/50" />
            <div className="absolute left-1/2 top-[280px] h-20 w-1 -translate-x-1/2 bg-yellow-600/20" />
          </div>
        </div>
      </div>

      {/* 중앙 컨텐츠 */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 ${
          entering ? "opacity-0 scale-110" : "opacity-100 scale-100"
        }`}
      >
        <div className="text-center">
          <div className="mb-6 animate-pulse text-6xl">✨</div>
          <h1 className="mb-4 text-3xl font-bold text-amber-900">
            Wedding Invitation
          </h1>
          <div className="mx-auto mb-6 h-px w-32 bg-amber-400/50" />
          <p className="mb-2 text-lg text-amber-800">정준 & 송희</p>
          <p className="text-sm text-amber-700">2026. 12. 12</p>

          {!touched && (
            <div className="mt-12 animate-bounce">
              <div className="rounded-full bg-white/60 px-6 py-3 shadow-lg backdrop-blur-sm">
                <p className="text-sm font-medium text-amber-900">
                  함께 축복하러 들어가시겠습니까?
                </p>
                <p className="mt-1 text-xs text-amber-700">
                  화면을 터치해주세요
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 파티클 효과 */}
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute h-1 w-1 animate-float rounded-full bg-yellow-300/60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
