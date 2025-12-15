import type { WeddingConfig } from "../config/wedding";
import { ShareButton } from "../components/ShareButton";
import { Section } from "../components/Section";

type Props = { data: WeddingConfig };

export function HeroSection({ data }: Props) {
  const shareUrl = data.site?.baseUrl ?? window.location.origin;

  return (
    <Section id="hero" className="px-5 pt-16 pb-12">
      <div className="mx-auto max-w-md text-center">
        <p className="text-sm text-neutral-500">{data.ceremony.dateText}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
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
