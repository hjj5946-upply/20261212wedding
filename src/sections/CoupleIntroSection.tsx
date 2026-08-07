// src/sections/CoupleIntroSection.tsx
import { memo, useEffect, useRef } from "react";
import { gsap } from "gsap";
import type { WeddingConfig, CoupleInfo } from "../config/wedding";
import { Section } from "../components/Section";
import { SectionTitle } from "../components/SectionTitle";
import { asset } from "../utils/asset";
import { useInView } from "../utils/useInView";

type Props = { data: WeddingConfig };

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
const FALLBACK_PHOTO = asset("images/main_img.webp");

function PhotoCard({
  info
}: {
  info: CoupleInfo;
}) {
  const tempImg = FALLBACK_PHOTO;

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
// 카드 내부 애니메이션 대상 (선택자는 기존과 동일)
function cardParts(card: HTMLElement) {
  return {
    photo: card.querySelector(".aspect-\\[3\\/4\\]"),
    name: card.querySelector(".text-base"),
    divider: card.querySelector(".bg-\\[\\#c2d6ba\\]"),
    intro: card.querySelector("p"),
    rows: card.querySelectorAll(".flex.items-start"),
  };
}

function CoupleIntroSectionBase({ data }: Props) {
  // ✅ 훅은 조건 없이 항상 호출한다(early return을 아래로 내림)
  const { ref: inViewRef, inView } = useInView<HTMLDivElement>(0.2);
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const groomRef   = useRef<HTMLDivElement | null>(null);
  const brideRef   = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // ── 섹션 벗어나면 리셋 ──────────────────
    if (!inView) {
      for (const card of [groomRef.current, brideRef.current]) {
        if (!card) continue;
        gsap.set(card, { clearProps: "all" });

        const { photo, name, divider, intro, rows } = cardParts(card);
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

        const { photo, name, divider, intro, rows } = cardParts(card);

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

  if (!data.groomInfo && !data.brideInfo) return null;

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

export const CoupleIntroSection = memo(CoupleIntroSectionBase);