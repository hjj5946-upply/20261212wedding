import { useEffect, useRef, useState } from "react";

/**
 * 섹션 진입/이탈 감지 훅.
 *
 * StorySection / CoupleIntroSection 이 각자 갖고 있던 동일 구현을 하나로 합쳤다.
 * 기존 구현은 옵션을 객체로 받아 useEffect 의존성에 그대로 넣었기 때문에,
 * 호출부가 `{ threshold: 0.2 }` 리터럴을 넘기면 매 렌더마다 새 객체가 되어
 * IntersectionObserver 가 계속 disconnect → 재생성되고 있었다.
 * threshold 를 원시값으로 받아 의존성을 안정화한다.
 *
 * ── 진입/이탈 기준이 비대칭인 이유 (히스테리시스) ──────────────────────────
 * 예전에는 `setInView(entry.isIntersecting)` 로 threshold 한 지점에서 양방향
 * 판정을 했다. 그런데 교차 "비율"은 뷰포트 높이 기준으로 계산된다.
 * 카카오 같은 인앱 브라우저는 상·하단 바가 접힐 때 WebView 크기를 실제로 바꾸므로,
 * 스크롤을 멈춰도 비율이 저절로 움직여 경계값 근처의 섹션이 false↔true 로 뒤집혔다.
 * 이 훅을 쓰는 섹션들은 이탈 시 등장 애니메이션을 리셋하도록 되어 있어서,
 * 뒤집힐 때마다 애니메이션이 통째로 다시 재생됐다(= 스크롤 중 섹션이 계속 움직임).
 * 크롬·사파리는 주소창이 접혀도 뷰포트를 고정하므로 이 현상이 없다.
 *
 * 그래서 진입은 기존과 동일하게 비율(threshold)로 판정하되,
 * 이탈은 "완전히 화면 밖으로 나갔을 때"만 인정한다.
 * 화면 높이만 한 섹션이 바 접힘 정도의 변화로 완전히 사라질 수는 없으므로 뒤집히지 않고,
 * 사용자가 실제로 다른 섹션으로 이동했다 돌아오면 예전처럼 다시 재생된다.
 */
export function useInView<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // 진입 지점(threshold)과 완전 이탈 지점(0), 두 곳에서만 콜백을 받는다.
    const thresholds = Array.from(new Set([0, threshold])).sort((a, b) => a - b);

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        if (!entry) return;

        setInView((prev) => {
          if (!entry.isIntersecting) return false;          // 완전히 벗어남 → 리셋
          if (entry.intersectionRatio >= threshold) return true; // 충분히 보임 → 재생
          return prev;                                       // 그 사이는 상태 유지
        });
      },
      { threshold: thresholds }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return { ref, inView };
}
