import type { WeddingConfig } from "../config/wedding";
import { Section } from "../components/Section";
import { SectionHeader } from "../components/SectionHeader";

type Props = { data: WeddingConfig };

export function InfoSection({ data }: Props) {
  return (
    <Section id="info" className="px-5 py-12 border-t border-neutral-100">
      <div className="mx-auto max-w-md">
        <SectionHeader title={data.copy.infoTitle} />

        <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm">
          <div className="text-neutral-700">{data.ceremony.dateText}</div>
          <div className="mt-2 font-medium text-neutral-900">{data.ceremony.venueName}</div>
          <div className="mt-1 text-neutral-600">{data.ceremony.venueAddress}</div>
          {data.ceremony.venueDetail ? (
            <div className="mt-1 text-neutral-600">{data.ceremony.venueDetail}</div>
          ) : null}
        </div>
      </div>
    </Section>
  );
}
