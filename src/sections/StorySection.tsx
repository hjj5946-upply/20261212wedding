// src/sections/StorySection.tsx
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { WeddingConfig } from "../config/wedding";
import { Section } from "../components/Section";
import { SectionTitle } from "../components/SectionTitle";
import { asset } from "../utils/asset";

gsap.registerPlugin(ScrollTrigger);

type Props = { data: WeddingConfig };

// ─────────────────────────────────────────────
// 스토리 사진 카드
// ─────────────────────────────────────────────
function StoryPhoto({
  title,
  src,
  fit = "cover",
  padding = "p-0",
  bg = "bg-white",
  rounded = "rounded-2xl",
  objectPosition = "object-center",
}: {
  title: string;
  src: string;
  fit?: "cover" | "contain";
  padding?: string;
  bg?: string;
  rounded?: string;
  objectPosition?: string;
}) {
  const fitClass = fit === "contain" ? "object-contain" : "object-cover";

  return (
    <div className={`h-full overflow-hidden ${rounded} border border-neutral-200 ${bg} shadow-sm`}>
      <div className={`h-full w-full ${padding}`}>
        <img
          src={asset(src)}
          alt={title}
          className={`h-full w-full ${fitClass} ${objectPosition}`}
          loading="lazy"
          draggable={false}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 스토리 텍스트 컨텐츠
// ─────────────────────────────────────────────
function StoryContent({
  date,
  title,
  description,
  align,
}: {
  date: string;
  title: string;
  description: string;
  align: "left" | "right";
}) {
  return (
    <div className="h-full rounded-2xl bg-transparent p-1">
      <div
        className={`h-full rounded-2xl bg-transparent ${align === "right" ? "text-right" : "text-left"
          }`}
      >
        <div className="text-[11px] md:text-xs font-medium text-neutral-500">
          {date}
        </div>
        <div className="mt-1 text-sm md:text-base font-semibold text-neutral-900">
          {title}
        </div>
        <div className="mt-2 text-xs md:text-sm leading-6 text-neutral-700 whitespace-pre-line">
          {description}
        </div>
        <div className="mt-4 h-px w-full bg-neutral-100" />
        <div
          className={`mt-3 h-px w-10 bg-wedding-green-200 ${align === "right" ? "ml-auto" : ""
            }`}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// StorySection
// ─────────────────────────────────────────────
export function StorySection({ data }: Props) {
  if (!data.story || data.story.length === 0) return null;

  const sectionRef = useRef<HTMLDivElement | null>(null);
  const lineRef = useRef<HTMLDivElement | null>(null);   // 중앙 세로 라인
  const itemsRef = useRef<HTMLDivElement | null>(null);   // 아이템 전체 래퍼
  const dotsRef = useRef<(HTMLDivElement | null)[]>([]);

  const rowHeight = "h-[140px] md:h-[190px]";
  const centerCols = "grid-cols-[1fr_18px_1fr] md:grid-cols-[1fr_64px_1fr]";
  const itemGap = "space-y-16 md:space-y-20";

  useEffect(() => {
    const ctx = gsap.context(() => {

      // ① 중앙 라인: 스크롤하면서 위→아래로 그려지는 효과
      gsap.fromTo(
        lineRef.current,
        { scaleY: 0, transformOrigin: "top center" },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: itemsRef.current,
            start: "top 75%",
            end: "bottom 60%",
            scrub: 0.6,   // 스크롤에 부드럽게 연동
          },
        }
      );

      // ② 각 스토리 아이템: 순차적으로 등장
      const items = itemsRef.current?.querySelectorAll(".story-item");
      if (items) {
        items.forEach((item, idx) => {
          const photoOnLeft = idx % 2 === 0;
          const photo = item.querySelector(".story-photo");
          const content = item.querySelector(".story-content");
          const dot = dotsRef.current[idx];

          // 각 아이템이 뷰포트에 들어올 때 개별적으로 트리거
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: item,
              start: "top 80%",       // ← 뷰포트 80% 지점에 아이템 상단이 닿을 때
              toggleActions: "play none none none",
            },
          });

          tl.from(photo, {
            x: photoOnLeft ? -40 : 40,
            opacity: 0,
            duration: 0.85,
            ease: "power3.out",
          })
            .from(content, {
              x: photoOnLeft ? 40 : -40,
              opacity: 0,
              duration: 0.85,
              ease: "power3.out",
            }, "-=0.6")           // ← 사진 끝나기 0.6초 전에 텍스트 시작
            .from(dot, {
              scale: 0,
              opacity: 0,
              duration: 0.4,
              ease: "back.out(2.5)",
            }, "-=0.7");
        });
      }

    }, sectionRef);

    return () => ctx.revert();
  }, [data.story.length]);

  return (
    <Section id="story" className="px-5 py-12 border-t border-neutral-100 bg-white">
      <div ref={sectionRef} className="mx-auto max-w-5xl">
        <SectionTitle english="OUR STORY" korean="우리의 이야기" />

        {/* 타임라인 */}
        <div ref={itemsRef} className="relative mt-10">

          {/* 중앙 세로 라인 — scaleY로 그려지는 효과 */}
          <div
            ref={lineRef}
            className="pointer-events-none absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-neutral-200"
            style={{ transformOrigin: "top center" }}
          />

          <div className={itemGap}>
            {data.story.map((item, idx) => {
              const photoOnLeft = idx % 2 === 0;

              return (
                <div
                  key={`${item.date}-${idx}`}
                  className="story-item relative"
                >
                  {/* 중앙 점 */}
                  <div
                    ref={(el) => { dotsRef.current[idx] = el; }}
                    className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
                  >
                    <div className="h-4 w-4 md:h-5 md:w-5 rounded-full bg-white border border-neutral-300 shadow-sm" />
                  </div>

                  {/* 3컬럼 그리드 */}
                  <div
                    className={[
                      "grid",
                      centerCols,
                      "gap-3 md:gap-6 items-stretch",
                    ].join(" ")}
                  >
                    {/* LEFT */}
                    <div className={`${rowHeight}`}>
                      {photoOnLeft ? (
                        <div className="story-photo h-full w-full">
                          <StoryPhoto
                            title={item.title}
                            src={item.image || "images/wedding.webp"}
                            fit={item.photo?.fit}
                            padding={item.photo?.padding}
                            bg={item.photo?.bg}
                            rounded={item.photo?.rounded}
                            objectPosition={item.photo?.objectPosition}
                          />
                        </div>
                      ) : (
                        <div className="story-content h-full w-full flex">
                          <StoryContent
                            date={item.date}
                            title={item.title}
                            description={item.description}
                            align="right"
                          />
                        </div>
                      )}
                    </div>

                    {/* CENTER spacer */}
                    <div />

                    {/* RIGHT */}
                    <div className={`${rowHeight}`}>
                      {photoOnLeft ? (
                        <div className="story-content h-full w-full flex">
                          <StoryContent
                            date={item.date}
                            title={item.title}
                            description={item.description}
                            align="left"
                          />
                        </div>
                      ) : (
                        <div className="story-photo h-full w-full">
                          <StoryPhoto
                            title={item.title}
                            src={item.image || "images/wedding.webp"}
                            fit={item.photo?.fit}
                            padding={item.photo?.padding}
                            bg={item.photo?.bg}
                            rounded={item.photo?.rounded}
                            objectPosition={item.photo?.objectPosition}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Section>
  );
}