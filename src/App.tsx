import { useMemo, useState, useEffect } from "react";
import { Invitation } from "./pages/Invitation";
import { IntroHost, IntroStyle } from "./intro/IntroHost";

/**
 * 인트로 스타일 선택
 *
 * URL 파라미터로 테스트:
 * - ?intro=montage   (A안: 마블 코믹스 스타일 몽타주)
 * - ?intro=filmstrip (B안: 필름 스트립 레트로)
 * - ?intro=game      (C안: 인터랙티브 게임)
 * - ?intro=gate      (D안: 문/빛 입장) ← 기본값
 *
 * 또는 아래 DEFAULT_INTRO_STYLE 변수를 직접 수정하세요
 */
const DEFAULT_INTRO_STYLE: IntroStyle = "gate"; // 👈 여기서 기본 스타일 변경!

function getIntroStyle(): IntroStyle {
  const params = new URLSearchParams(window.location.search);
  const v = params.get("intro");

  // URL 파라미터 확인
  if (v === "montage" || v === "filmstrip" || v === "game" || v === "gate") {
    return v;
  }

  return DEFAULT_INTRO_STYLE;
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

export default function App() {
  useBlockContextMenu(true);
  usePreventPinchZoom(true);

  const introStyle = useMemo(() => getIntroStyle(), []);
  const [introDone, setIntroDone] = useState(false);

  if (isNoIntro()) {
    return <Invitation />;
  }

  return (
    <>
      {!introDone && (
        <IntroHost style={introStyle} onDone={() => setIntroDone(true)} />
      )}
      {introDone && <Invitation />}
    </>
  );
}
