import type { WeddingConfig } from "../config/wedding";

type Props = { data: WeddingConfig };

export function HeroSection({ data }: Props) {
  return (
    <section className="px-5 pt-16 pb-12">
      <div className="mx-auto max-w-md text-center">
        <p className="text-sm text-neutral-500">{data.ceremony.dateText}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          {data.couple.groomName} &amp; {data.couple.brideName}
        </h1>
        <p className="mt-4 text-base text-neutral-700">{data.couple.tagline}</p>

        <div className="mt-8 text-xs text-neutral-400">↓ Scroll</div>
      </div>
    </section>
  );
}
