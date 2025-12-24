// src/sections/HeroSection.tsx
import React, { useEffect, useRef, useState } from "react";
import type { WeddingConfig } from "../config/wedding";
import { Button } from "../components/Button";
import { asset } from "../utils/asset";

type HeroVariant = "A" | "B";

type Props = {
  data: WeddingConfig;
  onShare: () => void;
};

// function startOfDay(d: Date) {
//   const x = new Date(d);
//   x.setHours(0, 0, 0, 0);
//   return x;
// }

// function msToHMS(ms: number) {
//   const total = Math.max(0, Math.floor(ms / 1000));
//   const h = Math.floor(total / 3600);
//   const m = Math.floor((total % 3600) / 60);
//   const s = total % 60;
//   return { h, m, s };
// }

// function formatChip(msLeft: number, ddayDays: number, hms: { h: number; m: number; s: number }) {
//   if (msLeft <= 0) return "오늘이 그날!";
//   const within48h = msLeft > 0 && msLeft <= 48 * 60 * 60 * 1000;
//   if (!within48h) return `D-${ddayDays}`;
//   return `D-${ddayDays} · ${String(hms.h).padStart(2, "0")}:${String(hms.m).padStart(2, "0")}:${String(
//     hms.s
//   ).padStart(2, "0")}`;
// }

// function useDdayChip(targetISO: string) {
//   const target = useMemo(() => new Date(targetISO), [targetISO]);
//   const [now, setNow] = useState(() => new Date());

//   useEffect(() => {
//     const t = setInterval(() => setNow(new Date()), 1000);
//     return () => clearInterval(t);
//   }, []);

//   const ddayDays = useMemo(() => {
//     const diff = startOfDay(target).getTime() - startOfDay(now).getTime();
//     return Math.ceil(diff / (1000 * 60 * 60 * 24));
//   }, [now, target]);

//   const msLeft = target.getTime() - now.getTime();
//   const hms = msToHMS(msLeft);
//   return formatChip(msLeft, ddayDays, hms);
// }

/**
 * 캔버스 눈 파티클 (모바일 안정화)
 * - prefers-reduced-motion이면 "끄지 않고" 속도만 낮춤
 * - resize() rAF + timeout 보정
 */
