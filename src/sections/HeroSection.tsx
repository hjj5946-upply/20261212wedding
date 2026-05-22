// src/sections/HeroSection.tsx
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import type { WeddingConfig } from "../config/wedding";
import { asset } from "../utils/asset";

type Props = {
  data: WeddingConfig;
  onShare: () => void;
};

// ─────────────────────────────────────────────
// 눈 파티클 캔버스 훅
// - prefers-reduced-motion이면 속도만 낮춤
// - ResizeObserver + rAF 보정
// ─────────────────────────────────────────────
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

    const prefersReduce =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
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
        (Math.sin(t * 0.6) * 18 +
          Math.sin(t * 1.15) * 10 +
          Math.sin(t * 2.3) * 4) *
        windMul;

      for (const f of flakes) {
        const sway = Math.sin(t * 2.4 + f.phase) * f.swing;
        f.x += ((f.vx + wind) * dt + sway * dt) * speedMul;
        f.y += f.vy * dt * speedMul;
        f.life -= dt * speedMul;

        if (f.y > ch + 90 || f.x < -120 || f.x > cw + 120 || f.life <= 0)
          reset(f);

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

// ─────────────────────────────────────────────
// "The Wedding Of" SVG 타이틀
// stroke-dashoffset 써지는 효과는 CSS로 유지
// (SVG path 길이 기반이라 GSAP보다 CSS가 더 정밀)
// ─────────────────────────────────────────────
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

        {/* 베이스: 항상 희미하게 보이는 완성 글씨 */}
        <text x="50%" y="155" textAnchor="middle" className="hero-script-base">
          The Wedding Of
        </text>

        {/* 드로잉: 실제로 "써지는" 레이어 */}
        <text x="50%" y="155" textAnchor="middle" className="hero-script-draw">
          The Wedding Of
        </text>

        {/* 하트: 써지기 끝난 뒤 등장 */}
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

      {/* 구분선 */}
      <div className="mt-1 h-px w-28 bg-white/40" />

      <style>{`
        .hero-script-base,
        .hero-script-draw {
          font-family: "Great Vibes", "Allura", "Dancing Script", "Parisienne", cursive;
          font-size: 110px;
          font-weight: 400;
          letter-spacing: 0.08em;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        /* 완성된 글씨 — 항상 희미하게 */
        .hero-script-base {
          fill: rgba(255,255,255,0.14);
          stroke: rgba(255,255,255,0.22);
          stroke-width: 1.2;
          filter: url(#softGlow);
        }

        /* 써지는 레이어 */
        .hero-script-draw {
          fill: transparent;
          stroke: rgba(255,255,255,0.95);
          stroke-width: 2.6;
          filter: url(#softGlow);
          stroke-dasharray: 1600;
          stroke-dashoffset: 1600;
          animation: writeText 2.0s ease-out 0.11s forwards;
        }

        @keyframes writeText {
          to { stroke-dashoffset: 0; }
        }

        /* 하트 — 써지기 끝난 뒤 등장 */
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

// ─────────────────────────────────────────────
// HeroSection (A안 확정)
// ─────────────────────────────────────────────
export function HeroSection({ data }: Props) {
  const heroImg = asset("images/main_img.webp");

  // refs
  const sectionRef = useRef<HTMLElement | null>(null);
  const snowRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const labelRef = useRef<HTMLDivElement | null>(null);   // "GROOM · BRIDE"
  const nameRef = useRef<HTMLHeadingElement | null>(null);
  const metaRef = useRef<HTMLDivElement | null>(null);   // 날짜 + 장소
  const topBlockRef = useRef<HTMLDivElement | null>(null);   // "The Wedding Of" 래퍼

  // 눈 파티클
  useSnowCanvas(sectionRef, snowRef, {
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

  // ── GSAP 진입 타임라인 ──────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // ① 배경 이미지: scale 1.08 → 1 (Ken Burns 느낌)
      tl.from(imgRef.current, {
        scale: 1.08,
        duration: 2.4,
        ease: "power2.out",
      }, 0);

      tl.from(snowRef.current, {
        opacity: 0,
        duration: 2.0,
        ease: "power2.out",
      }, 0.8);

      // ② "The Wedding Of" 래퍼: 위에서 내려오며 fade
      //    (SVG 내부 writeText 애니는 CSS가 담당, 래퍼만 GSAP으로)
      tl.from(topBlockRef.current, {
        y: -28,
        opacity: 0,
        duration: 1.0,
        ease: "expo.out",
      }, 0.3);

      // ③ "GROOM · BRIDE" 레이블
      tl.from(labelRef.current, {
        y: 16,
        opacity: 0,
        duration: 0.7,
      }, 1.4);

      // ④ 이름 (JeongJun & SongHee) — 약간 더 크게 올라오며
      tl.from(nameRef.current, {
        y: 24,
        opacity: 0,
        duration: 0.85,
        ease: "expo.out",
      }, 1.75);

      // ⑤ 날짜 + 장소 — 마지막에 부드럽게
      tl.from(metaRef.current, {
        y: 18,
        opacity: 0,
        duration: 0.75,
      }, 2.15);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative h-[100svh] w-full overflow-hidden">

      {/* 배경 이미지 */}
      <img
        ref={imgRef}
        src={heroImg}
        alt="Wedding"
        className="absolute inset-0 h-full w-full object-cover"
        loading="eager"
        decoding="async"
      />

      {/* 그라디언트 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/10 to-black/65" />

      {/* 눈 캔버스 */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-[90%] overflow-hidden">
        <canvas ref={snowRef} className="h-full w-full" />
      </div>

      {/* ── 상단: "The Wedding Of" ── */}
      <div
        ref={topBlockRef}
        className="absolute inset-x-0 top-0 z-10 pt-[max(env(safe-area-inset-top),80px)]"
      >
        <div className="mx-auto max-w-md px-5">
          <TheWeddingOfTitle />
        </div>
      </div>

      {/* ── 하단: 이름 · 날짜 · 장소 ── */}
      <div className="absolute inset-x-0 bottom-0 z-10 pb-[max(env(safe-area-inset-bottom),60px)]">
        <div className="mx-auto max-w-md px-5">
          <div className="text-center">

            {/* GROOM · BRIDE 레이블 */}
            <div
              ref={labelRef}
              className="text-[11px] tracking-[0.35em] text-white/70"
            >
              GROOM &nbsp;·&nbsp; BRIDE
            </div>

            {/* 이름 */}
            <h1
              ref={nameRef}
              className="text-white"
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

            {/* 날짜 + 장소 */}
            <div
              ref={metaRef}
              className="mt-8"
              style={{
                fontFamily: '"Noto Serif KR","MaruBuri","Nanum Myeongjo",serif',
                textShadow: "0 2px 12px rgba(0,0,0,0.28)",
              }}
            >
              <div
                className="text-[14px] font-light tracking-[0.12em]"
                style={{ 
                  color: "rgba(255,255,255,0.85)" }}
              >
                {data.ceremony.dateText}
              </div>
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

    </section>
  );
}