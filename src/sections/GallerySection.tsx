import { useEffect, useMemo, useRef, useState } from "react";
import type { WeddingConfig } from "../config/wedding";
import { Section } from "../components/Section";
import { LayoutGrid, RectangleVertical } from "lucide-react";

type Props = { data: WeddingConfig };
type ViewMode = "grid" | "single";

export function GallerySection({ data }: Props) {
  // ✅ 임시: 무조건 main_img2.webp 사용
  const images = useMemo(() => {
    const n = data.gallery?.length ?? 0;
    const count = Math.max(n, 12);
    return Array.from({ length: count }).map((_, idx) => ({
      src: "/images/main_img2.webp",
      alt: data.gallery?.[idx]?.alt ?? `gallery-${idx + 1}`,
    }));
  }, [data.gallery]);

  const [mode, setMode] = useState<ViewMode>("grid");

  // grid 모드: 9장까지만, 더보기로 전체
  const [expanded, setExpanded] = useState(false);
  const gridVisible = expanded ? images : images.slice(0, 9);

  // single 모드: 현재 인덱스
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (mode !== "single") return;
    setActiveIdx((v) => Math.min(Math.max(0, v), images.length - 1));
  }, [mode, images.length]);

  // ====== 스와이프 처리(single) ======
  const touch = useRef<{ startX: number; lastX: number; dragging: boolean } | null>(null);

  const goPrev = () => setActiveIdx((i) => (i - 1 + images.length) % images.length);
  const goNext = () => setActiveIdx((i) => (i + 1) % images.length);

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

  // 키보드(PC) 좌우 이동(single)
  useEffect(() => {
    if (mode !== "single") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, images.length]);

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
      {active ? (
        <span className="ml-2 h-px w-6 bg-wedding-gold-200" aria-hidden />
      ) : null}
    </button>
  );

  return (
    <Section id="gallery" className="px-5 py-12 border-t border-neutral-100 bg-white">
      <div className="mx-auto max-w-3xl">
        {/* 중앙 제목 */}
        <div className="text-center">
          <div className="text-[13px] font-semibold tracking-[0.22em] text-neutral-800">
            Gallery
          </div>
          <div className="mt-2 text-sm font-semibold text-neutral-600">갤러리</div>
          <div className="mx-auto mt-4 h-px w-12 bg-wedding-gold-200" />
        </div>

        {/* 보기 방식 선택(아이콘만) */}
        <div className="mt-6 flex justify-center">
          <div className="flex items-center gap-4">
            <IconTab
              active={mode === "grid"}
              label="바둑판 보기"
              onClick={() => setMode("grid")}
            >
              <LayoutGrid size={20} />
            </IconTab>

            <IconTab
              active={mode === "single"}
              label="통으로 보기"
              onClick={() => setMode("single")}
            >
              <RectangleVertical size={20} />
            </IconTab>
          </div>
        </div>

        {/* ===== GRID (3x3, 3:4 비율) ===== */}
        {mode === "grid" ? (
          <div className="mt-6">
            <div className="grid grid-cols-3 gap-2">
              {gridVisible.map((img, idx) => (
                <button
                  key={`${img.alt}-${idx}`}
                  onClick={() => {
                    setActiveIdx(idx);
                    setMode("single");
                  }}
                  className="aspect-[3/4] overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100"
                  aria-label={`open image ${idx + 1}`}
                  type="button"
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>

            {/* 더보기(텍스트+화살표만, 보더/버튼 느낌 제거) */}
            {images.length > 9 && !expanded ? (
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
            ) : null}
          </div>
        ) : null}

        {/* ===== SINGLE (3:4, swipe) ===== */}
        {mode === "single" ? (
          <div className="mt-6">
            <div className="mx-auto max-w-md">
              <div
                className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                <img
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

              <div className="mt-3 text-center text-xs font-medium text-neutral-600">
                {activeIdx + 1} / {images.length}
              </div>

              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  onClick={() => setMode("grid")}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-700 hover:text-neutral-900"
                  aria-label="바둑판으로 보기"
                >
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </Section>
  );
}
