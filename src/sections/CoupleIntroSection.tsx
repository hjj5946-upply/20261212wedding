// src/sections/CoupleIntroSection.tsx
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import type { WeddingConfig, CoupleInfo } from "../config/wedding";
import { Section } from "../components/Section";
import { SectionTitle } from "../components/SectionTitle";
import { asset } from "../utils/asset";

type Props = { data: WeddingConfig };

// ─────────────────────────────────────────────
// IntersectionObserver 훅 (StorySection과 동일)
// ─────────────────────────────────────────────
function useInView<T extends HTMLElement>(
  options: IntersectionObserverInit = { threshold: 0.2 }
) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
    }, options);
    io.observe(ref.current);
    return () => io.disconnect();
  }, [options]);

  return { ref, inView };
}

// ─────────────────────────────────────────────
// InfoRow
// ─────────────────────────────────────────────
function InfoRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2 text-xs">
      <span className="min-w-[56px] shrink-0 font-semibold text-[#63a356]">
        {label}
      </span>
      <span className="text-neutral-700 whitespace-pre-line break-words">
        {value}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────
// PhotoCard
// ─────────────────────────────────────────────
function PhotoCard({
  info
}: {
  info: CoupleInfo;
}) {
  const tempImg = asset("images/main_img.webp");

  return (
    <div className="h-full overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="px-4 pt-4">
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-neutral-100">
          {info.photoUrl ? (
            <img
              src={info.photoUrl}
              alt={`${info.name}`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <img
              src={tempImg}
              alt={`${info.name}`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          )}
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="text-center">
          <div className="text-base font-semibold text-neutral-900">
            {info.name}
          </div>
          {info.role ? (
            <div className="mt-1 text-[11px] text-neutral-500">{info.role}</div>
          ) : null}
          <div className="mx-auto mt-3 h-px w-10 bg-[#c2d6ba]" />
        </div>
        {info.introduction ? (
          <p className="mt-3 text-center text-xs leading-6 text-neutral-700 whitespace-pre-line break-words">
            {info.introduction}
          </p>
        ) : null}
        <div className="mt-4 space-y-2">
          <InfoRow label="MBTI" value={info.mbti} />
          <InfoRow label="취미" value={info.hobby} />
          <InfoRow label="좋아하는 것" value={info.favorite} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// CoupleIntroSection
// ─────────────────────────────────────────────
export function CoupleIntroSection({ data }: Props) {
  if (!data.groomInfo && !data.brideInfo) return null;

  const { ref: inViewRef, inView } = useInView<HTMLDivElement>({ threshold: 0.2 });
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const groomRef   = useRef<HTMLDivElement | null>(null);
  const brideRef   = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // ── 섹션 벗어나면 리셋 ──────────────────
    if (!inView) {
      gsap.set(groomRef.current, { clearProps: "all" });
      gsap.set(brideRef.current, { clearProps: "all" });

      if (groomRef.current) {
        const photo   = groomRef.current.querySelector(".aspect-\\[3\\/4\\]");
        const name    = groomRef.current.querySelector(".text-base");
        const divider = groomRef.current.querySelector(".bg-\\[\\#c2d6ba\\]");
        const intro   = groomRef.current.querySelector("p");
        const rows    = groomRef.current.querySelectorAll(".flex.items-start");
        gsap.set([photo, name, divider, intro, ...Array.from(rows)], { clearProps: "all" });
      }
      if (brideRef.current) {
        const photo   = brideRef.current.querySelector(".aspect-\\[3\\/4\\]");
        const name    = brideRef.current.querySelector(".text-base");
        const divider = brideRef.current.querySelector(".bg-\\[\\#c2d6ba\\]");
        const intro   = brideRef.current.querySelector("p");
        const rows    = brideRef.current.querySelectorAll(".flex.items-start");
        gsap.set([photo, name, divider, intro, ...Array.from(rows)], { clearProps: "all" });
      }
      return;
    }

    // ── 섹션 진입하면 애니메이션 재생 ────────
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // 신랑 카드: 왼쪽에서
      tl.from(groomRef.current, {
        x: -48,
        opacity: 0,
        duration: 0.85,
        ease: "power3.out",
      }, 0);

      // 신부 카드: 오른쪽에서
      tl.from(brideRef.current, {
        x: 48,
        opacity: 0,
        duration: 0.85,
        ease: "power3.out",
      }, 0.12);

      // 카드 내부 순차 등장
      const cards = [groomRef.current, brideRef.current];
      cards.forEach((card, cardIdx) => {
        if (!card) return;

        const photo   = card.querySelector(".aspect-\\[3\\/4\\]");
        const name    = card.querySelector(".text-base");
        const divider = card.querySelector(".bg-\\[\\#c2d6ba\\]");
        const intro   = card.querySelector("p");
        const rows    = card.querySelectorAll(".flex.items-start");

        tl.from(photo, {
          opacity: 0,
          scale: 0.95,
          duration: 0.6,
          ease: "power2.out",
        }, 0.15 + cardIdx * 0.12);

        tl.from([name, divider], {
          opacity: 0,
          y: 10,
          duration: 0.5,
          ease: "power2.out",
          stagger: 0.08,
        }, 0.35 + cardIdx * 0.12);

        if (intro) {
          tl.from(intro, {
            opacity: 0,
            y: 8,
            duration: 0.5,
            ease: "power2.out",
          }, 0.5 + cardIdx * 0.12);
        }

        if (rows.length > 0) {
          tl.from(rows, {
            opacity: 0,
            y: 8,
            duration: 0.45,
            ease: "power2.out",
            stagger: 0.08,
          }, 0.6 + cardIdx * 0.12);
        }
      });

    }, sectionRef);

    return () => ctx.revert();
  }, [inView]);

  return (
    <Section
      id="couple"
      className="px-5 py-12 border-t border-neutral-100 bg-neutral-100"
    >
      <div ref={inViewRef} className="mx-auto max-w-3xl">
        {/* sectionRef는 GSAP context 범위용 */}
        <div ref={sectionRef}>
          <SectionTitle english="ABOUT US" korean="저희를 소개합니다" />

          <div className="mt-6 grid grid-cols-2 gap-3 md:gap-4 items-stretch">
            {/* 신랑 카드 */}
            <div ref={groomRef}>
              {data.groomInfo ? (
                <PhotoCard info={data.groomInfo} />
              ) : (
                <div className="rounded-2xl border border-dashed border-neutral-200 bg-white" />
              )}
            </div>

            {/* 신부 카드 */}
            <div ref={brideRef}>
              {data.brideInfo ? (
                <PhotoCard info={data.brideInfo} />
              ) : (
                <div className="rounded-2xl border border-dashed border-neutral-200 bg-white" />
              )}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}