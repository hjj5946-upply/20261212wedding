import { memo, useEffect, useRef, useState } from "react";
import type { WeddingConfig } from "../config/wedding";
import { Section } from "../components/Section";
// import { asset } from "../utils/asset";

type Props = { data: WeddingConfig };

// ── [이전 버전] 명언 + 본문 (되살리려면 아래 주석을 해제하고 새 본문을 주석 처리) ──
// // 1. 명언: 깔끔하게 고정 텍스트 반환
// function buildQuote() {
//   return `사랑은 서로를 바라보는 것이 아니라\n함께 같은 방향을 바라보는 것`;
// }
//
// // 2. 본문: data 인자를 아예 제거했습니다. 그냥 텍스트만 뱉습니다.
// function buildInviteMessage() {
//   return (
//     `서로 다른 시간과 계절을 지나\n` +
//     `서로의 하루가 되어온 두 사람이\n` +
//     `이제 같은 방향을 바라보며\n` +
//     `한 걸음 한 걸음 함께 걷고자 합니다.\n\n` +
//     `완벽한 날보다 서로를 더 아끼는 날을\n` +
//     `화려한 순간보다 평범한 일상을 더 소중히 여기며\n` +
//     `웃음과 배려로 가득한 가정을 이루겠습니다.\n\n` +
//     `저희의 첫 시작에 귀한 걸음으로 함께해 주시어\n` +
//     `따뜻한 축복으로 자리해 주시면\n` +
//     `오래도록 감사한 마음으로 간직하겠습니다.`
//   );
// }
//
// const QUOTE = buildQuote();
// const INVITE_MESSAGE = buildInviteMessage();

// 본문 (고정 문구이므로 렌더마다 다시 만들지 않는다)
const INVITE_MESSAGE =
  `설렘으로 시작해서\n` +
  `이제는 습관처럼 서로를 찾습니다.\n` +
  `매일 봐도 여전히 좋은, 그런 사이입니다.\n\n` +
  `거창한 이유는 없습니다.\n` +
  `그냥 이 사람과 살면 계속 재밌을 것 같아서\n` +
  `결혼하기로 했습니다.\n\n` +
  `바쁘신 와중에도 귀한 걸음 해주시면\n` +
  `저희 두 사람, 그 마음 오래 기억하며\n` +
  `재밌게 잘 살겠습니다.`;

// 컴포넌트 밖으로 빼서 렌더마다 새 컴포넌트 타입이 생기지 않게 한다
function WeddingDivider() {
  return (
    <div className="flex items-center justify-center w-full my-10 px-4">
      {/* 왼쪽 선 */}
      <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-[#86cf70]"></div>

      {/* 나뭇잎 문양 */}
      <div className="mx-4 flex items-center justify-center">
        <svg width="52" height="32" viewBox="0 0 42 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* 왼쪽 잎 */}
          <path
            d="M21 20C21 20 15 18 13 12C11 6 15 2 15 2C15 2 21 6 21 12"
            stroke="#6ba339" /* 올리브 그린 */
            strokeWidth="1"
            strokeLinecap="round"
          />
          {/* 오른쪽 잎 */}
          <path
            d="M21 20C21 20 27 18 29 12C31 6 27 2 27 2C27 2 21 6 21 12"
            stroke="#91c45e" /* 약간 더 밝은 그린 */
            strokeWidth="1"
            strokeLinecap="round"
          />
          {/* 중앙 줄기 점 */}
          <circle cx="21" cy="21" r="1" fill="#86cf70" />
        </svg>
      </div>

      {/* 오른쪽 선 */}
      <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-[#86cf70]"></div>
    </div>
  );
}

function MessageSectionBase({ data }: Props) {
  // const logoSrc = asset("images/main_img.webp");

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
        {/* <div
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
        </div> */}

        <div className={["transition-all duration-1000 ease-out", revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"].join(" ")}>
          <WeddingDivider />
        </div>

        {/* ── [이전 버전] 짧은 명언 ──
        <p
          className={[
            "mt-6 whitespace-pre-line",
            "text-base leading-8 text-neutral-800",
            "transition-all duration-700 ease-out delay-150",
            revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
          ].join(" ")}
        >
          {QUOTE}
        </p>
        ── */}

        {/* 본문 (Pretendard, 조금 더 크고 굵게) */}
        <p
          className={[
            "mt-10 whitespace-pre-line",
            "font-sans text-lg font-medium leading-9 text-neutral-800",
            "transition-all duration-700 ease-out delay-150",
            revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
          ].join(" ")}
        >
          {INVITE_MESSAGE}
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

export const MessageSection = memo(MessageSectionBase);