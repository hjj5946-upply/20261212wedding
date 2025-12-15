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

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.15 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      id={id}
      ref={ref}
      className={[
        "transition duration-700 will-change-transform",
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
        className,
      ].join(" ")}
    >
      {children}
    </section>
  );
}
