// src/components/PhotoLightbox.tsx
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { PhotoGuard } from "./PhotoGuard";

export type LightboxImage = { src: string; alt: string };

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const DOUBLE_TAP_SCALE = 2.5;
const DOUBLE_TAP_MS = 300;
const SWIPE_PX = 50; // 좌우로 이 이상 끌면 다음/이전 사진
const CLOSE_PX = 90; // 아래로 이 이상 끌면 닫기
const FADE_MS = 180; // 열고 닫을 때 페이드
const SLIDE_MS = 200; // 사진 넘김 슬라이드
const SNAP_MS = 160; // 덜 끌었을 때 되돌아오는 시간
const DRAG_FOLLOW = 0.9; // 손가락을 따라가는 비율(살짝 무겁게)

type Gesture = {
  mode: "none" | "pan" | "pinch";
  startX: number;
  startY: number;
  startTx: number;
  startTy: number;
  startDist: number;
  startScale: number;
  focalX: number;
  focalY: number;
  moved: boolean;
};

function touchDist(a: Touch, b: Touch) {
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}

function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max);
}

// 이미 받아둔 src (같은 사진을 반복해서 다시 받지 않도록)
const preloaded = new Set<string>();

function preload(src: string) {
  if (!src || preloaded.has(src)) return;
  preloaded.add(src);
  const im = new Image();
  im.src = src;
  void (im.decode ? im.decode().catch(() => undefined) : undefined);
}

/**
 * 사진 원본 전체를 보여주는 전체화면 뷰어.
 *
 * - `object-contain` 이라 잘리는 곳 없이 사진 전체가 보인다(갤러리 타일/1장 보기는 cover).
 * - 확대: 핀치 / 더블탭 / 휠. App.tsx 가 문서 전체의 멀티터치 touchmove 를 막고 있어
 *   브라우저 기본 핀치 줌이 동작하지 않는다. 그래서 여기서 직접 계산한다.
 * - 배율/이동값은 transform 으로만 다루고 React state 로 올리지 않는다(제스처 중 리렌더 방지).
 * - ⚠️ 반드시 body 로 portal 한다. 섹션(`Section`)에 transform 이 걸려 있어서 그 안에서
 *   `fixed` 를 쓰면 화면이 아니라 섹션 기준으로 잡히고, 쌓임 맥락에 갇혀 BGM 버튼(z-50)
 *   아래로 깔린다.
 */
