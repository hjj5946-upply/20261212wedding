// App.tsx
import { useEffect, useState } from "react";
import { Invitation } from "./pages/Invitation";
import { IntroHost, type IntroStyle } from "./intro/IntroHost";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// const DEFAULT_INTRO_STYLE: IntroStyle = "montage";
const INTRO_STYLE_KEY = "intro_style_v1";

// function isIntroStyle(v: string | null): v is IntroStyle {
//   return v === "montage" || v === "filmstrip" || v === "game" || v === "gate";
// }

// function readIntroStyleFromUrl(): IntroStyle | null {
//   const params = new URLSearchParams(window.location.search);
//   const v = params.get("intro");
//   return isIntroStyle(v) ? v : null;
// }

// function readIntroStyleFromStorage(): IntroStyle | null {
//   const v = localStorage.getItem(INTRO_STYLE_KEY);
//   return isIntroStyle(v) ? v : null;
// }

function isNoIntro(): boolean {
  const params = new URLSearchParams(window.location.search);
  return params.get("noIntro") === "1";
}

function useBlockContextMenu(enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const onContextMenu = (e: Event) => e.preventDefault();
    // 이미지 드래그(=PC에서 이미지 끌어다 저장)도 같이 막는다.
    const onDragStart = (e: Event) => {
      if ((e.target as HTMLElement | null)?.tagName === "IMG") e.preventDefault();
    };

    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("dragstart", onDragStart);
    return () => {
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("dragstart", onDragStart);
    };
  }, [enabled]);
}

/**
 * 핀치 줌 차단.
 *
 * ⚠️ 예전 구현은 document에 non-passive touchmove 리스너를 걸어 두 손가락일 때만
 *    preventDefault 했다. 그런데 non-passive touchmove가 하나라도 걸려 있으면
 *    브라우저는 "이 터치가 스크롤인지" 판정을 메인 스레드 JS 응답 이후로 미룬다.
 *    카카오 인앱 브라우저(WebView)에서는 이게 그대로 스크롤 끊김/뻑뻑함으로 나타났다.
 *
 * 지금은 CSS `touch-action: pan-y`(src/index.css)가 컴포지터 레벨에서 핀치/더블탭 줌을
 * 막는다. 여기서는 CSS로 못 막는 iOS Safari의 gesture 이벤트만 보조로 처리한다.
 * (gesture 계열은 스크롤 경로에 관여하지 않아 성능에 영향이 없다.)
 */
function usePreventPinchZoom(enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const prevent = (e: Event) => e.preventDefault();

    document.addEventListener("gesturestart", prevent);
    document.addEventListener("gesturechange", prevent);
    document.addEventListener("gestureend", prevent);
    return () => {
      document.removeEventListener("gesturestart", prevent);
      document.removeEventListener("gesturechange", prevent);
      document.removeEventListener("gestureend", prevent);
    };
  }, [enabled]);
}

/** ✅ 임시: 인트로 A~D 토글 (확정되면 삭제/주석 처리) */
// function IntroVariantToggle({
//   value,
//   onChange,
// }: {
//   value: IntroStyle;
//   onChange: (v: IntroStyle) => void;
// }) {
//   const Btn = ({ v, label }: { v: IntroStyle; label: string }) => (
//     <button
//       type="button"
//       onClick={() => onChange(v)}
//       className={[
//         "h-8 px-3 rounded-full text-xs font-semibold transition",
//         value === v ? "bg-white text-neutral-900" : "bg-white/10 text-white/85",
//       ].join(" ")}
//     >
//       {label}
//     </button>
//   );

//   return (
//     <div
//       className={[
//         "fixed z-[999]",
//         "top-4 left-1/2 -translate-x-1/2",
//         "flex items-center gap-2",
//         "rounded-full bg-black/45 backdrop-blur",
//         "px-2 py-2 shadow",
//         "select-none",
//       ].join(" ")}
//       style={{ paddingTop: "max(env(safe-area-inset-top), 8px)" }}
//     >
//       <span className="px-2 text-[11px] text-white/85">시안</span>
//       <Btn v="montage" label="A" />
//       <Btn v="filmstrip" label="B" />
//       <Btn v="game" label="C" />
//       <Btn v="gate" label="D" />
//     </div>
//   );
// }

export default function App() {
  useBlockContextMenu(true);
  usePreventPinchZoom(true);

  // ✅ A안 확정: 항상 montage (URL·localStorage 무시)
  const initialIntroStyle: IntroStyle = "montage";
  // [A안 확정으로 비활성화] URL/storage에서 읽어 A~D 전환하는 로직
  // const initialIntroStyle = useMemo(() => {
  //   return readIntroStyleFromUrl() ?? readIntroStyleFromStorage() ?? DEFAULT_INTRO_STYLE;
  // }, []);

  const [introStyle] = useState<IntroStyle>(initialIntroStyle);
  const [introDone, setIntroDone] = useState(false);

  useEffect(() => {
    localStorage.setItem(INTRO_STYLE_KEY, introStyle);
  }, [introStyle]);

  if (isNoIntro()) return <Invitation />;

  return (
    <>
      {!introDone && <IntroHost style={introStyle} onDone={() => setIntroDone(true)} />}
      {introDone && <Invitation />}
    </>
  );
}