function useSnowCanvas<T extends HTMLElement>(
  containerRef: React.RefObject<T | null>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  opts?: {
    count?: number;
    rMin?: number;
    rMax?: number;
    vyMin?: number;
    vyMax?: number;
    vxMin?: number;
    vxMax?: number;
    swingMin?: number;
    swingMax?: number;
    windMul?: number;
    alpha?: number;
  }
) {
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
    const speedMul = prefersReduce ? 0.35 : 1;

    let cw = 1;
    let ch = 1;
    let dpr = 1;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      cw = Math.max(1, Math.floor(rect.width));
      ch = Math.max(1, Math.floor(rect.height));
      dpr = Math.max(1, window.devicePixelRatio || 1);

      canvas.width = Math.floor(cw * dpr);
      canvas.height = Math.floor(ch * dpr);
      canvas.style.width = `${cw}px`;
      canvas.style.height = `${ch}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    requestAnimationFrame(resize);
    const late = window.setTimeout(resize, 250);

    const ro = new ResizeObserver(resize);
    ro.observe(container);

    type Flake = {
      x: number;
      y: number;
      r: number;
      vy: number;
      vx: number;
      swing: number;
      phase: number;
      life: number;
    };
    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    const count = opts?.count ?? 70;
    const rMin = opts?.rMin ?? 0.8;
    const rMax = opts?.rMax ?? 3.6;
    const vyMin = opts?.vyMin ?? 20;
    const vyMax = opts?.vyMax ?? 55;
    const vxMin = opts?.vxMin ?? -12;
    const vxMax = opts?.vxMax ?? 12;
    const swingMin = opts?.swingMin ?? 18;
    const swingMax = opts?.swingMax ?? 65;
    const windMul = opts?.windMul ?? 1;
    const alpha = opts?.alpha ?? 0.92;

    const flakes: Flake[] = Array.from({ length: count }).map(() => ({
      x: rand(0, cw),
      y: rand(0, ch),
      r: rand(rMin, rMax),
      vy: rand(vyMin, vyMax),
      vx: rand(vxMin, vxMax),
      swing: rand(swingMin, swingMax),
      phase: rand(0, Math.PI * 2),
      life: rand(3.5, 9.5),
    }));

    const reset = (f: Flake) => {
      const side = Math.random();
      if (side < 0.65) {
        f.x = rand(0, cw);
        f.y = -rand(10, 120);
      } else if (side < 0.825) {
        f.x = -rand(10, 80);
        f.y = rand(0, ch * 0.7);
      } else {
        f.x = cw + rand(10, 80);
        f.y = rand(0, ch * 0.7);
      }
      f.r = rand(rMin, rMax);
      f.vy = rand(vyMin, vyMax);
      f.vx = rand(vxMin, vxMax);
      f.swing = rand(swingMin, swingMax);
      f.phase = rand(0, Math.PI * 2);
      f.life = rand(3.5, 9.5);
    };

    const draw = (f: Flake) => {
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.fill();
    };

    let raf = 0;
    let last = performance.now();
    let t = 0;

    const tick = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      t += dt;

      ctx.clearRect(0, 0, cw, ch);

      const wind =
        (Math.sin(t * 0.6) * 18 + Math.sin(t * 1.15) * 10 + Math.sin(t * 2.3) * 4) *
        windMul;

      for (const f of flakes) {
        const sway = Math.sin(t * 2.4 + f.phase) * f.swing;

        f.x += ((f.vx + wind) * dt + sway * dt) * speedMul;
        f.y += f.vy * dt * speedMul;

        f.life -= dt * speedMul;
        if (f.y > ch + 90 || f.x < -120 || f.x > cw + 120 || f.life <= 0) reset(f);

        draw(f);
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.clearTimeout(late);
    };
  }, [containerRef, canvasRef]);
}

const HERO_VARIANT_KEY = "hero_variant_v1";
function readVariant(): HeroVariant {
  const v = localStorage.getItem(HERO_VARIANT_KEY);
  return v === "A" || v === "B" ? v : "B";
}

//시안 확정되면 해당 함수 주석&삭제
function VariantToggle({
  value,
  onChange,
}: {
  value: HeroVariant;
  onChange: (v: HeroVariant) => void;
}) {
  return (
    <div
      className={[
        "fixed z-[60]",
        "top-4 left-1/2 -translate-x-1/2",
        "flex items-center gap-2",
        "rounded-full bg-black/45 backdrop-blur",
        "px-2 py-2 shadow",
        "select-none",
      ].join(" ")}
      style={{ paddingTop: "max(env(safe-area-inset-top), 8px)" }}
    >
      <span className="px-2 text-[11px] text-white/85">임시</span>

      <button
        type="button"
        onClick={() => onChange("A")}
        className={[
          "h-8 px-3 rounded-full text-xs font-semibold transition",
          value === "A" ? "bg-white text-neutral-900" : "bg-white/10 text-white/85",
        ].join(" ")}
      >
        A안
      </button>

      <button
        type="button"
        onClick={() => onChange("B")}
        className={[
          "h-8 px-3 rounded-full text-xs font-semibold transition",
          value === "B" ? "bg-white text-neutral-900" : "bg-white/10 text-white/85",
        ].join(" ")}
      >
        B안
      </button>
    </div>
  );
}

/** ✅ 엔트리: 배포본에서 A/B 토글로 비교 */
export function HeroSection({ data, onShare }: Props) {
  const [variant, setVariant] = useState<HeroVariant>(() => readVariant());

  useEffect(() => {
    localStorage.setItem(HERO_VARIANT_KEY, variant);
  }, [variant]);

  return (
    <>
      {/* ✅ 임시 토글: 확정되면 이 컴포넌트와 localStorage만 지우면 됨 */}
      <VariantToggle value={variant} onChange={setVariant} />

      {variant === "A" ? (
        <HeroSectionA data={data} onShare={onShare} />
      ) : (
        <HeroSectionB data={data} onShare={onShare} />
      )}
    </>
  );
}
/** A안: 풀스크린 + 하단 패널 */
function HeroSectionA({ data }: Props) {
  // const chipText = useDdayChip(data.ceremony.dateISO);
  const heroImg = asset("images/main_img.webp");

  const heroRef = useRef<HTMLElement | null>(null);
  const snowRef = useRef<HTMLCanvasElement | null>(null);

  useSnowCanvas(heroRef, snowRef, {
    count: 70,
    rMin: 0.8,
    rMax: 3.6,
    vyMin: 18,
    vyMax: 50,
    vxMin: -10,
    vxMax: 10,
    swingMin: 14,
    swingMax: 55,
    alpha: 0.75,
    windMul: 0.9,
  });

  return (
    <section ref={heroRef} className="relative h-[100svh] w-full overflow-hidden">
      <img
        src={heroImg}
        alt="Wedding"
        className="absolute inset-0 h-full w-full object-cover"
        loading="eager"
        decoding="async"
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/10 to-black/65" />

      {/* 상단칩 */}
      {/* <div className="absolute left-0 right-0 top-0 z-10 pt-[max(env(safe-area-inset-top),16px)]">
        <div className="mx-auto flex max-w-md items-center justify-center px-5">
          <div className="rounded-full bg-white/80 px-4 py-2 backdrop-blur border border-neutral-200 shadow-sm">
            <span className="text-sm font-semibold text-neutral-900">{chipText}</span>
          </div>
        </div>
      </div> */}

      {/* 눈 캔버스 */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-[90%] overflow-hidden">
        <canvas ref={snowRef} className="h-full w-full" />
      </div>

      {/* 상단: 영어 문구 */}
      <div className="absolute inset-x-0 top-0 z-10 pt-[max(env(safe-area-inset-top),80px)]">
        <div className="mx-auto max-w-md px-5">
          <div className="motion-reduce:animate-none animate-[fadeSlideDown_1.2s_ease-out]">
            <TheWeddingOfTitle />
          </div>
        </div>
      </div>

      {/* 하단: 이름, 일자, 장소 (배경 없이) */}
      <div className="absolute inset-x-0 bottom-0 z-10 pb-[max(env(safe-area-inset-bottom),60px)]">
        <div className="mx-auto max-w-md px-5">
          <div className="text-center">
            <div className="text-[11px] tracking-[0.35em] text-white/70">
              GROOM &nbsp;·&nbsp; BRIDE
            </div>

            <h1
              className="text-white motion-reduce:animate-none animate-[fadeSlideUp_1s_ease-out_0.3s_both]"
              style={{
                fontFamily: '"Dancing Script","Allura","Parisienne",cursive',
                fontSize: "32px",
                lineHeight: 1.1,
                fontWeight: 500,
                letterSpacing: "0.03em",
                textShadow: "0 2px 16px rgba(0,0,0,0.42)",
              }}
            >
              JeongJun
              <span className="mx-3 text-2xl text-white/70">&amp;</span>
              SongHee
            </h1>

            <div
              className="mt-8 motion-reduce:animate-none animate-[fadeSlideUp_1s_ease-out_0.5s_both]"
              style={{
                fontFamily: '"Noto Serif KR","MaruBuri","Nanum Myeongjo",serif',
                textShadow: "0 2px 12px rgba(0,0,0,0.28)",
              }}
            >
              {/* 날짜 */}
              <div
                className="text-[14px] font-light tracking-[0.12em]"
                style={{ color: "rgba(255,255,255,0.85)" }}
              >
                {data.ceremony.dateText}
              </div>

              {/* 장소 */}
              <div
                className="text-[16px] font-medium tracking-[0.06em]"
                style={{ color: "rgba(255,255,255,0.95)" }}
              >
                {data.ceremony.venueName}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}

/** B안: 카드 사진 위에 눈 (모바일 안정화) */
function HeroSectionB({ data, onShare }: Props) {
  // const chipText = useDdayChip(data.ceremony.dateISO);

  const cardRef = useRef<HTMLDivElement | null>(null);
  const snowRef = useRef<HTMLCanvasElement | null>(null);

  useSnowCanvas(cardRef, snowRef, {
    count: 70,
    rMin: 0.8,
    rMax: 3.6,
    vyMin: 20,
    vyMax: 55,
    vxMin: -12,
    vxMax: 12,
    swingMin: 18,
    swingMax: 65,
    alpha: 0.92,
    windMul: 1.0,
  });

  const photoImg = asset("images/main_img.webp");
  const ribbonImg = asset("images/ribbon.png");

  return (
    <section className="w-full bg-neutral-100">
      <div className="mx-auto max-w-md px-5 pt-[max(env(safe-area-inset-top),24px)] pb-[max(env(safe-area-inset-bottom),24px)] min-h-[100svh] flex flex-col">
        {/* 상단: 신랑 - 리본 - 신부 */}
        <div className="pt-6">
          <div className="flex items-center justify-center gap-20">
            <div className="text-center">
              <div className="text-[13px] tracking-[0.25em] text-neutral-500">GROOM</div>
              <div className="mt-1 text-xl text-neutral-700">{data.couple.groomName}</div>
            </div>

            <div className="flex items-center justify-center">
              <img src={ribbonImg} alt="logo" className="h-8 w-auto object-contain" />
            </div>

            <div className="text-center">
              <div className="text-[13px] tracking-[0.25em] text-neutral-500">BRIDE</div>
              <div className="mt-1 text-xl text-neutral-700">{data.couple.brideName}</div>
            </div>
          </div>
        </div>

        {/* 중간: 사진 카드 */}
        <div className="mt-6 flex-1 flex items-center">
          <div className="w-full">
            <div
              ref={cardRef}
              className="relative aspect-[2/3] w-full max-h-[78vh] overflow-hidden rounded-3xl border border-neutral-200 bg-white
                         shadow-[0_14px_42px_-22px_rgba(0,0,0,0.26),0_2px_6px_0_rgba(0,0,0,0.14)]"
            >
              <img src={photoImg} alt="Wedding" className="absolute inset-0 h-full w-full object-cover" />

              <div className="pointer-events-none absolute inset-0 z-20">
                <canvas ref={snowRef} className="h-full w-full" />
              </div>
            </div>
          </div>
        </div>

        {/* 하단 */}
        <div className="mt-7">
          {/* <div className="flex items-center justify-center">
            <div className="rounded-full bg-white px-4 py-2 border border-neutral-200 shadow-sm">
              <span className="text-sm font-semibold text-neutral-900">{chipText}</span>
            </div>
          </div> */}

          <div className="mt-4 text-center text-neutral-800">
            <div className="font-medium text-base">{data.ceremony.dateText}</div>
            <div className="mt-1 text-neutral-600 text-lg">{data.ceremony.venueName}</div>
          </div>

          <div className="mt-5">
            <Button fullWidth variant="secondary" onClick={onShare}>
              청첩장 공유하기
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}


function TheWeddingOfTitle() {
  return (
    <div className="flex flex-col items-center justify-center">
      <svg
        className="w-[320px] max-w-[92%] h-[78px] overflow-visible"
        viewBox="0 0 900 200"
        fill="none"
        aria-label="The Wedding Of"
      >
        <defs>
          <filter id="softGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ✅ 1) 항상 보이는 베이스 텍스트(희미하게) */}
        <text x="50%" y="155" textAnchor="middle" className="hero-script-base">
          The Wedding Of
        </text>

        {/* ✅ 2) 위에 덮는 "써지는" 텍스트(stroke만) */}
        <text x="50%" y="155" textAnchor="middle" className="hero-script-draw">
          The Wedding Of
        </text>

        {/* ✅ 하트: 마지막에 등장(딜레이) + 위치/크기 조절은 transform 한 줄로 */}
        <path
          d="M450 42
             C430 18, 392 18, 392 48
             C392 82, 450 112, 450 112
             C450 112, 508 82, 508 48
             C508 18, 470 18, 450 42 Z"
          fill="rgba(255,255,255,0.92)"
          className="hero-heart"
          transform="translate(155,-10) scale(0.26)"
        />
      </svg>

      <div className="mt-1 h-px w-28 bg-white/40" />

      <style>{`
        /* ✅ 공통 폰트 */
        .hero-script-base,
        .hero-script-draw {
          font-family: "Great Vibes", "Allura", "Dancing Script", "Parisienne", cursive;
          font-size: 110px;
          font-weight: 400;
          letter-spacing: 0.08em;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        /* ✅ 베이스: 완성된 글씨(항상 보임) */
        .hero-script-base {
          fill: rgba(255,255,255,0.14);
          stroke: rgba(255,255,255,0.22);
          stroke-width: 1.2;
          filter: url(#softGlow);
        }

        /* ✅ 드로잉: 진짜로 "써지는" 레이어 */
        .hero-script-draw {
          fill: transparent;
          stroke: rgba(255,255,255,0.95);
          stroke-width: 2.6;
          filter: url(#softGlow);

          stroke-dasharray: 1600;
          stroke-dashoffset: 1600;
          animation: writeText 2.2s ease-out 0.15s forwards;
        }

        @keyframes writeText {
          to { stroke-dashoffset: 0; }
        }

        /* ✅ 하트: 문구 끝난 뒤 등장 */
        .hero-heart {
          opacity: 0;
          transform-origin: center;
          animation: heartIn 0.35s ease-out 1.75s forwards;
        }

        @keyframes heartIn {
          0%   { opacity: 0; transform: translate(255px,-10px) scale(0.20); }
          70%  { opacity: 1; transform: translate(255px,-10px) scale(0.30); }
          100% { opacity: 1; transform: translate(255px,-10px) scale(0.26); }
        }
      `}</style>
    </div>
  );
}
