import { useEffect, useMemo, useState } from "react";
import { asset } from "../utils/asset";
import { playBgm, isBgmPlaying  } from "../utils/bgm";

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

    default:
      return <MontageIntro onDone={onDone} />; // A안으로 폴백
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
    const FAST_MS = isMobile ? 100 : 100;   // 가속 속도

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

  const tryPlayBgm = () => {
    if (isBgmPlaying()) return;
    playBgm().catch(() => { });
  };

  const handleSkip = () => {
    tryPlayBgm();
    onDone();
  };

  return (
    <div
      className={`fixed inset-0 z-[100] mobile-fixed-overlay bg-black transition-opacity duration-1000 ${fadeOut ? "opacity-0" : "opacity-100"
        }`}
      onClick={() => playBgm().catch(() => { })}
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
        className={`absolute inset-0 bg-black transition-opacity ease-in-out ${showTextAndOverlay ? "opacity-100" : "opacity-0"
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
        onClick={(e) => {
          e.stopPropagation();
          handleSkip();
        }}
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