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

  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);

  const year = weddingDate.getFullYear();
  const month = weddingDate.getMonth() + 1;
  const day = weddingDate.getDate();

  const cal = useMemo(() => buildCalendarGrid(year, month), []);
  const weekdaysKo = ["일", "월", "화", "수", "목", "금", "토"];

  const { days, hours, minutes, seconds } = useMemo(
    () => diffParts(weddingDate, now),
    [weddingDate, now]
  );

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.55 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) {
      setStep(0);
      return;
    }

    setStep(1);

    const t1 = window.setTimeout(() => setStep(2), 650);
    const t2 = window.setTimeout(() => setStep(3), 1300);
    const t3 = window.setTimeout(() => setStep(4), 2050);
    const t4 = window.setTimeout(() => setStep(5), 3000);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearTimeout(t4);
    };
  }, [inView]);

  useEffect(() => {
    if (step !== 5) return;
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, [step]);

  const titleLogoSrc: string | null = null;
  const titleText = "WEDDING DAY";

  // 배경: 인트로만 그린 / 본문은 화이트
  const bgClass = step >= 1 && step < 5 ? "bg-emerald-200" : "bg-white";

  return (
    <Section className="p-0">
      <div
        ref={rootRef}
        className={[
          "relative w-screen min-h-screen overflow-hidden",
          "transition-colors duration-1000",
          bgClass,
        ].join(" ")}
      >
        {/* 인트로 */}
        <div
          className={[
            "absolute inset-0 flex items-center justify-center pointer-events-none",
            "transition-opacity duration-900",
            step >= 1 && step < 5 ? "opacity-100" : "opacity-0",
          ].join(" ")}
        >
          <div className="text-center">
            <div
              className={[
                "text-sm tracking-[0.35em] text-neutral-800",
                "transition-all duration-800 ease-out",
                step >= 4 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
              ].join(" ")}
            >
              SAT&nbsp;&nbsp;&nbsp;PM 13:20
            </div>

            <div className="mt-4 flex items-baseline justify-center gap-2">
              <DropText active={step >= 1} className="text-4xl font-semibold tracking-[0.06em] text-neutral-900">
                {year}.
              </DropText>
              <DropText active={step >= 2} className="text-4xl font-semibold tracking-[0.06em] text-neutral-900">
                {pad2(month)}.
              </DropText>
              <DropText active={step >= 3} className="text-4xl font-semibold tracking-[0.06em] text-neutral-900">
                {pad2(day)}
              </DropText>
            </div>
          </div>
        </div>

        {/* 본문 */}
        <div
          className={[
            "relative min-h-screen flex flex-col items-center justify-center",
            "transition-all duration-1100 ease-out",
            step === 5 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
          ].join(" ")}
        >
          <div className="w-full max-w-md px-5 text-center">
            {/* 타이틀 */}
            <div className="flex justify-center">
              {titleLogoSrc ? (
                <img
                  src={titleLogoSrc}
                  alt="wedding day"
                  className="h-12 w-auto"
                  loading="lazy"
                  draggable={false}
                />
              ) : (
                <div className="text-2xl font-semibold tracking-[0.22em] text-neutral-900">
                  {titleText}
                </div>
              )}
            </div>

            <div className="mt-10 text-sm text-neutral-700">
              2026년 12월 12일 토요일 | 오후 1시 20분
            </div>
            <div className="mt-2 text-sm text-neutral-500">
              Saturday, Dec 12 . 2026 | PM 13:20
            </div>

            {/* 달력 */}
            <div className="mt-12 mx-auto w-full">
              {/* ✅ 2) 스프링만 가로로 꽉 */}
              <div className="mb-4 flex justify-center gap-2">
                {Array.from({ length: 19 }).map((_, i) => (
                  <span
                    key={i}
                    className="inline-block h-2 w-3 rounded-full border border-neutral-300 bg-white"
                  />
                ))}
              </div>

              {/* ✅ 4) 헤더: 2026. 12만 중앙정렬 */}
              <div className="text-sm font-medium text-neutral-900 text-center">
                {year}. {pad2(month)}
              </div>

              {/* 아래 구분선만 유지 */}
              {/* <div className="mt-3 h-px w-full bg-neutral-200" /> */}

              {/* ✅ 4) 요일 한글 */}
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

              {/* ✅ 1) 날짜 셀: 배경색 완전 제거(흰바탕) */}
              <div className="mt-1 grid grid-cols-7 gap-1">
                {cal.cells.map((c, idx) => {
                  const isHit = c.day === day;
                  const textCls = dateTextClass(c.weekday, c.day);

                  return (
                    <div
                      key={idx}
                      className="h-9 rounded-lg flex items-center justify-center text-sm"
                    >
                      <span
                        className={[
                          c.day ? textCls : "text-transparent",
                          // 결혼 날짜만 하이라이트는 유지(원하면 이것도 제거 가능)
                          isHit ? "font-semibold" : "",
                        ].join(" ")}
                      >
                        {c.day ?? "."}
                      </span>

                      {/* 결혼 날짜만 은은한 표시(배경 없이 '링' 느낌) */}
                      {isHit && (
                        <span className="absolute h-8 w-8 rounded-full border border-emerald-400/60" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 아래 구분선 */}
              <div className="mt-3 h-px w-full bg-neutral-200" />
            </div>

            {/* ✅ 3) 카드: 회색 + 그림자 */}
            <div className="mt-10 grid grid-cols-4 gap-3">
              <CountdownCard label="DAYS" value={days} />
              <CountdownCard label="HOURS" value={hours} />
              <CountdownCard label="MINUTES" value={minutes} />
              <CountdownCard label="SECONDS" value={seconds} />
            </div>

            <div className="mt-14 text-sm text-neutral-700">
              정준 ♥ 송희 결혼식이{" "}
              <span className="font-semibold text-neutral-900">{days}</span>일 남았습니다.
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

function DropText({
  active,
  className,
  children,
}: {
  active: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={[
        className ?? "",
        "transition-all duration-800 ease-out",
        active ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-12",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function CountdownCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-neutral-100 p-3 text-center shadow-md">
      <div className="text-[11px] tracking-widest text-neutral-600">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-neutral-900">
        {String(value).padStart(2, "0")}
      </div>
    </div>
  );
}
