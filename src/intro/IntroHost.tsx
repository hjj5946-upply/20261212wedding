import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Drop-in intro prototypes (Option 1~3) you can preview while developing.
 * - Option1: Lock/Swipe to open
 * - Option2: Film/Polaroid quick montage
 * - Option3: Thumbnail tiles converge (mini "cinematic" intro)
 *
 * Usage idea (in App/Invitation):
 *  const [introDone, setIntroDone] = useState(false);
 *  return (
 *    <>
 *      {!introDone && <IntroHost option={1} onDone={() => setIntroDone(true)} />}
 *      {introDone && <Invitation />}
 *    </>
 *  );
 */

export function IntroHost({
  option,
  onDone,
}: {
  option: 1 | 2 | 3;
  onDone: () => void;
}) {
  if (option === 1) return <IntroLock onDone={onDone} />;
  if (option === 2) return <IntroFilm onDone={onDone} />;
  return <IntroTiles onDone={onDone} />;
}

/** -------------------------
 * Option 1) Lock/Swipe to open
 * ------------------------- */
function IntroLock({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0); // 0~1
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);

  const done = progress >= 1;

  useEffect(() => {
    if (!done) return;
    const t = setTimeout(onDone, 450);
    return () => clearTimeout(t);
  }, [done, onDone]);

  const onPointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    startX.current = e.clientX;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const dx = e.clientX - startX.current;
    const p = Math.max(0, Math.min(1, dx / 220));
    setProgress(p);
  };
  const onPointerUp = () => {
    setDragging(false);
    if (progress < 0.85) setProgress(0);
    else setProgress(1);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white">
      <div className="mx-auto flex h-full max-w-md flex-col justify-between px-5 py-10">
        <div className="text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-wedding-gray-200 bg-white px-4 py-2 text-xs text-wedding-gray-600">
            <span className="text-base">✉️</span>
            초대장이 도착했습니다
          </div>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-neutral-900">
            Invitation
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            아래 손잡이를 오른쪽으로 밀어 열어주세요
          </p>
        </div>

        {/* envelope */}
        <div className="relative mx-auto w-full">
          <div className="relative overflow-hidden rounded-3xl border border-wedding-gray-200 bg-white shadow">
            <div className="h-44 bg-gradient-to-b from-wedding-ivory-50 to-white" />
            <div className="px-6 pb-6">
              <div className="mt-2 h-2 w-24 rounded-full bg-wedding-gray-100" />
              <div className="mt-2 h-2 w-40 rounded-full bg-wedding-gray-100" />
              <div className="mt-2 h-2 w-32 rounded-full bg-wedding-gray-100" />
            </div>

            {/* seal */}
            <div className="pointer-events-none absolute left-1/2 top-24 -translate-x-1/2">
              <div className="grid h-14 w-14 place-items-center rounded-full border border-wedding-gold-300 bg-wedding-gold-100 text-lg">
                ✨
              </div>
            </div>
          </div>

          {/* slider */}
          <div className="mt-6 rounded-2xl border border-wedding-gray-200 bg-wedding-ivory-50 p-2">
            <div
              className="relative h-12 rounded-xl bg-white"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              <div
                className="absolute inset-y-0 left-0 rounded-xl bg-gradient-to-r from-wedding-gold-100 to-transparent"
                style={{ width: `${Math.round(progress * 100)}%`, opacity: 0.9 }}
              />
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2"
                style={{ transform: `translate(${progress * 220}px, -50%)` }}
              >
                <div className="grid h-10 w-10 place-items-center rounded-xl border border-wedding-gray-200 bg-white shadow-sm">
                  🔓
                </div>
              </div>
              <div className="pointer-events-none absolute inset-0 grid place-items-center text-xs text-neutral-500">
                {done ? "열리는 중…" : "Slide to open"}
              </div>
            </div>

            <div className="mt-3 flex justify-between text-[11px] text-neutral-400">
              <button className="underline" onClick={onDone}>
                바로 보기
              </button>
              <span>1~2초</span>
            </div>
          </div>
        </div>
      </div>

      {/* exit animation overlay */}
      <div
        className={`pointer-events-none fixed inset-0 bg-white transition-opacity duration-300 ${
          done ? "opacity-0" : "opacity-0"
        }`}
      />
    </div>
  );
}

/** -------------------------
 * Option 2) Film / Polaroid montage
 * ------------------------- */
