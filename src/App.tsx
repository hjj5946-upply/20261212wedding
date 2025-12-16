import { useMemo, useState, useEffect } from "react";
import { Invitation } from "./pages/Invitation";
import { IntroHost } from "./intro/IntroHost";

function getIntroOption(): 1 | 2 | 3 {
  const params = new URLSearchParams(window.location.search);
  const v = params.get("intro");
  if (v === "2") return 2;
  if (v === "3") return 3;
  return 3;
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

  const option = useMemo(() => getIntroOption(), []);
  const [introDone, setIntroDone] = useState(false);

  if (isNoIntro()) {
    return <Invitation />;
  }

  return (
    <>
      {!introDone && (
        <IntroHost option={option} onDone={() => setIntroDone(true)} />
      )}
      {introDone && <Invitation />}
    </>
  );
}
