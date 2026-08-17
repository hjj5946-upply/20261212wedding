import { useEffect, useState } from "react";
import { asset } from "../utils/asset";
import { playBgm, isBgmPlaying  } from "../utils/bgm";

export type IntroStyle = "montage" | "filmstrip" | "game" | "gate";

// ⚠️ public/images 의 실제 `intro_*.webp` 장수와 일치해야 한다 (후보 풀)
const TOTAL_FILES = 44;
// 한 번 열 때 실제로 쓰는 장수. 선택되지 않은 파일은 요청/디코드 자체를 하지 않으므로
// 이 값이 곧 인트로의 전송량이다. (44장 전부 쓰면 7.5MB → 20장이면 약 3.4MB)
const FRAMES_PER_RUN = 20;

/** Fisher-Yates 셔플 (원본은 건드리지 않음) */
function shuffle<T>(input: T[]): T[] {
  const a = input.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j] as T, a[i] as T];
  }
  return a;
}

// 목록은 렌더 중에 바뀌면 안 되므로 모듈 상수로 한 번만 만든다.
// 셔플 + 앞에서 20장만 잘라내므로 "페이지를 열 때마다" 44장 중 어느 20장이
// 어떤 순서로 나올지가 새로 정해지고, 재생 중에는 흔들리지 않는다.
const INTRO_FRAMES = shuffle(
  Array.from({ length: TOTAL_FILES }, (_, i) => ({
    id: i + 1,
    src: asset(`images/intro_${i + 1}.webp`),
  }))
).slice(0, FRAMES_PER_RUN);

// 아래 로직은 전부 "이번에 고른 장수" 기준이어야 한다.
// (TOTAL_FILES(44)로 계산하면 존재하지 않는 인덱스를 가리켜 프레임이 비거나 크래시한다)
const FRAME_COUNT = INTRO_FRAMES.length;

/** 지금 전환에 참여하는 프레임인지 (직전 / 현재 / 다음) */
function isNearCurrent(idx: number, current: number) {
  return (
    idx === current ||
    idx === (current + 1) % FRAME_COUNT ||
    idx === (current - 1 + FRAME_COUNT) % FRAME_COUNT
  );
}

// 화면에 가장 먼저 필요한 앞부분은 순차로 확실히 준비한다
const PRELOAD_HEAD = 4;
// 나머지는 소량씩만 병렬로. 44장을 한 번에 요청하면 모바일 회선에서
// 서로 경합해 정작 초반 프레임 준비가 늦어진다.
const PRELOAD_CONCURRENCY = 5;

/**
 * 프레임 전환이 100~180ms 간격이라 디코딩을 미리 끝내둬야 끊김이 없다.
 * 앞 몇 장은 순서대로, 나머지는 "재생 순서대로" 동시 개수를 제한해 디코딩한다.
 */
function usePreloadImages(urls: string[]) {
  useEffect(() => {
    let cancelled = false;

    const decode = async (url: string) => {
      if (cancelled) return;
      const img = new Image();
      img.decoding = "async";
      img.loading = "eager";
      img.src = url;
      try {
        await img.decode?.();
      } catch {
        // decode 실패해도 무시
      }
    };

    (async () => {
      for (const url of urls.slice(0, PRELOAD_HEAD)) {
        if (cancelled) return;
        await decode(url);
      }

      const rest = urls.slice(PRELOAD_HEAD);
      let cursor = 0;

      const worker = async () => {
        while (!cancelled) {
          const url = rest[cursor++];
          if (url === undefined) return;
          await decode(url);
        }
      };

      await Promise.all(Array.from({ length: PRELOAD_CONCURRENCY }, worker));
    })();

    return () => {
      cancelled = true;
    };
  }, [urls]);
}

const INTRO_IMAGE_URLS = INTRO_FRAMES.map((f) => f.src);

export function IntroHost({ style, onDone, }: { style: IntroStyle; onDone: () => void; }) {
  usePreloadImages(INTRO_IMAGE_URLS);

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

    const totalImages = FRAME_COUNT;

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

  const images = INTRO_FRAMES;

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
              "intro-frame",
              isNearCurrent(idx, currentImage) ? "intro-frame-active" : "",
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

      {/* .text-clip-image / .animate-zoom-in / .intro-frame* 는 src/index.css 로 이동 */}
    </div>
  );
}