function IntroFilm({ onDone }: { onDone: () => void }) {
  // Use placeholders now; later replace with wedding photos.
  const frames = useMemo(
    () => [
      { label: "01", title: "Us" },
      { label: "02", title: "Moments" },
      { label: "03", title: "Promise" },
      { label: "04", title: "Together" },
    ],
    []
  );

  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setStep((s) => s + 1);
    }, 520);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (step < frames.length + 1) return;
    const t = setTimeout(onDone, 350);
    return () => clearTimeout(t);
  }, [step, frames.length, onDone]);

  return (
    <div className="fixed inset-0 z-[100] bg-white">
      <div className="mx-auto flex h-full max-w-md flex-col justify-between px-5 py-10">
        <div className="text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-wedding-gray-200 bg-white px-4 py-2 text-xs text-wedding-gray-600">
            <span className="text-base">🎞️</span>
            우리의 필름
          </div>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-neutral-900">
            Opening
          </h1>
          <p className="mt-2 text-sm text-neutral-500">짧은 인트로 후 본문으로 이동합니다</p>
        </div>

        <div className="relative">
          <div className="grid grid-cols-2 gap-3">
            {frames.map((f, i) => {
              const active = i <= step - 1;
              return (
                <div
                  key={f.label}
                  className={`rounded-3xl border border-wedding-gray-200 bg-white p-3 shadow-sm transition-all duration-300 ${
                    active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                  }`}
                >
                  <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-gradient-to-b from-wedding-ivory-50 to-white" />
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-xs font-medium text-neutral-800">{f.title}</div>
                    <div className="text-[11px] text-neutral-400">{f.label}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div
            className={`mt-6 text-center text-xs text-neutral-400 transition-opacity duration-300 ${
              step >= frames.length ? "opacity-100" : "opacity-0"
            }`}
          >
            ↓
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-neutral-400">
          <button className="underline" onClick={onDone}>
            스킵
          </button>
          <span>약 2초</span>
        </div>
      </div>
    </div>
  );
}

/** -------------------------
 * Option 3) Thumbnail tiles converge
 * ------------------------- */
function IntroTiles({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<"scatter" | "gather" | "reveal">("scatter");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("gather"), 1350);
    const t2 = setTimeout(() => setPhase("reveal"), 2050);
    const t3 = setTimeout(onDone, 2450);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onDone]);

  const tiles = useMemo(() => {
    // 12 tiles: later swap to actual photo thumbnails.
    return Array.from({ length: 12 }).map((_, i) => {
      const angle = (i / 12) * Math.PI * 2;
      const r = 110 + (i % 3) * 18;
      return {
        id: i,
        x: Math.cos(angle) * r,
        y: Math.sin(angle) * r,
        rot: (i - 6) * 6,
      };
    });
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-white">
      <div className="mx-auto flex h-full max-w-md flex-col justify-between px-5 py-10">
        <div className="text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-wedding-gray-200 bg-white px-4 py-2 text-xs text-wedding-gray-600">
            <span className="text-base">✨</span>
            조각들이 모여
          </div>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-neutral-900">
            One Story
          </h1>
          <p className="mt-2 text-sm text-neutral-500">짧게, 강하게. 그리고 본문으로</p>
        </div>

        <div className="relative mx-auto mt-6 grid h-[360px] w-full place-items-center">
          {/* center card */}
          <div
            className={`absolute rounded-3xl border border-wedding-gray-200 bg-white shadow-sm transition-all duration-500 ${
              phase === "reveal" ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
            style={{ width: 240, height: 300 }}
          >
            <div className="h-full w-full rounded-3xl bg-gradient-to-b from-wedding-ivory-50 to-white" />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-neutral-500">
              Invitation
            </div>
          </div>

          {/* tiles */}
          {tiles.map((t) => {
            const gather = phase !== "scatter";
            return (
              <div
                key={t.id}
                className="absolute rounded-2xl border border-wedding-gray-200 bg-white shadow-sm"
                style={{
                  width: 74,
                  height: 92,
                  transform: gather
                    ? `translate(0px, 0px) rotate(0deg) scale(0.9)`
                    : `translate(${t.x}px, ${t.y}px) rotate(${t.rot}deg) scale(0.9)`,
                  transition: "transform 550ms cubic-bezier(0.22, 1, 0.36, 1), opacity 350ms",
                  opacity: phase === "reveal" ? 0 : 1,
                }}
              >
                <div className="h-full w-full rounded-2xl bg-gradient-to-b from-wedding-ivory-50 to-white" />
              </div>
            );
          })}

          {/* subtle gold line */}
          <div className="pointer-events-none absolute bottom-6 left-1/2 h-px w-32 -translate-x-1/2 bg-wedding-gold-200" />
        </div>

        <div className="flex items-center justify-between text-[11px] text-neutral-400">
          <button className="underline" onClick={onDone}>
            스킵
          </button>
          <span>약 1.7초</span>
        </div>
      </div>
    </div>
  );
}
