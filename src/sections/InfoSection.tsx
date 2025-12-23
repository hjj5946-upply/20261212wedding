import { useEffect, useMemo, useRef, useState } from "react";
import type { WeddingConfig } from "../config/wedding";
import { Section } from "../components/Section";

type Props = { data: WeddingConfig };

function pad2(n: number) {
  return String(n).padStart(2, "0");
}
function clamp0(n: number) {
  return Math.max(0, n);
}
function diffParts(target: Date, now: Date) {
  const ms = clamp0(target.getTime() - now.getTime());
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  return { days, hours, minutes, seconds };
}

function buildCalendarGrid(year: number, month1to12: number) {
  const m = month1to12 - 1;
  const first = new Date(year, m, 1);
  const last = new Date(year, m + 1, 0);
  const startWeekday = first.getDay(); // 0=Sun
  const daysInMonth = last.getDate();

  const cells: Array<{ day: number | null; weekday: number }> = [];
  for (let i = 0; i < startWeekday; i++) cells.push({ day: null, weekday: i % 7 });

  for (let d = 1; d <= daysInMonth; d++) {
    const idx = cells.length;
    const weekday = idx % 7;
    cells.push({ day: d, weekday });
  }
  while (cells.length % 7 !== 0) {
    const idx = cells.length;
    cells.push({ day: null, weekday: idx % 7 });
  }

  return { cells };
}

function dateTextClass(weekday: number, day: number | null) {
  if (!day) return "text-transparent";
  // 크리스마스(25일) 빨강
  if (day === 25) return "text-red-500";
  // 일요일 빨강, 토요일 파랑
  if (weekday === 0) return "text-red-500";
  if (weekday === 6) return "text-blue-500";
  return "text-neutral-800";
}

