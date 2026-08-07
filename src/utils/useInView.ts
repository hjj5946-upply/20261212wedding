import { useEffect, useRef, useState } from "react";

/**
 * 섹션 진입/이탈 감지 훅.
 *
 * StorySection / CoupleIntroSection 이 각자 갖고 있던 동일 구현을 하나로 합쳤다.
 * 기존 구현은 옵션을 객체로 받아 useEffect 의존성에 그대로 넣었기 때문에,
 * 호출부가 `{ threshold: 0.2 }` 리터럴을 넘기면 매 렌더마다 새 객체가 되어
 * IntersectionObserver 가 계속 disconnect → 재생성되고 있었다.
 * threshold 를 원시값으로 받아 의존성을 안정화한다(감지 동작은 동일).
 */
export function useInView<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return { ref, inView };
}
