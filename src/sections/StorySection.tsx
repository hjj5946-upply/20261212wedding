import { useEffect, useMemo, useRef, useState } from "react";
import type { WeddingConfig } from "../config/wedding";
import { Section } from "../components/Section";
import { SectionTitle } from "../components/SectionTitle";
import { asset } from "../utils/asset";

type Props = { data: WeddingConfig };

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

function StoryPhoto({ title, src }: { title: string; src: string }) {
  return (
    <div className="h-full overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="h-full w-full">
        <img
          src={asset(src)}
          alt={title}
          className="h-full w-full object-cover"
          loading="lazy"
          draggable={false}
        />
      </div>
    </div>
  );
}

// ✅ border 제거 + 높이 맞추기 위해 h-full 사용
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
        className={`h-full rounded-2xl bg-transparent ${
          align === "right" ? "text-right" : "text-left"
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
          className={`mt-3 h-px w-10 bg-wedding-green-200 ${
            align === "right" ? "ml-auto" : ""
          }`}
        />
      </div>
    </div>
  );
}

export function StorySection({ data }: Props) {
  if (!data.story || data.story.length === 0) return null;

  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.22 });

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  }, []);

  // ✅ 섹션 진입 시 위에서부터 순차 등장, 벗어나면 리셋
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (!inView) {
      setVisibleCount(0);
      return;
    }
    if (prefersReducedMotion) {
      setVisibleCount(data.story.length);
      return;
    }

    setVisibleCount(0);
    const stepMs = 800; // 연혁 간 시간 간격(원하면 더 키워도 됨)
    let i = 0;

    const t = window.setInterval(() => {
      i += 1;
      setVisibleCount(i);
      if (i >= data.story.length) window.clearInterval(t);
    }, stepMs);

    return () => window.clearInterval(t);
  }, [inView, prefersReducedMotion, data.story.length]);

  const rowHeight = "h-[140px] md:h-[190px]"; // ✅ 이미지/설명 높이 동일(보이지 않게 맞춤)
  const centerCols = "grid-cols-[1fr_18px_1fr] md:grid-cols-[1fr_64px_1fr]";
  const itemGap = "space-y-16 md:space-y-20"; // ✅ 연혁 간격 더 띄움

  return (
    <Section id="story" className="px-5 py-12 border-t border-neutral-100 bg-white">
      <div ref={ref} className="mx-auto max-w-5xl">
        <SectionTitle english="OUR STORY" korean="우리의 이야기" />

        {/* 타임라인 */}
        <div className="relative mt-10">
          {/* 중앙 라인 */}
          <div className="pointer-events-none absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-neutral-200" />

          <div className={itemGap}>
            {data.story.map((item, idx) => {
              const photoOnLeft = idx % 2 === 0;
              const isVisible = idx < visibleCount;

              return (
                <div key={`${item.date}-${idx}`} className="relative">
                  {/* ✅ 중앙 강조점 더 크게 */}
                  <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
                    <div className="h-4 w-4 md:h-5 md:w-5 rounded-full bg-white border border-neutral-300 shadow-sm" />
                  </div>

                  {/* ✅ 모바일/PC 모두 3컬럼 유지 */}
                  <div
                    className={[
                      "grid",
                      centerCols,
                      "gap-3 md:gap-6 items-stretch",
                      "transition-all duration-700 ease-out",
                      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
                    ].join(" ")}
                  >
                    {/* LEFT */}
                    <div className={`${rowHeight}`}>
                      {photoOnLeft ? (
                        <div className="h-full w-full">
                          {/* ✅ item.image가 있으면 사용하고, 없으면 기본값인 piano.webp 사용 */}
                          <StoryPhoto title={item.title} src={item.image || "images/piano.webp"} />
                        </div>
                      ) : (
                        <div className="h-full w-full flex">
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
                        <div className="h-full w-full flex">
                          <StoryContent
                            date={item.date}
                            title={item.title}
                            description={item.description}
                            align="left"
                          />
                        </div>
                      ) : (
                        <div className="h-full w-full">
                          {/* ✅ 여기도 마찬가지로 item.image 전달 */}
                          <StoryPhoto title={item.title} src={item.image || "images/piano.webp"} />
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