export function InfoSection({ data }: Props) {
  const weddingDate = useMemo(() => new Date(data.ceremony.dateISO), [data.ceremony.dateISO]);
  const [now, setNow] = useState(() => new Date());

  const rootRef = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  // 0: 대기, 1: 인트로 재생, 5: 본문
  const [step, setStep] = useState<0 | 1 | 5>(0);

  const year = weddingDate.getFullYear();
  const month = weddingDate.getMonth() + 1;
  const day = weddingDate.getDate();

  // ✅ year/month가 바뀌면 달력도 다시 생성되어야 함
  const cal = useMemo(() => buildCalendarGrid(year, month), [year, month]);
  const weekdaysKo = ["일", "월", "화", "수", "목", "금", "토"];

  const { days, hours, minutes, seconds } = useMemo(
    () => diffParts(weddingDate, now),
    [weddingDate, now]
  );

  // 섹션 진입/이탈 감지 (다시 들어오면 인트로 재시작)
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.55,
    });

    io.observe(el);
    return () => io.disconnect();
  }, []);

  // ✅ 인트로 길이를 "문자 수 기반"으로 계산해서 끝나자마자 본문으로 전환
  useEffect(() => {
    if (!inView) {
      setStep(0);
      return;
    }

    setStep(1);

    const topText = "SAT   PM 13:20";
    const bottomText = `${year}. ${pad2(month)}. ${pad2(day)}.`;

    const topStepMs = 65;
    const bottomStepMs = 55;
    const charDur = 600; // StaggerText duration-600과 일치
    const buffer = 160;  // 아주 짧은 숨

    const topTotal = (topText.length - 1) * topStepMs + charDur;
    const bottomTotal = (bottomText.length - 1) * bottomStepMs + charDur;
    const introTotal = Math.max(topTotal, bottomTotal) + buffer;

    const t = window.setTimeout(() => setStep(5), introTotal);
    return () => window.clearTimeout(t);
  }, [inView, year, month, day]);

  // 본문 표시(step=5)부터 초 단위 갱신
  useEffect(() => {
    if (step !== 5) return;
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, [step]);

  const titleLogoSrc: string | null = null;
  const titleText = "WEDDING DAY";

  return (
    <Section className="p-0">
      <div
        ref={rootRef}
        className={[
          "relative w-screen min-h-screen overflow-hidden",
          "bg-white", // ✅ 내용화면은 처음부터 끝까지 흰색 베이스
        ].join(" ")}
      >
        {/* ✅ 인트로: 그린 배경은 오버레이에만 존재 */}
        <div
          className={[
            "absolute inset-0 flex items-center justify-center pointer-events-none",
            "bg-[#86cf70]",
            "transition-opacity duration-700 ease-out", // ✅ 효과 끝나면 바로 스르르 사라짐
            step === 1 ? "opacity-100" : "opacity-0",
          ].join(" ")}
        >
          <div className="text-center">
            <div className="text-xl tracking-[0.20em] text-neutral-800">
              <StaggerText text={"SAT   PM 13:20"} direction="down" start={step === 1} stepMs={65} />
            </div>

            <div className="mt-5 text-4xl font-semibold tracking-[0.06em] text-neutral-900">
              <StaggerText
                text={`${year}. ${pad2(month)}. ${pad2(day)}.`}
                direction="up"
                start={step === 1}
                stepMs={55}
              />
            </div>
          </div>
        </div>

        {/* ✅ 본문: 흰 배경 위에서 스르르 나타남 */}
        <div
          className={[
            "relative min-h-screen flex flex-col items-center justify-center",
            "transition-all duration-800 ease-out", // ✅ 1100 -> 800 (더 자연스럽게 빠름)
            step === 5 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
          ].join(" ")}
        >
          <div className="w-full max-w-md px-5 text-center">
            {/* 타이틀 */}
            <div className="flex justify-center">
              {titleLogoSrc ? (
                <img src={titleLogoSrc} alt="wedding day" className="h-12 w-auto" loading="lazy" draggable={false} />
              ) : (
                <div className="text-2xl font-semibold tracking-[0.22em] text-neutral-900">{titleText}</div>
              )}
            </div>

            <div className="mt-10 text-sm text-neutral-700">2026년 12월 12일 토요일 | 오후 1시 20분</div>
            <div className="mt-2 text-sm text-neutral-500">Saturday, Dec 12 . 2026 | PM 13:20</div>

            {/* 달력 */}
            <div className="mt-12 mx-auto w-full">
              {/* 스프링 */}
              <div className="mb-4 flex justify-center gap-2">
                {Array.from({ length: 19 }).map((_, i) => (
                  <span key={i} className="inline-block h-2 w-3 rounded-full border border-neutral-300 bg-white" />
                ))}
              </div>

              {/* 헤더 */}
              <div className="text-sm font-medium text-neutral-900 text-center">
                {year}. {pad2(month)}
              </div>

              {/* 요일 */}
              <div className="mt-3 grid grid-cols-7 gap-1 text-[12px]">
                {weekdaysKo.map((w, idx) => (
                  <div
                    key={w}
                    className={[
                      "py-1",
                      idx === 0 ? "text-red-500" : idx === 6 ? "text-blue-500" : "text-neutral-500",
                    ].join(" ")}
                  >
                    {w}
                  </div>
                ))}
              </div>

              {/* 날짜 셀 (배경 없음) */}
              <div className="mt-1 grid grid-cols-7 gap-1">
                {cal.cells.map((c, idx) => {
                  const isHit = c.day === day;
                  const textCls = dateTextClass(c.weekday, c.day);

                  return (
                    <div key={idx} className="relative h-9 rounded-lg flex items-center justify-center text-sm">
                      <span className={[c.day ? textCls : "text-transparent", isHit ? "font-semibold" : ""].join(" ")}>
                        {c.day ?? "."}
                      </span>

                      {/* 결혼 날짜 링 */}
                      {isHit && <span className="absolute h-8 w-8 rounded-full border border-[#2fa833]/90" />}
                    </div>
                  );
                })}
              </div>

              {/* 아래 구분선 */}
              <div className="mt-3 h-px w-full bg-neutral-200" />
            </div>

            {/* D-day 카드: 흰색 + border + shadow */}
            <div className="mt-10 grid grid-cols-4 gap-3">
              <CountdownCard label="DAYS" value={days} />
              <CountdownCard label="HOURS" value={hours} />
              <CountdownCard label="MINUTES" value={minutes} />
              <CountdownCard label="SECONDS" value={seconds} />
            </div>

            <div className="mt-14 text-sm text-neutral-700">
              정준 ♥ 송희 결혼식이 <span className="font-semibold text-neutral-900">{days}</span>일 남았습니다.
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

function CountdownCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white p-3 text-center border border-neutral-200 shadow-sm">
      <div className="text-[11px] tracking-widest text-neutral-600">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-neutral-900">{String(value).padStart(2, "0")}</div>
    </div>
  );
}

function StaggerText({
  text,
  direction,
  start,
  stepMs = 70,
  className,
}: {
  text: string;
  direction: "down" | "up";
  start: boolean;
  stepMs?: number;
  className?: string;
}) {
  const chars = Array.from(text);

  return (
    <span className={["inline-flex", className ?? ""].join(" ")}>
      {chars.map((ch, i) => (
        <span
          key={i}
          className={[
            "inline-block",
            "transition-all ease-out",
            "duration-600",
            start
              ? "opacity-100 translate-y-0"
              : direction === "down"
                ? "opacity-0 -translate-y-5"
                : "opacity-0 translate-y-5",
          ].join(" ")}
          style={{ transitionDelay: `${i * stepMs}ms` }}
        >
          {ch === " " ? "\u00A0" : ch}
        </span>
      ))}
    </span>
  );
}
