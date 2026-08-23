import { useEffect, useState } from "react";

/**
 * "흔들리지 않는" 뷰포트 높이(px).
 *
 * 카카오 같은 인앱 브라우저는 상·하단 바가 접힐 때 WebView 크기를 실제로 바꾼다.
 * 그래서 vh / svh / dvh 가 스크롤 도중 다시 계산되고, 뷰포트 단위로 높이를 잡아둔
 * 섹션(히어로, 인포)이 눈에 띄게 늘었다 줄었다 한다.
 * 크롬·사파리는 주소창이 접혀도 vh 를 고정해 두므로 이 현상이 없다.
 *
 * 최초 1회 px 로 재서 고정하고, 가로 폭이 바뀔 때(화면 회전 등)만 다시 잰다.
 * 세로만 변한 리사이즈는 전부 무시한다 — 그게 바로 바가 접힌 경우다.
 */
export function useStableViewportHeight(): number {
  const [height, setHeight] = useState(() => window.innerHeight);

  useEffect(() => {
    let lastWidth = window.innerWidth;

    const onResize = () => {
      // 높이만 변한 건 인앱 브라우저의 바 접힘이다. 무시한다.
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      setHeight(window.innerHeight);
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);

  return height;
}
