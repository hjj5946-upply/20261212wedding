import { useEffect, useRef, useState } from "react";
import type { WeddingConfig } from "../config/wedding";
import { Section } from "../components/Section";

type Props = { data: WeddingConfig };

// 1. 명언: 깔끔하게 고정 텍스트 반환
function buildQuote() {
  return `사랑은 서로를 바라보는 것이 아니라\n함께 같은 방향을 바라보는 것`;
}

// 2. 본문: data 인자를 아예 제거했습니다. 그냥 텍스트만 뱉습니다.
function buildInviteMessage() {
  return (
    `서로 다른 시간과 계절을 지나\n` +
    `서로의 하루가 되어온 두 사람이\n` +
    `이제 같은 방향을 바라보며\n` +
    `한 걸음 한 걸음 함께 걷고자 합니다.\n\n` +
    `완벽한 날보다 서로를 더 아끼는 날을\n` +
    `화려한 순간보다 평범한 일상을 더 소중히 여기며\n` +
    `웃음과 배려로 가득한 가정을 이루겠습니다.\n\n` +
    `저희의 첫 시작에 귀한 걸음으로 함께해 주시어\n` +
    `따뜻한 축복으로 자리해 주시면\n` +
    `오래도록 감사한 마음으로 간직하겠습니다.`
  );
}

export function MessageSection({ data }: Props) {
  const logoSrc = "/images/main_img.webp";

  const rootRef = useRef<HTMLDivElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          io.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px" }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Section id="message" className="px-5 py-16">
      <div ref={rootRef} className="mx-auto max-w-md text-center">
        {/* 로고 */}
        <div
          className={[
            "mx-auto flex justify-center",
            "transition-all duration-700 ease-out",
            revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
          ].join(" ")}
        >
          <img
            src={logoSrc}
            alt="wedding logo"
            className="h-14 w-auto"
            loading="lazy"
            draggable={false}
          />
        </div>

        {/* 짧은 명언 */}
        <p
          className={[
            "mt-6 whitespace-pre-line",
            "text-base leading-8 text-neutral-800",
            "transition-all duration-700 ease-out delay-150",
            revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
          ].join(" ")}
        >
          {buildQuote()}
        </p>

        {/* 본문: 호출 시 data를 빼버렸습니다. (에러 해결 핵심) */}
        <p
          className={[
            "mt-10 whitespace-pre-line",
            "text-base leading-8 text-neutral-800",
            "transition-all duration-700 ease-out delay-250",
            revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
          ].join(" ")}
        >
          {buildInviteMessage()}
        </p>

        {/* 신랑 · 신부: data는 여기서만 사용됩니다. */}
        <div
          className={[
            "mt-8 text-base font-medium text-neutral-900",
            "transition-all duration-700 ease-out delay-350",
            revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
          ].join(" ")}
        >
          신랑 {data.couple.groomName} · 신부 {data.couple.brideName}
        </div>
      </div>
    </Section>
  );
}