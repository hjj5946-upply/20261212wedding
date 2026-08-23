// src/sections/HeroSection.tsx
import React, { memo, useEffect, useRef } from "react";
import { gsap } from "gsap";
import type { WeddingConfig } from "../config/wedding";
import { asset } from "../utils/asset";
import { PhotoGuard } from "../components/PhotoGuard";
import { useStableViewportHeight } from "../utils/useStableViewportHeight";
import { isBgmPlaying, playBgm } from "../utils/bgm";

type Props = {
  data: WeddingConfig;
  onShare: () => void;
};

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
      const nextCw = Math.max(1, Math.floor(rect.width));
      const nextCh = Math.max(1, Math.floor(rect.height));
      const nextDpr = Math.max(1, window.devicePixelRatio || 1);

      // canvas.width 에 대입하면 크기가 같아도 버퍼가 새로 잡히고 화면이 지워진다.
      // 인앱 브라우저는 바가 접힐 때마다 ResizeObserver 를 때리므로 반드시 걸러낸다.
      if (nextCw === cw && nextCh === ch && nextDpr === dpr) return;

      cw = nextCw;
      ch = nextCh;
      dpr = nextDpr;

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
    let running = false;
    let last = performance.now();
    let t = 0;

    const tick = (now: number) => {
      if (!running) return;

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

    // 눈은 히어로 영역 안에서만 보인다. 화면에서 벗어나거나 탭이 백그라운드로
    // 가면 루프를 멈춘다(보이는 결과는 동일, 스크롤 이후 CPU/배터리 소모 제거).
    const start = () => {
      if (running) return;
      running = true;
      last = performance.now(); // 멈춘 동안의 시간 점프 방지
      raf = requestAnimationFrame(tick);
    };

    const stop = () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    let visible = true;

    const sync = () => {
      if (visible && !document.hidden) start();
      else stop();
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        sync();
      },
      { threshold: 0 }
    );
    io.observe(container);

    document.addEventListener("visibilitychange", sync);
    start();

    return () => {
      stop();
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      ro.disconnect();
      window.clearTimeout(late);
    };
  }, [containerRef, canvasRef]);
}

// ─────────────────────────────────────────────
// HeroSection
// ─────────────────────────────────────────────
const HERO_IMG = asset("images/main_img.webp");

function HeroSectionBase({ data: _data }: Props) {
  const heroImg = HERO_IMG;

  // 뷰포트 단위(100svh)로 두면 카카오 인앱 브라우저에서 바가 접힐 때마다
  // 섹션 높이가 변해 배경/원본 이미지가 같이 늘었다 줄었다 한다. px 로 고정한다.
  const stableHeight = useStableViewportHeight();

  const sectionRef = useRef<HTMLElement | null>(null);
  const snowRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

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

  // ── GSAP: 배경 이미지 + 눈 페이드인 ──────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      // 배경 이미지: Ken Burns
      tl.from(imgRef.current, {
        scale: 1.08,
        duration: 2.4,
      }, 0);

      // 눈: 서서히 등장
      tl.from(snowRef.current, {
        opacity: 0,
        duration: 2.0,
      }, 0.8);

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (isBgmPlaying()) return;

    const tryPlay = () => {
      if (isBgmPlaying()) return;
      playBgm().catch(() => { });
    };

    document.addEventListener("touchend", tryPlay, { once: true });
    document.addEventListener("click", tryPlay, { once: true });

    return () => {
      document.removeEventListener("touchend", tryPlay);
      document.removeEventListener("click", tryPlay);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-[100svh] w-full overflow-hidden"
      style={{ height: `${stableHeight}px` }}
    >

      {/* 배경 이미지 */}
      {/* <img
        ref={imgRef}
        src={heroImg}
        alt="Wedding"
        className="absolute inset-0 h-full w-full object-contain"
        // ✅ object-contain: 이미지 전체가 잘리지 않고 보임
        // 양옆 잘림이 싫으면 object-contain, 꽉 채우려면 object-cover
        loading="eager"
        decoding="async"
      /> */}

      {/* 블러 배경 이미지 */}
      <img
        src={heroImg}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover scale-110 blur-xl opacity-80"
        decoding="async"
      />

      {/* 원본 이미지 (같은 URL이므로 요청은 1회) */}
      <img
        ref={imgRef}
        src={heroImg}
        alt="Wedding"
        className="absolute inset-0 h-full w-full object-contain"
        loading="eager"
        decoding="async"
        fetchPriority="high"
      />

      {/* 길게 눌러 저장 차단. 이 섹션엔 조작 UI가 없어 전체를 덮어도 된다. */}
      <PhotoGuard className="z-[6]" />

      {/* 눈 캔버스 */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-[90%] overflow-hidden">
        <canvas ref={snowRef} className="h-full w-full" />
      </div>

      {/* ── 주석처리: 상단 "The Wedding Of" 문구 ──
      <div ref={topBlockRef} className="absolute inset-x-0 top-0 z-10 pt-[max(env(safe-area-inset-top),80px)]">
        <div className="mx-auto max-w-md px-5">
          <TheWeddingOfTitle />
        </div>
      </div>
      ── */}

      {/* ── 주석처리: 하단 이름 · 날짜 · 장소 ──
      <div className="absolute inset-x-0 bottom-0 z-10 pb-[max(env(safe-area-inset-bottom),60px)]">
        <div className="mx-auto max-w-md px-5">
          <div className="text-center">
            <div ref={labelRef} className="text-[11px] tracking-[0.35em] text-white/70">
              GROOM · BRIDE
            </div>
            <h1 ref={nameRef} className="text-white" style={{ fontFamily: '"Dancing Script","Allura","Parisienne",cursive', fontSize: "32px" }}>
              JeongJun & SongHee
            </h1>
            <div ref={metaRef} className="mt-8">
              <div>{data.ceremony.dateText}</div>
              <div>{data.ceremony.venueName}</div>
            </div>
          </div>
        </div>
      </div>
      ── */}

    </section>
  );
}

export const HeroSection = memo(HeroSectionBase);