import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import type { WeddingConfig, CoupleInfo } from "../config/wedding";
import { Section } from "../components/Section";
import { SectionTitle } from "../components/SectionTitle";
import { asset } from "../utils/asset";

type Props = { data: WeddingConfig };

// ─────────────────────────────────────────────
// InfoRow (기존 유지)
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
// PhotoCard (기존 유지)
// ─────────────────────────────────────────────
function PhotoCard({
  info,
  sideLabel,
}: {
  info: CoupleInfo;
  sideLabel: "신랑" | "신부";
}) {
  const tempImg = asset("images/main_img.webp");

  return (
    <div className="h-full overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      {/* 사진 */}
      <div className="px-4 pt-4">
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-neutral-100">
          {info.photoUrl ? (
            <img
              src={info.photoUrl}
              alt={`${sideLabel} ${info.name}`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <img
              src={tempImg}
              alt={`${sideLabel} ${info.name}`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          )}
        </div>
      </div>

      {/* 정보 */}
      <div className="px-4 py-4">
        <div className="text-center">
          <div className="text-base font-semibold text-neutral-900">
            {sideLabel} {info.name}
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

  const sectionRef = useRef<HTMLDivElement | null>(null);
  const groomRef = useRef<HTMLDivElement | null>(null);
  const brideRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {

      // ① 신랑 카드: 왼쪽에서 슬라이드
      gsap.from(groomRef.current, {
        x: -48,
        opacity: 0,
        duration: 0.85,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 78%",
          toggleActions: "play none none none",
        },
      });

      // ② 신부 카드: 오른쪽에서 슬라이드 (살짝 뒤에)
      gsap.from(brideRef.current, {
        x: 48,
        opacity: 0,
        duration: 0.85,
        ease: "power3.out",
        delay: 0.12,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 78%",
          toggleActions: "play none none none",
        },
      });

      // ③ 카드 내부 요소들 순차 등장 (사진 → 이름 → 소개 → 정보)
      const cards = [groomRef.current, brideRef.current];
      cards.forEach((card, cardIdx) => {
        if (!card) return;

        const photo = card.querySelector(".aspect-\\[3\\/4\\]");
        const name = card.querySelector(".text-base");
        const divider = card.querySelector(".bg-\\[\\#c2d6ba\\]");
        const intro = card.querySelector("p");
        const infoRows = card.querySelectorAll(".flex.items-start");

        gsap.from([photo], {
          opacity: 0,
          scale: 0.95,
          duration: 0.6,
          ease: "power2.out",
          delay: 0.15 + cardIdx * 0.12,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 78%",
            toggleActions: "play none none none",
          },
        });

        gsap.from([name, divider], {
          opacity: 0,
          y: 10,
          duration: 0.5,
          ease: "power2.out",
          stagger: 0.08,
          delay: 0.35 + cardIdx * 0.12,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 78%",
            toggleActions: "play none none none",
          },
        });

        if (intro) {
          gsap.from(intro, {
            opacity: 0,
            y: 8,
            duration: 0.5,
            ease: "power2.out",
            delay: 0.5 + cardIdx * 0.12,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 78%",
              toggleActions: "play none none none",
            },
          });
        }

        if (infoRows.length > 0) {
          gsap.from(infoRows, {
            opacity: 0,
            y: 8,
            duration: 0.45,
            ease: "power2.out",
            stagger: 0.08,
            delay: 0.6 + cardIdx * 0.12,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 78%",
              toggleActions: "play none none none",
            },
          });
        }
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <Section
      id="couple"
      className="px-5 py-12 border-t border-neutral-100 bg-neutral-100"
    >
      <div ref={sectionRef} className="mx-auto max-w-3xl">
        <SectionTitle english="ABOUT US" korean="저희를 소개합니다" />

        <div className="mt-6 grid grid-cols-2 gap-3 md:gap-4 items-stretch">
          {/* 신랑 카드 */}
          <div ref={groomRef}>
            {data.groomInfo ? (
              <PhotoCard info={data.groomInfo} sideLabel="신랑" />
            ) : (
              <div className="rounded-2xl border border-dashed border-neutral-200 bg-white" />
            )}
          </div>

          {/* 신부 카드 */}
          <div ref={brideRef}>
            {data.brideInfo ? (
              <PhotoCard info={data.brideInfo} sideLabel="신부" />
            ) : (
              <div className="rounded-2xl border border-dashed border-neutral-200 bg-white" />
            )}
          </div>
        </div>
      </div>
    </Section>
  );
}