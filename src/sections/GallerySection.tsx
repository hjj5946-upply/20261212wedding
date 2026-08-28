// src/sections/GallerySection.tsx
import { memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { gsap } from "gsap";

import { Section } from "../components/Section";
import { SectionTitle } from "../components/SectionTitle";
import { LayoutGrid, RectangleVertical } from "lucide-react";
import { asset } from "../utils/asset";
import { PhotoGuard } from "../components/PhotoGuard";
import { PhotoLightbox } from "../components/PhotoLightbox";

type ViewMode = "grid" | "single";

// 갤러리 사진 소스 (인트로 사진과 별개인 갤러리 전용 사진 gi_1~gi_25).
// ⚠️ IMAGE_COUNT 는 public/images 의 실제 `${IMAGE_PREFIX}_*.webp` 장수와 일치해야 한다.
//    (장수보다 크게 두면 없는 번호는 404 요청 + 깨진 타일이 생긴다)
const IMAGE_PREFIX = "gi";
const IMAGE_COUNT = 25;
const GRID_PREVIEW_COUNT = 12;

/**
 * 가로로 긴 사진의 번호(`gi_<번호>.webp`).
 * 갤러리 칸은 세로 비율이라 object-cover 로 채우면 위아래가 심하게 잘린다.
 * 여기 적힌 사진만 전체가 보이도록(contain) 두고, 남는 위아래는 히어로 섹션과 같은 방식으로
 * 같은 사진을 흐리게 깔아 채운다. 사진을 교체해 비율이 달라지면 이 목록도 손봐야 한다.
 */
const LETTERBOX_NUMBERS = new Set([19]);

// 목록은 고정값이므로 모듈 상수로 한 번만 만든다
const IMAGES = Array.from({ length: IMAGE_COUNT }, (_, idx) => ({
  src: asset(`images/${IMAGE_PREFIX}_${idx + 1}.webp`),
  alt: `gallery-${idx + 1}`,
  letterbox: LETTERBOX_NUMBERS.has(idx + 1),
}));

/**
 * 가로 사진의 남는 위아래를 채우는 흐린 배경.
 * 같은 URL 이라 이미지 요청은 한 번만 나간다(히어로 섹션과 동일한 패턴).
 */
function BlurFill({ src }: { src: string }) {
  return (
    <img
      src={src}
      alt=""
      aria-hidden
      className="absolute inset-0 h-full w-full scale-110 object-cover opacity-80 blur-xl"
      decoding="async"
      draggable={false}
    />
  );
}

// single 모드 전환 타이밍 (짧게 유지해야 빠른 스와이프에서 답답하지 않다)
const OUT_MS = 0.18;
const IN_MS = 0.26;
// 새 사진 디코드를 기다리는 상한. 프리로드가 대부분 처리하므로 실제로 걸리는 일은 드물다.
const DECODE_WAIT_MS = 200;

// 이미 프리로드한 src (같은 사진을 반복해서 다시 받지 않도록)
const preloaded = new Set<string>();

/**
 * src를 미리 받아 **디코드까지** 끝내둔다.
 * <img>의 src만 바꾸면 새 사진이 디코드될 때까지 브라우저가 이전 사진을
 * 계속 그리기 때문에, 페이드 인 전에 디코드를 보장해야 잔상이 없다.
 */
function decodeImage(src: string): Promise<void> {
  const im = new Image();
  im.src = src;
  preloaded.add(src);
  // decode() 미지원/거부(캐시 상황에 따라)여도 전환은 진행해야 한다
  return im.decode ? im.decode().then(() => undefined, () => undefined) : Promise.resolve();
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

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
  // 1장 보기에서 사진을 한 번 더 누르면 열리는 전체화면 뷰어(원본 전체 + 확대)
  const [lightboxOpen, setLightboxOpen] = useState(false);

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
  // 목표 인덱스는 ref로 즉시 갱신한다. React state는 렌더 이후에 반영되므로
  // 빠른 연속 스와이프에서 "어디까지 넘겼는지"의 기준이 될 수 없다.
  const targetIdxRef = useRef(0);

  const slide = useCallback((delta: 1 | -1) => {
    const nextIdx = (targetIdxRef.current + delta + IMAGE_COUNT) % IMAGE_COUNT;
    targetIdxRef.current = nextIdx;

    const img = singleImgRef.current;
    if (!img) {
      setActiveIdx(nextIdx);
      return;
    }

    // 진행 중인 전환은 즉시 정리한다. (남겨두면 이전 전환의 콜백이 뒤늦게
    //  실행되면서 인덱스가 되돌아가거나 사진이 두 번 바뀐다)
    gsap.killTweensOf(img);

    const xOut = delta === 1 ? -60 : 60;
    const xIn  = delta === 1 ? 60  : -60;

    // 나가는 애니메이션과 동시에 새 사진 디코드를 시작한다
    const decoded = decodeImage(images[nextIdx]!.src);

    gsap.to(img, {
      x: xOut,
      opacity: 0,
      duration: OUT_MS,
      ease: "power2.in",
      onComplete: () => {
        const swapIn = () => {
          const el = singleImgRef.current;
          // 그 사이 더 새로운 스와이프가 들어왔으면 이 전환은 폐기한다
          if (!el || targetIdxRef.current !== nextIdx) return;

          // ⚠️ src 교체를 애니메이션 시작 "전에" DOM에 확정시켜야 한다.
          //    (일반 setState는 렌더가 뒤로 밀려서 이전 사진이 그대로
          //     페이드 인 됐다가 새 사진으로 튀는 잔상이 생겼다)
          flushSync(() => setActiveIdx(nextIdx));

          gsap.fromTo(
            el,
            { x: xIn, opacity: 0 },
            { x: 0, opacity: 1, duration: IN_MS, ease: "power3.out" }
          );
        };

        // 디코드가 끝나면 바로, 너무 오래 걸리면 상한에서 진행
        void Promise.race([decoded, wait(DECODE_WAIT_MS)]).then(swapIn);
      },
    });
  }, [images]);

  const goPrev = useCallback(() => slide(-1), [slide]);
  const goNext = useCallback(() => slide(1), [slide]);

  // 스와이프 처리 (single)
  const touch = useRef<{ startX: number; lastX: number; dragging: boolean } | null>(null);
  // 스와이프로 끝난 제스처는 뒤따라 오는 click 으로 뷰어가 열리지 않게 표시해 둔다
  const swipedRef = useRef(false);

  const onTouchStart = (e: React.TouchEvent) => {
    const x = e.touches[0]?.clientX ?? 0;
    swipedRef.current = false;
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
    swipedRef.current = true;
    if (dx < 0) goNext();
    else goPrev();
  };

  // 키보드 (single, PC)
  useEffect(() => {
    // 뷰어가 열려 있으면 방향키는 뷰어가 처리한다(둘 다 반응하면 두 장씩 넘어간다)
    if (mode !== "single" || lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, lightboxOpen, goPrev, goNext]);

  // ── 보기 방식 전환 시 스크롤 보정 ─────────────────────
  // 그리드(최대 25장)와 1장 보기는 섹션 높이가 크게 다르다. 스크롤 위치를 그대로 두면
  // 그리드 아래쪽 사진을 눌렀을 때 화면이 다음 섹션(마음 전하는 곳)까지 밀려 내려가서,
  // 정작 고른 사진이 화면 밖에 있게 된다. 전환 직후 갤러리를 다시 화면 위로 맞춘다.
  const firstModeRef = useRef(true);

  useLayoutEffect(() => {
    if (firstModeRef.current) {
      // 첫 렌더(그리드)에서는 스크롤을 건드리지 않는다
      firstModeRef.current = false;
      return;
    }
    // 레이아웃이 이미 새 높이로 확정된 시점이라 위치 계산이 정확하다.
    // 애니메이션 없이 즉시 이동해야 접힌 만큼 화면이 튀지 않는다.
    document.getElementById("gallery")?.scrollIntoView({ block: "start", behavior: "auto" });
  }, [mode]);

  // mode 전환 시 activeIdx 보정
  useEffect(() => {
    if (mode !== "single") return;
    setActiveIdx((v) => {
      const next = Math.min(Math.max(0, v), IMAGE_COUNT - 1);
      targetIdxRef.current = next;
      return next;
    });
  }, [mode]);

  // ── ④ 앞/뒤 사진 미리 디코드 ───────────────────────────
  // 스와이프한 순간에 받기 시작하면 늦다. 인접 사진을 먼저 준비해 둔다.
  useEffect(() => {
    if (mode !== "single") return;
    const neighbors = [
      (activeIdx + 1) % IMAGE_COUNT,
      (activeIdx - 1 + IMAGE_COUNT) % IMAGE_COUNT,
    ];
    for (const i of neighbors) {
      const src = images[i]!.src;
      if (!preloaded.has(src)) void decodeImage(src);
    }
  }, [mode, activeIdx, images]);

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
                    targetIdxRef.current = idx;
                    setActiveIdx(idx);
                    setMode("single");
                  }}
                  className="gallery-item relative aspect-[3/4] overflow-hidden rounded-2xl bg-neutral-100"
                  aria-label={`open image ${idx + 1}`}
                  type="button"
                >
                  {img.letterbox && <BlurFill src={img.src} />}
                  <img
                    src={img.src}
                    alt={img.alt}
                    className={[
                      "h-full w-full transition-transform duration-300 hover:scale-105",
                      // 가로 사진은 잘라내지 않고 전체를 보여준다(뒤의 BlurFill 위에 얹히도록 relative)
                      img.letterbox ? "relative object-contain" : "object-cover",
                    ].join(" ")}
                    loading="lazy"
                  />
                  <PhotoGuard />
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
                /*
                 * 16/25(=0.64) — 갤러리 사진 25장의 비율은 0.615~0.776 으로 제각각이고
                 * 중앙값이 0.667(2:3)이다. 박스는 항상 꽉 채우는(object-cover) 정책이라
                 * 이 값은 "어느 쪽을 덜 잘라낼지"를 정한다. 중앙값보다 살짝 세로로 길게
                 * 잡아 세로 사진의 위아래 잘림을 줄였다. 가로 폭은 그대로라 양옆 여백은 불변.
                 */
                className="relative aspect-[16/25] overflow-hidden rounded-2xl bg-neutral-100"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onClick={() => {
                  // 스와이프 직후의 click 은 무시하고, 탭일 때만 뷰어를 연다
                  if (swipedRef.current) {
                    swipedRef.current = false;
                    return;
                  }
                  setLightboxOpen(true);
                }}
                role="button"
                aria-label="사진 크게 보기"
              >
                {/*
                 * object-cover: 박스를 항상 꽉 채운다. 사진 비율이 박스와 달라도
                 * 위아래/양옆에 빈 공간이 생기지 않는다(대신 넘치는 쪽이 잘린다).
                 */}
                {images[activeIdx]?.letterbox && <BlurFill src={images[activeIdx]!.src} />}
                <img
                  ref={singleImgRef}
                  src={images[activeIdx]?.src}
                  alt={images[activeIdx]?.alt}
                  className={[
                    "h-full w-full will-change-transform",
                    images[activeIdx]?.letterbox ? "relative object-contain" : "object-cover",
                  ].join(" ")}
                  // 지금 보고 있는 사진이므로 lazy 로드하면 전환이 늦어진다
                  loading="eager"
                  decoding="async"
                  draggable={false}
                />

                {/* 저장 차단 레이어. 좌우 버튼은 뒤에 렌더되어 위에 온다. */}
                <PhotoGuard />

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    goPrev();
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-neutral-200 bg-white/90 px-3 py-2 text-sm font-semibold text-neutral-800 shadow-sm"
                  aria-label="previous image"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    goNext();
                  }}
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

        {/* ── 전체화면 뷰어 (원본 전체 + 확대) ── */}
        {mode === "single" && lightboxOpen && (
          <PhotoLightbox
            images={images}
            index={activeIdx}
            onIndexChange={(next) => {
              targetIdxRef.current = next;
              setActiveIdx(next);
            }}
            onClose={() => setLightboxOpen(false)}
          />
        )}
      </div>
    </Section>
  );
}

export const GallerySection = memo(GallerySectionBase);