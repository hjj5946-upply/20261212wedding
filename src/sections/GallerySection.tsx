// src/sections/GallerySection.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Section } from "../components/Section";
import { SectionTitle } from "../components/SectionTitle";
import { LayoutGrid, RectangleVertical } from "lucide-react";
import { asset } from "../utils/asset";

type ViewMode = "grid" | "single";

export function GallerySection() {
  const images = useMemo(() => {
    const imageCount = 24;
    return Array.from({ length: imageCount }, (_, idx) => ({
      src: asset(`images/intro_${idx + 1}.webp`),
      alt: `gallery-${idx + 1}`,
    }));
  }, []);

  const [mode, setMode] = useState<ViewMode>("grid");
  const [expanded, setExpanded] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  const gridVisible = expanded ? images : images.slice(0, 12);

  // refs
  const sectionRef    = useRef<HTMLDivElement | null>(null);
  const gridRef       = useRef<HTMLDivElement | null>(null);
  const singleImgRef  = useRef<HTMLImageElement | null>(null);
  const directionRef  = useRef<"left" | "right">("right"); // 슬라이드 방향

  // ── ① 그리드 stagger 등장 (섹션 진입 시) ──────────────
  useEffect(() => {
    if (mode !== "grid" || !gridRef.current) return;

    const ctx = gsap.context(() => {
      const items = gridRef.current!.querySelectorAll(".gallery-item");

      gsap.from(items, {
        opacity: 0,
        scale: 0.88,
        duration: 0.55,
        ease: "power3.out",
        stagger: {
          each: 0.07,      // 각 이미지 간 딜레이
          from: "start",   // 왼→오, 위→아래 순서
        },
        scrollTrigger: {
          trigger: gridRef.current,
          start: "top 82%",
          toggleActions: "play none none none",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [mode, gridVisible.length]);

  // ── ② 더보기: 새로 추가된 이미지만 stagger fade-in ────
  const prevCountRef = useRef(gridVisible.length);

  useEffect(() => {
    if (!expanded || !gridRef.current) return;

    const items = gridRef.current.querySelectorAll(".gallery-item");
    const newItems = Array.from(items).slice(prevCountRef.current);

    if (newItems.length === 0) return;

    gsap.from(newItems, {
      opacity: 0,
      y: 24,
      scale: 0.92,
      duration: 0.5,
      ease: "power3.out",
      stagger: { each: 0.06, from: "start" },
    });

    prevCountRef.current = items.length;
  }, [expanded]);

  // ── ③ single 모드 이미지 전환 (슬라이드) ──────────────
  const animateSingleTransition = (newIdx: number, direction: "left" | "right") => {
    const img = singleImgRef.current;
    if (!img) {
      setActiveIdx(newIdx);
      return;
    }

    const xOut = direction === "right" ? -60 : 60;
    const xIn  = direction === "right" ? 60  : -60;

    // 현재 이미지 나가기
    gsap.to(img, {
      x: xOut,
      opacity: 0,
      duration: 0.22,
      ease: "power2.in",
      onComplete: () => {
        setActiveIdx(newIdx);
        // 새 이미지 들어오기 (DOM 업데이트 후)
        gsap.fromTo(
          img,
          { x: xIn, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.32, ease: "power3.out" }
        );
      },
    });
  };

  const goPrev = () => {
    const newIdx = (activeIdx - 1 + images.length) % images.length;
    animateSingleTransition(newIdx, "left");
  };

  const goNext = () => {
    const newIdx = (activeIdx + 1) % images.length;
    animateSingleTransition(newIdx, "right");
  };

  // 스와이프 처리 (single)
  const touch = useRef<{ startX: number; lastX: number; dragging: boolean } | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    const x = e.touches[0]?.clientX ?? 0;
    touch.current = { startX: x, lastX: x, dragging: true };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!touch.current?.dragging) return;
    touch.current.lastX = e.touches[0]?.clientX ?? touch.current.lastX;
  };
  const onTouchEnd = () => {
    if (!touch.current) return;
    const dx = touch.current.lastX - touch.current.startX;
    touch.current.dragging = false;
    if (Math.abs(dx) < 40) return;
    if (dx < 0) goNext();
    else goPrev();
  };

  // 키보드 (single, PC)
  useEffect(() => {
    if (mode !== "single") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, activeIdx, images.length]);

  // mode 전환 시 activeIdx 보정
  useEffect(() => {
    if (mode !== "single") return;
    setActiveIdx((v) => Math.min(Math.max(0, v), images.length - 1));
  }, [mode, images.length]);

  // ── 아이콘 탭 ─────────────────────────────────────────
  const IconTab = ({
    active,
    label,
    onClick,
    children,
  }: {
    active: boolean;
    label: string;
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={[
        "inline-flex items-center justify-center rounded-full p-2 transition",
        active ? "text-neutral-900" : "text-neutral-400 hover:text-neutral-700",
      ].join(" ")}
    >
      {children}
      {active && (
        <span className="ml-2 h-px w-6 bg-wedding-green-200" aria-hidden />
      )}
    </button>
  );

  return (
    <Section id="gallery" className="px-5 py-12 border-t border-neutral-100 bg-white">
      <div ref={sectionRef} className="mx-auto max-w-3xl">
        <SectionTitle english="GALLERY" korean="갤러리" />

        {/* 보기 방식 탭 */}
        <div className="mt-6 flex justify-center">
          <div className="flex items-center gap-4">
            <IconTab active={mode === "grid"} label="바둑판 보기" onClick={() => setMode("grid")}>
              <LayoutGrid size={24} />
            </IconTab>
            <IconTab active={mode === "single"} label="통으로 보기" onClick={() => setMode("single")}>
              <RectangleVertical size={24} />
            </IconTab>
          </div>
        </div>

        {/* ── GRID ── */}
        {mode === "grid" && (
          <div className="mt-6">
            <div ref={gridRef} className="grid grid-cols-3 gap-2">
              {gridVisible.map((img, idx) => (
                <button
                  key={`${img.alt}-${idx}`}
                  onClick={() => {
                    setActiveIdx(idx);
                    setMode("single");
                  }}
                  className="gallery-item aspect-[3/4] overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100"
                  aria-label={`open image ${idx + 1}`}
                  type="button"
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>

            {/* 더보기 */}
            {images.length > 12 && !expanded && (
              <div className="mt-5 flex justify-center">
                <button
                  type="button"
                  onClick={() => setExpanded(true)}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-700 hover:text-neutral-900"
                  aria-label="더 보기"
                >
                  <span>더 보기</span>
                  <span aria-hidden>↓</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── SINGLE ── */}
        {mode === "single" && (
          <div className="mt-6">
            <div className="mx-auto max-w-md">
              <div
                className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                <img
                  ref={singleImgRef}
                  src={images[activeIdx]?.src}
                  alt={images[activeIdx]?.alt}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />

                <button
                  type="button"
                  onClick={goPrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-neutral-200 bg-white/90 px-3 py-2 text-sm font-semibold text-neutral-800 shadow-sm"
                  aria-label="previous image"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-neutral-200 bg-white/90 px-3 py-2 text-sm font-semibold text-neutral-800 shadow-sm"
                  aria-label="next image"
                >
                  ›
                </button>
              </div>

              {/* 페이지 표시 */}
              <div className="mt-3 text-center text-xs font-medium text-neutral-600">
                {activeIdx + 1} / {images.length}
              </div>
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}