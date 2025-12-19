// src/sections/HeroSection.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import type { WeddingConfig } from "../config/wedding";
import { Button } from "../components/Button";
import { asset } from "../utils/asset";

type HeroVariant = "A" | "B";

type Props = {
  data: WeddingConfig;
  onShare: () => void;
};

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function msToHMS(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return { h, m, s };
}

function formatChip(msLeft: number, ddayDays: number, hms: { h: number; m: number; s: number }) {
  if (msLeft <= 0) return "오늘이 그날!";
  const within48h = msLeft > 0 && msLeft <= 48 * 60 * 60 * 1000;
  if (!within48h) return `D-${ddayDays}`;
  return `D-${ddayDays} · ${String(hms.h).padStart(2, "0")}:${String(hms.m).padStart(2, "0")}:${String(
    hms.s
  ).padStart(2, "0")}`;
}

function useDdayChip(targetISO: string) {
  const target = useMemo(() => new Date(targetISO), [targetISO]);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const ddayDays = useMemo(() => {
    const diff = startOfDay(target).getTime() - startOfDay(now).getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }, [now, target]);

  const msLeft = target.getTime() - now.getTime();
  const hms = msToHMS(msLeft);
  return formatChip(msLeft, ddayDays, hms);
}

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
        if (f.y > ch + 60 || f.x < -120 || f.x > cw + 120 || f.life <= 0) reset(f);

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
function HeroSectionA({ data, onShare }: Props) {
  const chipText = useDdayChip(data.ceremony.dateISO);
  const heroImg = asset("images/main_img.jpg");

  const heroRef = useRef<HTMLElement | null>(null);
  const snowRef = useRef<HTMLCanvasElement | null>(null);

  useSnowCanvas(heroRef, snowRef, {
    count: 60,
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
      <div className="absolute left-0 right-0 top-0 z-10 pt-[max(env(safe-area-inset-top),16px)]">
        <div className="mx-auto flex max-w-md items-center justify-center px-5">
          <div className="rounded-full bg-white/80 px-4 py-2 backdrop-blur border border-neutral-200 shadow-sm">
            <span className="text-sm font-semibold text-neutral-900">{chipText}</span>
          </div>
        </div>
      </div>

      {/* 눈 캔버스 */}
      <div className="pointer-events-none absolute inset-0 z-[5]">
        <canvas ref={snowRef} className="h-full w-full" />
      </div>

      {/* 하단 패널 */}
      <div className="absolute inset-x-0 bottom-0 z-10">
        <div className="mx-auto max-w-md px-5 pb-[max(env(safe-area-inset-bottom),20px)]">
          <div className="rounded-t-3xl bg-white/10 backdrop-blur-md border border-white/20 px-6 pt-6 pb-5 shadow-lg">
            <div className="text-[11px] tracking-[0.22em] text-white/75 text-center">WEDDING INVITATION</div>

            <h1 className="mt-3 text-center text-3xl font-semibold text-white">
              {data.couple.groomName}
              <span className="mx-2 text-white/50">&amp;</span>
              {data.couple.brideName}
            </h1>

            <div className="mx-auto mt-4 h-px w-12 bg-white/40" />

            <p className="mt-4 text-center text-sm leading-6 text-white/85">
              소중한 분들을 모시고
              <br />
              저희의 새로운 시작을 함께하려 합니다.
            </p>

            <div className="mt-5 text-center text-sm text-white/90">
              <div className="font-medium">{data.ceremony.dateText}</div>
              <div className="mt-1 text-white/75">{data.ceremony.venueName}</div>
            </div>

            <div className="mt-6">
              <Button fullWidth variant="secondary" onClick={onShare}>
                청첩장 공유하기
              </Button>
            </div>

            {/* Scroll hint */}
            <div className="mt-5 flex flex-col items-center gap-2">
              <span className="text-[11px] text-white/70">아래로 스크롤</span>
              <span
                className="h-6 w-4 rounded-full border border-white/40 flex items-start justify-center p-[3px]
                           motion-reduce:animate-none animate-[bounceDot_1.4s_infinite]"
                aria-hidden
              >
                <span className="block h-1.5 w-1.5 rounded-full bg-white/70" />
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounceDot {
          0%, 100% { transform: translateY(0); opacity: .8; }
          50% { transform: translateY(8px); opacity: 1; }
        }
      `}</style>
    </section>
  );
}

/** B안: 카드 사진 위에 눈 (모바일 안정화) */
function HeroSectionB({ data, onShare }: Props) {
  const chipText = useDdayChip(data.ceremony.dateISO);

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

  const photoImg = asset("images/main_img.jpg");
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
          <div className="flex items-center justify-center">
            <div className="rounded-full bg-white px-4 py-2 border border-neutral-200 shadow-sm">
              <span className="text-sm font-semibold text-neutral-900">{chipText}</span>
            </div>
          </div>

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