export function PhotoLightbox({
  images,
  index,
  onIndexChange,
  onClose,
}: {
  images: LightboxImage[];
  index: number;
  onIndexChange: (next: number) => void;
  onClose: () => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // 현재 확대/이동 상태 (렌더와 무관하게 즉시 갱신되어야 한다)
  const view = useRef({ scale: 1, x: 0, y: 0 });
  // 좌우 넘김용 오프셋. 확대 이동값(view.x)과 섞이지 않게 따로 둔다.
  const dragRef = useRef(0);
  // 다음 사진이 들어올 방향(px). index 가 바뀐 뒤 그 위치에서 0 으로 밀어 넣는다.
  const enterFromRef = useRef(0);
  const slidingRef = useRef(false);

  const gesture = useRef<Gesture>({
    mode: "none",
    startX: 0,
    startY: 0,
    startTx: 0,
    startTy: 0,
    startDist: 0,
    startScale: 1,
    focalX: 0,
    focalY: 0,
    moved: false,
  });
  const lastTapRef = useRef(0);

  // 확대 중에는 좌우 화살표를 숨긴다 (제스처마다 리렌더하지 않도록 ref 로 걸러낸다)
  const [zoomed, setZoomed] = useState(false);
  const zoomedRef = useRef(false);

  // 열고 닫을 때 페이드
  const [visible, setVisible] = useState(false);
  const closingRef = useRef(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const requestClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    setVisible(false);
    window.setTimeout(onClose, FADE_MS);
  }, [onClose]);

  /** transform 트랜지션 켜기(ms) / 끄기(0) */
  const transition = useCallback((ms: number) => {
    const el = imgRef.current;
    if (!el) return;
    el.style.transition = ms > 0 ? `transform ${ms}ms ease-out` : "none";
  }, []);

  const apply = useCallback(() => {
    const el = imgRef.current;
    if (!el) return;
    const { scale, x, y } = view.current;
    el.style.transform = `translate3d(${x + dragRef.current}px, ${y}px, 0) scale(${scale})`;

    const z = scale > 1.01;
    if (z !== zoomedRef.current) {
      zoomedRef.current = z;
      setZoomed(z);
    }
  }, []);

  // 확대된 사진이 화면 밖으로 빠져나가지 않도록 이동량을 제한한다.
  // offsetWidth/Height 는 transform 의 영향을 받지 않는 "표시 크기"라 기준으로 쓸 수 있다.
  const clampOffset = useCallback(() => {
    const el = imgRef.current;
    const box = containerRef.current;
    if (!el || !box) return;
    const { scale } = view.current;
    const maxX = Math.max(0, (el.offsetWidth * scale - box.clientWidth) / 2);
    const maxY = Math.max(0, (el.offsetHeight * scale - box.clientHeight) / 2);
    view.current.x = clamp(view.current.x, -maxX, maxX);
    view.current.y = clamp(view.current.y, -maxY, maxY);
  }, []);

  // 초점(focal)을 고정한 채 배율만 바꾼다.
  // 화면좌표 = 중심 + t + scale * p 이므로 t' = f - scale' * (f - t) / scale.
  const zoomTo = useCallback(
    (nextScale: number, focalX: number, focalY: number) => {
      const s0 = view.current.scale;
      const s1 = clamp(nextScale, MIN_SCALE, MAX_SCALE);
      view.current.x = focalX - ((focalX - view.current.x) * s1) / s0;
      view.current.y = focalY - ((focalY - view.current.y) * s1) / s0;
      view.current.scale = s1;
      clampOffset();
      transition(0);
      apply();
    },
    [apply, clampOffset, transition]
  );

  const resetZoom = useCallback(() => {
    view.current = { scale: 1, x: 0, y: 0 };
    transition(SNAP_MS);
    apply();
  }, [apply, transition]);

  /** 옆으로 밀어서 다음/이전 사진으로 (스와이프 · 화살표 공용) */
  const slide = useCallback(
    (delta: 1 | -1) => {
      if (images.length < 2 || slidingRef.current) return;
      const next = (index + delta + images.length) % images.length;
      const box = containerRef.current;
      if (!box) {
        onIndexChange(next);
        return;
      }

      slidingRef.current = true;
      const w = box.clientWidth;

      // 확대 상태였다면 원배율로 되돌리고 넘긴다
      view.current = { scale: 1, x: 0, y: 0 };

      // ① 지금 사진을 진행 방향으로 밀어낸다
      transition(SLIDE_MS);
      dragRef.current = delta === 1 ? -w : w;
      apply();

      // ② 다 밀리면 src 를 바꾸고, 반대편에서 들어오게 한다(아래 index 이펙트)
      enterFromRef.current = delta === 1 ? w : -w;
      window.setTimeout(() => onIndexChange(next), SLIDE_MS);
    },
    [apply, images.length, index, onIndexChange, transition]
  );

  // 사진이 바뀌면: 확대 초기화 + 들어오는 슬라이드
  useEffect(() => {
    view.current = { scale: 1, x: 0, y: 0 };
    dragRef.current = enterFromRef.current;
    enterFromRef.current = 0;
    transition(0);
    apply();

    if (dragRef.current === 0) {
      slidingRef.current = false;
      return;
    }

    const id = requestAnimationFrame(() => {
      transition(SLIDE_MS);
      dragRef.current = 0;
      apply();
      window.setTimeout(() => {
        slidingRef.current = false;
      }, SLIDE_MS);
    });
    return () => cancelAnimationFrame(id);
  }, [index, apply, transition]);

  // 앞/뒤 사진 미리 받아두기 (넘길 때 빈 화면이 보이지 않게)
  useEffect(() => {
    if (images.length < 2) return;
    preload(images[(index + 1) % images.length]!.src);
    preload(images[(index - 1 + images.length) % images.length]!.src);
  }, [index, images]);

  // 뷰어가 열려 있는 동안 뒤 페이지 스크롤 잠금
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // 키보드 (PC)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") requestClose();
      if (e.key === "ArrowLeft") slide(-1);
      if (e.key === "ArrowRight") slide(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [requestClose, slide]);

  // 터치/휠은 preventDefault 가 필요해서 네이티브 리스너로 붙인다
  // (React 의 touchmove/wheel 핸들러는 passive 라 preventDefault 가 통하지 않는다)
  useEffect(() => {
    const box = containerRef.current;
    if (!box) return;

    const center = () => {
      const r = box.getBoundingClientRect();
      return { cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
    };

    const snapBack = () => {
      transition(SNAP_MS);
      dragRef.current = 0;
      apply();
    };

    const onTouchStart = (e: TouchEvent) => {
      const g = gesture.current;
      if (slidingRef.current) return;

      if (e.touches.length >= 2) {
        const a = e.touches[0]!;
        const b = e.touches[1]!;
        const { cx, cy } = center();
        g.mode = "pinch";
        g.moved = true;
        g.startDist = touchDist(a, b) || 1;
        g.startScale = view.current.scale;
        g.startTx = view.current.x;
        g.startTy = view.current.y;
        g.focalX = (a.clientX + b.clientX) / 2 - cx;
        g.focalY = (a.clientY + b.clientY) / 2 - cy;
        return;
      }

      const t = e.touches[0];
      if (!t) return;
      g.mode = "pan";
      g.moved = false;
      g.startX = t.clientX;
      g.startY = t.clientY;
      g.startTx = view.current.x;
      g.startTy = view.current.y;
      transition(0); // 손가락을 따라갈 때는 트랜지션이 없어야 붙어 움직인다
    };

    const onTouchMove = (e: TouchEvent) => {
      const g = gesture.current;
      if (g.mode === "none") return;
      e.preventDefault();

      if (g.mode === "pinch" && e.touches.length >= 2) {
        const a = e.touches[0]!;
        const b = e.touches[1]!;
        const s1 = clamp((touchDist(a, b) / g.startDist) * g.startScale, MIN_SCALE, MAX_SCALE);
        // 매 프레임 "제스처 시작 상태" 기준으로 다시 계산해야 오차가 쌓이지 않는다
        view.current.x = g.focalX - ((g.focalX - g.startTx) * s1) / g.startScale;
        view.current.y = g.focalY - ((g.focalY - g.startTy) * s1) / g.startScale;
        view.current.scale = s1;
        clampOffset();
        apply();
        return;
      }

      const t = e.touches[0];
      if (!t) return;
      const dx = t.clientX - g.startX;
      const dy = t.clientY - g.startY;
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) g.moved = true;

      if (view.current.scale > 1) {
        // 확대 상태: 끌어서 사진 안에서 이동
        view.current.x = g.startTx + dx;
        view.current.y = g.startTy + dy;
        clampOffset();
        apply();
        return;
      }

      // 원배율: 손가락을 따라 사진이 같이 밀린다 (세로로 긋는 중이면 놔둔다)
      if (Math.abs(dx) > Math.abs(dy)) {
        dragRef.current = dx * DRAG_FOLLOW;
        apply();
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      const g = gesture.current;
      const wasPinch = g.mode === "pinch";

      // 손가락이 하나 남으면 이어서 끌 수 있도록 기준을 다시 잡는다
      if (e.touches.length === 1) {
        const t = e.touches[0]!;
        g.mode = "pan";
        g.moved = true;
        g.startX = t.clientX;
        g.startY = t.clientY;
        g.startTx = view.current.x;
        g.startTy = view.current.y;
        return;
      }
      if (e.touches.length > 0) return;

      g.mode = "none";
      if (wasPinch) return;

      const t = e.changedTouches[0];
      if (!t) return;
      const dx = t.clientX - g.startX;
      const dy = t.clientY - g.startY;

      if (!g.moved) {
        // 더블탭 → 확대 / 원래대로
        const now = Date.now();
        if (now - lastTapRef.current < DOUBLE_TAP_MS) {
          lastTapRef.current = 0;
          const { cx, cy } = center();
          if (view.current.scale > 1) resetZoom();
          else zoomTo(DOUBLE_TAP_SCALE, t.clientX - cx, t.clientY - cy);
        } else {
          lastTapRef.current = now;
        }
        return;
      }

      if (view.current.scale > 1) return;

      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_PX) {
        slide(dx < 0 ? 1 : -1);
      } else if (dy > CLOSE_PX) {
        snapBack();
        requestClose();
      } else {
        // 덜 끌었으면 제자리로
        snapBack();
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const { cx, cy } = center();
      const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
      zoomTo(view.current.scale * factor, e.clientX - cx, e.clientY - cy);
    };

    box.addEventListener("touchstart", onTouchStart, { passive: false });
    box.addEventListener("touchmove", onTouchMove, { passive: false });
    box.addEventListener("touchend", onTouchEnd);
    box.addEventListener("touchcancel", onTouchEnd);
    box.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      box.removeEventListener("touchstart", onTouchStart);
      box.removeEventListener("touchmove", onTouchMove);
      box.removeEventListener("touchend", onTouchEnd);
      box.removeEventListener("touchcancel", onTouchEnd);
      box.removeEventListener("wheel", onWheel);
    };
  }, [apply, clampOffset, requestClose, resetZoom, slide, transition, zoomTo]);

  const current = images[index];

  const arrowCls = [
    "absolute top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center",
    "rounded-full bg-white/10 text-white backdrop-blur-sm transition-opacity",
    zoomed ? "pointer-events-none opacity-0" : "opacity-100",
  ].join(" ");

  return createPortal(
    <div
      className={[
        // z-50 인 BGM 버튼보다 위에 와야 닫기 버튼이 가려지지 않는다
        "fixed inset-0 z-[120] mobile-fixed-overlay bg-black",
        "transition-opacity ease-out",
        visible ? "opacity-100" : "opacity-0",
      ].join(" ")}
      style={{ transitionDuration: `${FADE_MS}ms` }}
      role="dialog"
      aria-modal="true"
      aria-label="사진 크게 보기"
    >
      <div
        ref={containerRef}
        className="absolute inset-0 flex touch-none items-center justify-center overflow-hidden"
      >
        <img
          ref={imgRef}
          src={current?.src}
          alt={current?.alt}
          className="max-h-full max-w-full select-none object-contain will-change-transform"
          draggable={false}
          decoding="async"
        />
        {/* 길게 눌러 저장 차단. 버튼들은 뒤에 렌더되어 위에 온다. */}
        <PhotoGuard />
      </div>

      <button
        type="button"
        onClick={requestClose}
        aria-label="닫기"
        className="absolute right-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm"
        style={{ top: "max(env(safe-area-inset-top), 0.75rem)" }}
      >
        <X size={22} />
      </button>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => slide(-1)}
            aria-label="이전 사진"
            className={`${arrowCls} left-2`}
          >
            <ChevronLeft size={24} />
          </button>
          <button
            type="button"
            onClick={() => slide(1)}
            aria-label="다음 사진"
            className={`${arrowCls} right-2`}
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      <div
        className="pointer-events-none absolute inset-x-0 text-center text-xs font-medium text-white/80"
        style={{ bottom: "max(env(safe-area-inset-bottom), 1rem)" }}
      >
        {index + 1} / {images.length}
      </div>
    </div>,
    document.body
  );
}
