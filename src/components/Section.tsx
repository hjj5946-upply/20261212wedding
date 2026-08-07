import { useEffect, useRef, useState } from "react";

export function Section({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);
  // 등장 트랜지션이 끝난 뒤 will-change를 떼기 위한 플래그
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect(); // 한 번 등장하면 더 관찰할 필요가 없다
        }
      },
      { threshold: 0.15 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  // will-change는 애니메이션 중에만 의미가 있다. 계속 걸어두면 섹션 수만큼
  // 합성 레이어가 남아 모바일에서 메모리를 잡아먹으므로 700ms 후 해제한다.
  useEffect(() => {
    if (!inView) return;
    const t = window.setTimeout(() => setSettled(true), 700);
    return () => window.clearTimeout(t);
  }, [inView]);

  return (
    <section
      id={id}
      ref={ref}
      className={[
        "transition duration-700",
        settled ? "" : "will-change-transform",
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
        className,
      ].join(" ")}
    >
      {children}
    </section>
  );
}
