import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * 웨딩 인트로 화면 프로토타입
 *
 * 4가지 스타일:
 * - 'montage' (A): 마블 코믹스 스타일 - 사진들이 빠르게 지나가는 몽타주
 * - 'filmstrip' (B): 필름 스트립 - 세로로 내려오는 레트로 필름 감성
 * - 'game' (C): 인터랙티브 게임 - 도트 게임 스타일 잠금 해제
 * - 'gate' (D): 문/빛 입장 - 우아한 빛 효과와 입장 컨셉
 *
 * Usage:
 *  <IntroHost style="montage" onDone={() => setIntroDone(true)} />
 *  style을 "montage" | "filmstrip" | "game" | "gate" 로 바꾸면 됨!
 */

export type IntroStyle = "montage" | "filmstrip" | "game" | "gate";

export function IntroHost({
  style,
  onDone,
}: {
  style: IntroStyle;
  onDone: () => void;
}) {
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
 * 사진들이 빠르게 fade/zoom 되면서 지나가고 마지막에 문구
 * ------------------------- */
function MontageIntro({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0); // 0~5

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1000),
      setTimeout(() => setPhase(3), 1600),
      setTimeout(() => setPhase(4), 2200),
      setTimeout(() => setPhase(5), 2800),
      setTimeout(onDone, 3600),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  const images = useMemo(
    () => [
      { id: 1, text: "Our Journey" },
      { id: 2, text: "Together" },
      { id: 3, text: "Forever" },
      { id: 4, text: "In Love" },
    ],
    []
  );

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-b from-black via-neutral-900 to-black">
      {/* 몽타주 이미지들 */}
      {images.map((img, idx) => (
        <div
          key={img.id}
          className={`absolute inset-0 transition-all duration-500 ${
            phase === idx + 1
              ? "opacity-100 scale-100"
              : phase > idx + 1
              ? "opacity-0 scale-110"
              : "opacity-0 scale-95"
          }`}
        >
          <div
            className="h-full w-full bg-cover bg-center"
            style={{
              backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(/images/main_img2.webp)`,
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-white drop-shadow-lg">
                {img.text}
              </h2>
            </div>
          </div>
        </div>
      ))}

      {/* 마지막 로고/문구 */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 ${
          phase === 5 ? "opacity-100 scale-100" : "opacity-0 scale-90"
        }`}
      >
        <div className="text-center">
          <div className="mb-4 text-6xl">💍</div>
          <h1 className="text-3xl font-bold text-white">Wedding Invitation</h1>
          <div className="mt-4 h-px w-32 bg-white/50" />
          <p className="mt-4 text-lg text-white/90">
            정준 ❤️ 송희
          </p>
        </div>
      </div>

      {/* 스킵 버튼 */}
      <button
        onClick={onDone}
        className="absolute bottom-8 right-8 text-sm text-white/60 underline hover:text-white/90"
      >
        스킵
      </button>
    </div>
  );
}

/** -------------------------
 * B) 필름 스트립 레트로
 * 세로로 내려오는 필름 프레임, 레트로 감성
 * ------------------------- */
function FilmStripIntro({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0); // 0~100
  const [stopped, setStopped] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          setStopped(true);
          return 100;
        }
        return p + 2;
      });
    }, 30);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (stopped) {
      const timer = setTimeout(onDone, 1200);
      return () => clearTimeout(timer);
    }
  }, [stopped, onDone]);

  const frames = useMemo(
    () => [
      { id: 1, label: "01" },
      { id: 2, label: "02" },
      { id: 3, label: "03" },
      { id: 4, label: "04" },
      { id: 5, label: "05" },
    ],
    []
  );

  return (
    <div className="fixed inset-0 z-[100] bg-neutral-900">
      {/* 필름 스트립 */}
      <div className="relative mx-auto h-full w-full max-w-md overflow-hidden">
        {/* 필름 홀 (좌우) */}
        <div className="absolute left-0 top-0 z-10 h-full w-8 border-r-2 border-neutral-700 bg-neutral-800">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="mx-auto mt-8 h-4 w-4 rounded-sm border border-neutral-600 bg-neutral-700"
            />
          ))}
        </div>
        <div className="absolute right-0 top-0 z-10 h-full w-8 border-l-2 border-neutral-700 bg-neutral-800">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="mx-auto mt-8 h-4 w-4 rounded-sm border border-neutral-600 bg-neutral-700"
            />
          ))}
        </div>

        {/* 필름 프레임들 */}
        <div
          className="absolute inset-x-8 transition-transform duration-100 ease-linear"
          style={{
            transform: `translateY(${-progress * 5}px)`,
          }}
        >
          {frames.map((frame, idx) => (
            <div key={frame.id} className="mb-4 px-2">
              <div className="relative overflow-hidden border-2 border-neutral-700 bg-neutral-800">
                <img
                  src="/images/main_img2.webp"
                  alt={`Frame ${frame.label}`}
                  className="aspect-[3/4] w-full object-cover opacity-90 grayscale"
                />
                <div className="absolute bottom-2 right-2 rounded bg-black/50 px-2 py-1 font-mono text-xs text-orange-400">
                  {frame.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 정지된 후 문구 */}
        {stopped && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-neutral-900/80 backdrop-blur-sm">
            <div className="text-center">
              <div className="mb-4 font-mono text-sm text-orange-400">
                - FILM END -
              </div>
              <h2 className="text-2xl font-bold text-white">
                정준 & 송희의 결혼식에
                <br />
                초대합니다
              </h2>
              <div className="mt-4 text-sm text-neutral-400">📸 Click</div>
            </div>
          </div>
        )}
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
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-sm text-white/60 underline hover:text-white/90"
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
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

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
