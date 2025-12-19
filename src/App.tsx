// App.tsx
import { useEffect, useMemo, useState } from "react";
import { Invitation } from "./pages/Invitation";
import { IntroHost, type IntroStyle } from "./intro/IntroHost";

const DEFAULT_INTRO_STYLE: IntroStyle = "filmstrip";
const INTRO_STYLE_KEY = "intro_style_v1";

function isIntroStyle(v: string | null): v is IntroStyle {
  return v === "montage" || v === "filmstrip" || v === "game" || v === "gate";
}

function readIntroStyleFromUrl(): IntroStyle | null {
  const params = new URLSearchParams(window.location.search);
  const v = params.get("intro");
  return isIntroStyle(v) ? v : null;
}

function readIntroStyleFromStorage(): IntroStyle | null {
  const v = localStorage.getItem(INTRO_STYLE_KEY);
  return isIntroStyle(v) ? v : null;
}

function isNoIntro(): boolean {
  const params = new URLSearchParams(window.location.search);
  return params.get("noIntro") === "1";
}

function useBlockContextMenu(enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const onContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", onContextMenu);
    return () => document.removeEventListener("contextmenu", onContextMenu);
  }, [enabled]);
}

function usePreventPinchZoom(enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const preventZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) e.preventDefault();
    };
    document.addEventListener("touchmove", preventZoom, { passive: false });
    return () => document.removeEventListener("touchmove", preventZoom);
  }, [enabled]);
}

/** ✅ 임시: 인트로 A~D 토글 (확정되면 삭제/주석 처리) */
function IntroVariantToggle({
  value,
  onChange,
}: {
  value: IntroStyle;
  onChange: (v: IntroStyle) => void;
}) {
  const Btn = ({ v, label }: { v: IntroStyle; label: string }) => (
    <button
      type="button"
      onClick={() => onChange(v)}
      className={[
        "h-8 px-3 rounded-full text-xs font-semibold transition",
        value === v ? "bg-white text-neutral-900" : "bg-white/10 text-white/85",
      ].join(" ")}
    >
      {label}
    </button>
  );

  return (
    <div
      className={[
        "fixed z-[999]",
        "top-4 left-1/2 -translate-x-1/2",
        "flex items-center gap-2",
        "rounded-full bg-black/45 backdrop-blur",
        "px-2 py-2 shadow",
        "select-none",
      ].join(" ")}
      style={{ paddingTop: "max(env(safe-area-inset-top), 8px)" }}
    >
      <span className="px-2 text-[11px] text-white/85">시안</span>
      <Btn v="montage" label="A" />
      <Btn v="filmstrip" label="B" />
      <Btn v="game" label="C" />
      <Btn v="gate" label="D" />
    </div>
  );
}

export default function App() {
  useBlockContextMenu(true);
  usePreventPinchZoom(true);

  // ✅ URL 우선, 없으면 storage, 없으면 default
  const initialIntroStyle = useMemo(() => {
    return readIntroStyleFromUrl() ?? readIntroStyleFromStorage() ?? DEFAULT_INTRO_STYLE;
  }, []);

  const [introStyle, setIntroStyle] = useState<IntroStyle>(initialIntroStyle);
  const [introDone, setIntroDone] = useState(false);

  // ✅ 토글로 바꾸면 storage에 저장(배포 테스트 편하게)
  useEffect(() => {
    localStorage.setItem(INTRO_STYLE_KEY, introStyle);
  }, [introStyle]);

  if (isNoIntro()) return <Invitation />;

  return (
    <>
      {/* ✅ 임시 토글: 확정되면 이 줄 + IntroVariantToggle 컴포넌트 삭제 */}
      {!introDone && <IntroVariantToggle value={introStyle} onChange={setIntroStyle} />}

      {!introDone && <IntroHost style={introStyle} onDone={() => setIntroDone(true)} />}
      {introDone && <Invitation />}
    </>
  );
}
