import { useEffect, useMemo, useState, useRef } from "react";
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
  return `D-${ddayDays} · ${String(hms.h).padStart(2, "0")}:${String(hms.m).padStart(
    2,
    "0"
  )}:${String(hms.s).padStart(2, "0")}`;
}

export function HeroSection({ data, onShare }: Props) {
  const variant: HeroVariant = "B";

  const heroRef = useRef<HTMLElement | null>(null);
  const heroSnowRef = useRef<HTMLCanvasElement | null>(null);

  const target = useMemo(() => new Date(data.ceremony.dateISO), [data.ceremony.dateISO]);
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
  const chipText = formatChip(msLeft, ddayDays, hms);

  const heroImg = asset("images/main_img.jpg");

  if (variant === "B") {

    return <HeroSectionB data={data} onShare={onShare} />;
  }

  useEffect(() => {
    if (variant !== "A") return;
  
    const canvas = heroSnowRef.current;
    const hero = heroRef.current;
    if (!canvas || !hero) return;
  
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
  
    const prefersReduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (prefersReduce) return;
  
    let cw = 0, ch = 0, dpr = 1;
  
    const resize = () => {
      const rect = hero.getBoundingClientRect();
      dpr = Math.max(1, window.devicePixelRatio || 1);
      cw = Math.max(1, Math.floor(rect.width));
      ch = Math.max(1, Math.floor(rect.height));
  
      canvas.width = Math.floor(cw * dpr);
      canvas.height = Math.floor(ch * dpr);
      canvas.style.width = `${cw}px`;
      canvas.style.height = `${ch}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
  
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(hero);
  
    type Flake = { x:number; y:number; r:number; vy:number; vx:number; swing:number; phase:number; life:number; };
    const rand = (a:number, b:number) => a + Math.random() * (b - a);
  
    const count = 60;
    const flakes: Flake[] = Array.from({ length: count }).map(() => ({
      x: rand(0, cw),
      y: rand(0, ch),
      r: rand(0.8, 3.6),       
      vy: rand(18, 50),
      vx: rand(-10, 10),
      swing: rand(14, 55),
      phase: rand(0, Math.PI * 2),
      life: rand(3.5, 9.5),
    }));
  
    const reset = (f: Flake) => {
      const side = Math.random();
      if (side < 0.7) { f.x = rand(0, cw); f.y = -rand(10, 120); }
      else if (side < 0.85) { f.x = -rand(10, 80); f.y = rand(0, ch * 0.7); }
      else { f.x = cw + rand(10, 80); f.y = rand(0, ch * 0.7); }
  
      f.r = rand(0.8, 3.6);   
      f.vy = rand(18, 50);
      f.vx = rand(-10, 10);
      f.swing = rand(14, 55);
      f.phase = rand(0, Math.PI * 2);
      f.life = rand(3.5, 9.5);
    };
  
    const draw = (f: Flake) => {
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.fill();
  
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r * 2.2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.10)";
      ctx.fill();
    };
  
    let raf = 0;
    let last = performance.now();
    let t = 0;
  
    const tick = (now:number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      t += dt;
  
      ctx.clearRect(0, 0, cw, ch);
      const wind = Math.sin(t * 0.6) * 14 + Math.sin(t * 1.15) * 8 + Math.sin(t * 2.3) * 3;
  
      for (const f of flakes) {
        const sway = Math.sin(t * 2.2 + f.phase) * f.swing;
        f.x += (f.vx + wind) * dt + sway * dt;
        f.y += f.vy * dt;
  
        f.life -= dt;
        if (f.y > ch + 60 || f.x < -120 || f.x > cw + 120 || f.life <= 0) reset(f);
  
        draw(f);
      }
      raf = requestAnimationFrame(tick);
    };
  
    raf = requestAnimationFrame(tick);
  
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [variant]);

  return (
    <section className="relative h-[100svh] w-full overflow-hidden">
      {/* Background */}
      <img
        src={heroImg}
        alt="Wedding"
        className="absolute inset-0 h-full w-full object-cover"
        loading="eager"
        decoding="async"
      />

      {/* Overlay: 상단은 살짝, 하단은 진하게(텍스트 가독성) */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/10 to-black/65" />

      {/* Top chip (safe-area) */}
      <div className="absolute left-0 right-0 top-0 z-10 pt-[max(env(safe-area-inset-top),16px)]">
        <div className="mx-auto flex max-w-md items-center justify-center px-5">
          <div className="rounded-full bg-white/80 px-4 py-2 backdrop-blur border border-neutral-200 shadow-sm">
            <span className="text-sm font-semibold text-neutral-900">{chipText}</span>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 z-[5]">
        <canvas ref={heroSnowRef} className="h-full w-full" />
      </div>

      {/* Bottom panel */}
      <div className="absolute inset-x-0 bottom-0 z-10">
        <div className="mx-auto max-w-md px-5 pb-[max(env(safe-area-inset-bottom),20px)]">
          <div className="rounded-t-3xl bg-white/10 backdrop-blur-md border border-white/20 px-6 pt-6 pb-5 shadow-lg">
            <div className="text-[11px] tracking-[0.22em] text-white/75 text-center">
              WEDDING INVITATION
            </div>

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

      {/* keyframes (Tailwind arbitrary animation용) */}
      <style>
        {`
          @keyframes bounceDot {
            0%, 100% { transform: translateY(0); opacity: .8; }
            50% { transform: translateY(8px); opacity: 1; }
          }
        `}
      </style>
    </section>
  );
}

export function HeroSectionB({ data }: Props) {
  const target = useMemo(() => new Date(data.ceremony.dateISO), [data.ceremony.dateISO]);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  
  const cardRef = useRef<HTMLDivElement | null>(null);
  const snowRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = snowRef.current;
    const card = cardRef.current;
    if (!canvas || !card) return;
  
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
  
    const prefersReduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (prefersReduce) return;
  
    let cw = 0;
    let ch = 0;
    let dpr = 1;
  
    const resize = () => {
      const rect = card.getBoundingClientRect();
      dpr = Math.max(1, window.devicePixelRatio || 1);
  
      cw = Math.max(1, Math.floor(rect.width));
      ch = Math.max(1, Math.floor(rect.height));
  
      canvas.width = Math.floor(cw * dpr);
      canvas.height = Math.floor(ch * dpr);
  
      canvas.style.width = `${cw}px`;
      canvas.style.height = `${ch}px`;
  
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
  
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(card);
  
    // ---- 눈송이 파티클 ----
    type Flake = {
      x: number; y: number; r: number;
      vy: number; vx: number;
      swing: number; phase: number;
      life: number;
    };
  
    const rand = (a: number, b: number) => a + Math.random() * (b - a);
  
    const count = 70; // 더 풍성하게
    const flakes: Flake[] = Array.from({ length: count }).map(() => ({
      x: rand(0, cw),
      y: rand(0, ch),
      r: rand(0.8, 3.6),
      vy: rand(20, 55),
      vx: rand(-12, 12),
      swing: rand(18, 65),
      phase: rand(0, Math.PI * 2),
      life: rand(3.5, 9.5),
    }));
  
    const resetFlake = (f: Flake) => {
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
      f.r = rand(0.8, 3.6);
      f.vy = rand(20, 55);
      f.vx = rand(-12, 12);
      f.swing = rand(18, 65);
      f.phase = rand(0, Math.PI * 2);
      f.life = rand(3.5, 9.5);
    };
  
    const drawFlake = (f: Flake) => {
      // 밝기/가시성 강화 (사진 위에서 잘 보이게)
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.fill();
  
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r * 2.4, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.16)";
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
  
      // “랜덤 흩날림” 핵심: 시간에 따라 바람이 계속 바뀌고, 각 눈송이는 서로 다른 위상으로 sway
      const wind = Math.sin(t * 0.6) * 18 + Math.sin(t * 1.15) * 10 + Math.sin(t * 2.3) * 4;
  
      for (const f of flakes) {
        const sway = Math.sin(t * 2.4 + f.phase) * f.swing;
  
        f.x += (f.vx + wind) * dt + sway * dt;
        f.y += f.vy * dt;
  
        f.life -= dt;
        if (f.y > ch + 60 || f.x < -120 || f.x > cw + 120 || f.life <= 0) resetFlake(f);
  
        drawFlake(f);
      }
  
      raf = requestAnimationFrame(tick);
    };
  
    raf = requestAnimationFrame(tick);
  
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  const ddayDays = useMemo(() => {
    const diff = startOfDay(target).getTime() - startOfDay(now).getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }, [now, target]);

  const msLeft = target.getTime() - now.getTime();
  const hms = msToHMS(msLeft);
  const chipText = formatChip(msLeft, ddayDays, hms);

  // const photoImg = asset("images/main_img.jpg");
  const photoImg = asset("images/main_img2.webp");
  const ribbonImg = asset("images/ribbon.png");

  return (
    <section className="w-full bg-neutral-100">
      <div className="mx-auto max-w-md px-5 pt-[max(env(safe-area-inset-top),24px)] pb-[max(env(safe-area-inset-bottom),24px)] min-h-[100svh] flex flex-col">
        {/* 상단: 신랑 - 리본/로고 - 신부 */}
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

        {/* 중간: 사진 */}
        <div className="mt-6 flex-1 flex items-center">
          <div className="w-full">
            <div ref={cardRef} className="relative rounded-3xl border border-neutral-200 overflow-hidden bg-white
                                          shadow-[0_14px_42px_-22px_rgba(0,0,0,0.26),0_2px_6px_0_rgba(0,0,0,0.14)]">
              <div className="pointer-events-none absolute inset-0 z-20">
                <canvas ref={snowRef} className="h-full w-full" />
              </div>
              <div className="relative z-10 aspect-[2/3] w-full max-h-[78svh]">
                <img src={photoImg} alt="Wedding" className="h-full w-full object-cover" />
              </div>
            </div>
          </div>
        </div>

        {/* 하단: D-day + 예식일자/장소 (간단) */}
        <div className="mt-7">
          <div className="flex items-center justify-center">
            <div className="rounded-full bg-white px-4 py-2 border border-neutral-200 shadow-sm">
              <span className="text-sm font-semibold text-neutral-900">{chipText}</span>
            </div>
          </div>

          <div className="mt-4 text-center text-neutral-800">
            <div className="font-medium text-base">2026. 12. 12 &nbsp; ── &nbsp; 오후 1시 20분</div>
            <div className="mt-1 text-neutral-600 text-lg">까사그랑데 센트로 에떼르노홀</div>
          </div>
        </div>
      </div>

      {/* 카드 내부 효과용 CSS */}
      <style>{`
        /* 별 반짝임: 카드 내부에만 존재 */
        .twinkle-layer {
          background-image:
            radial-gradient(circle at 12% 22%, rgba(255,255,255,.55) 0 1px, transparent 2px),
            radial-gradient(circle at 28% 64%, rgba(255,255,255,.35) 0 1px, transparent 2px),
            radial-gradient(circle at 46% 18%, rgba(255,255,255,.40) 0 1px, transparent 2px),
            radial-gradient(circle at 66% 42%, rgba(255,255,255,.30) 0 1px, transparent 2px),
            radial-gradient(circle at 82% 24%, rgba(255,255,255,.45) 0 1px, transparent 2px),
            radial-gradient(circle at 78% 78%, rgba(255,255,255,.25) 0 1px, transparent 2px),
            radial-gradient(circle at 18% 84%, rgba(255,255,255,.30) 0 1px, transparent 2px);
          opacity: .8;
          animation: twinkle 3.2s ease-in-out infinite;
          mix-blend-mode: screen;
        }

        @keyframes twinkle {
          0%, 100% { opacity: .35; filter: blur(0px); transform: translateY(0); }
          50%      { opacity: .70; filter: blur(.2px); transform: translateY(-2px); }
        }

        /* 눈꽃 흩날림: 카드 내부에서만 위→아래 */
        .snowflake {
          animation: snowFall 6.5s linear infinite;
          text-shadow: 0 0 10px rgba(255,255,255,.25);
        }
        @keyframes snowFall {
          0%   { transform: translate3d(0, 0, 0) rotate(0deg); opacity: 0; }
          10%  { opacity: .9; }
          100% { transform: translate3d(-18px, 120vh, 0) rotate(240deg); opacity: 0; }
        }

        @media (prefers-reduced-motion: reduce) {
          .twinkle-layer, .snowflake { animation: none !important; }
        }
      `}</style>
    </section>
  );
}
