import { useState } from "react";
import type { WeddingConfig } from "../config/wedding";
import { ShareButton } from "../components/ShareButton";
import { Section } from "../components/Section";

type Props = { data: WeddingConfig };

function calculateDday(targetDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

export function HeroSection({ data }: Props) {
  const shareUrl = data.site?.baseUrl ?? window.location.origin;
  const [dday] = useState<number>(() => calculateDday(data.ceremony.dateISO));

  const renderDday = () => {
    if (dday === 0) {
      return (
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-wedding-pink-100 to-wedding-peach-100 rounded-full">
          <span className="text-2xl">💕</span>
          <span className="text-lg font-bold text-wedding-pink-600">오늘이 그날!</span>
        </div>
      );
    } else if (dday > 0) {
      return (
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-wedding-cream-100 to-wedding-peach-50 rounded-full">
          <span className="text-sm font-medium text-wedding-pink-600">D-{dday}</span>
        </div>
      );
    } else {
      return (
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 rounded-full">
          <span className="text-sm text-neutral-500">D+{Math.abs(dday)}</span>
        </div>
      );
    }
  };

  return (
    <Section id="hero" className="px-5 pt-16 pb-12 bg-gradient-to-b from-wedding-cream-50 to-white">
      <div className="mx-auto max-w-md text-center">
        {/* D-day 카운터 */}
        <div className="mb-4 animate-pulse">
          {renderDday()}
        </div>

        <p className="text-sm text-neutral-500">{data.ceremony.dateText}</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight bg-gradient-to-r from-wedding-pink-500 to-wedding-peach-400 bg-clip-text text-transparent">
          {data.couple.groomName} &amp; {data.couple.brideName}
        </h1>
        <p className="mt-4 text-base text-neutral-700">{data.couple.tagline}</p>

        <div className="mt-6">
          <ShareButton
            title={`${data.couple.groomName} ♥ ${data.couple.brideName} 결혼식`}
            text={`${data.ceremony.dateText} | ${data.ceremony.venueName}`}
            url={shareUrl}
          />
        </div>

        <div className="mt-8 text-xs text-neutral-400">↓ Scroll</div>
      </div>
    </Section>
  );
}
