import { useState, useEffect } from "react";
import type { WeddingConfig } from "../config/wedding";
import { ShareButton } from "../components/ShareButton";
import { Section } from "../components/Section";

type Props = { data: WeddingConfig; onShare: () => void };

function calculateDday(targetDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // dateISO가 들어와도 날짜 기준으로만 계산(경계 이슈 완화)
  const ymd = targetDate.slice(0, 10); // "YYYY-MM-DD"
  const target = new Date(`${ymd}T00:00:00`);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function HeroSection({ data, onShare }: Props) {
  const [dday, setDday] = useState<number>(calculateDday(data.ceremony.dateISO));

  useEffect(() => {
    setDday(calculateDday(data.ceremony.dateISO));
  }, [data.ceremony.dateISO]);

  const renderDday = () => {
    if (dday === 0) {
      return (
        <div className="inline-flex items-center gap-2 rounded-full border border-wedding-gold-200 bg-wedding-gold-50 px-4 py-2">
          <span className="text-xl">✨</span>
          <span className="text-sm font-semibold text-neutral-900">
            오늘이 그날!
          </span>
        </div>
      );
    }
    if (dday > 0) {
      return (
        <div className="inline-flex items-center gap-2 rounded-full border border-wedding-gray-200 bg-white px-4 py-2">
          <span className="text-sm font-semibold text-neutral-800">D-{dday}</span>
        </div>
      );
    }
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-wedding-gray-200 bg-wedding-ivory-50 px-4 py-2">
        <span className="text-sm text-neutral-500">D+{Math.abs(dday)}</span>
      </div>
    );
  };

  return (
    <Section
      id="hero"
      className="bg-gradient-to-b from-wedding-ivory-50 to-white px-5 pb-12 pt-16"
    >
      <div className="mx-auto max-w-md text-center">
        <div className="mb-4">{renderDday()}</div>

        <p className="text-sm text-neutral-500">{data.ceremony.dateText}</p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight text-neutral-900">
          {data.couple.groomName} &amp; {data.couple.brideName}
        </h1>

        <div className="mx-auto mt-4 h-px w-14 bg-wedding-gold-200" />

        <p className="mt-4 text-base text-neutral-700">{data.couple.tagline}</p>

        <div className="mt-6">
          <ShareButton onClick={onShare} />
        </div>

        <div className="mt-8 text-xs text-neutral-400">↓ Scroll</div>
      </div>
    </Section>
  );
}
