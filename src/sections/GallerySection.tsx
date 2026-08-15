// src/sections/GallerySection.tsx
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

import { Section } from "../components/Section";
import { SectionTitle } from "../components/SectionTitle";
import { LayoutGrid, RectangleVertical } from "lucide-react";
import { asset } from "../utils/asset";

type ViewMode = "grid" | "single";

// 갤러리 사진 소스 (인트로 사진과 별개인 갤러리 전용 사진 c_1~c_25).
// ⚠️ IMAGE_COUNT 는 public/images 의 실제 `${IMAGE_PREFIX}_*.webp` 장수와 일치해야 한다.
//    (장수보다 크게 두면 없는 번호는 404 요청 + 깨진 타일이 생긴다)
const IMAGE_PREFIX = "c";
const IMAGE_COUNT = 25;
const GRID_PREVIEW_COUNT = 12;

// 목록은 고정값이므로 모듈 상수로 한 번만 만든다
const IMAGES = Array.from({ length: IMAGE_COUNT }, (_, idx) => ({
  src: asset(`images/${IMAGE_PREFIX}_${idx + 1}.webp`),
  alt: `gallery-${idx + 1}`,
}));

// ── 아이콘 탭 ─────────────────────────────────────────
// 컴포넌트 바깥으로 빼서 렌더마다 새 타입이 만들어지지 않게 한다
function IconTab({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
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
}

function GallerySectionBase() {
  const images = IMAGES;

  const [mode, setMode] = useState<ViewMode>("grid");
  const [expanded, setExpanded] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  const gridVisible = expanded ? images : images.slice(0, GRID_PREVIEW_COUNT);

  const sectionRef    = useRef<HTMLDivElement | null>(null);
  const gridRef       = useRef<HTMLDivElement | null>(null);
  const singleImgRef  = useRef<HTMLImageElement | null>(null);

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
  // 다음 인덱스를 함수형 업데이트로 계산해 콜백을 렌더 간에 재사용한다
  // (기존에는 activeIdx가 바뀔 때마다 키보드 리스너가 재등록되고 있었다)
  const slide = useCallback((delta: 1 | -1) => {
    const direction = delta === 1 ? "right" : "left";
    const advance = () =>
      setActiveIdx((prev) => (prev + delta + IMAGE_COUNT) % IMAGE_COUNT);

    const img = singleImgRef.current;
    if (!img) {
      advance();
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
        advance();
        // 새 이미지 들어오기 (DOM 업데이트 후)
        gsap.fromTo(
          img,
          { x: xIn, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.32, ease: "power3.out" }
        );
      },
    });
  }, []);

  const goPrev = useCallback(() => slide(-1), [slide]);
  const goNext = useCallback(() => slide(1), [slide]);

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
  }, [mode, goPrev, goNext]);

  // mode 전환 시 activeIdx 보정
  useEffect(() => {
    if (mode !== "single") return;
    setActiveIdx((v) => Math.min(Math.max(0, v), IMAGE_COUNT - 1));
  }, [mode]);

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
            {images.length > GRID_PREVIEW_COUNT && !expanded && (
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

export const GallerySection = memo(GallerySectionBase);