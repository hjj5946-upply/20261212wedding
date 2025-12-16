import type { WeddingConfig, CoupleInfo } from "../config/wedding";
import { Section } from "../components/Section";
import { SectionHeader } from "../components/SectionHeader";

type Props = { data: WeddingConfig };

function InfoRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 text-sm">
      <span className="min-w-[64px] text-wedding-gold-300 font-semibold">
        {label}
      </span>
      <span className="text-neutral-700">{value}</span>
    </div>
  );
}

function CoupleCard({ info }: { info: CoupleInfo }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-neutral-900">{info.name}</h3>
        <p className="mt-1 text-xs text-neutral-500">{info.role}</p>
        <div className="mx-auto mt-4 h-px w-12 bg-wedding-gold-200" />
      </div>

      {info.introduction ? (
        <p className="mt-4 text-sm leading-6 text-neutral-700 text-center">
          {info.introduction}
        </p>
      ) : null}

      <div className="mt-5 space-y-3">
        <InfoRow label="MBTI" value={info.mbti} />
        <InfoRow label="취미" value={info.hobby} />
        <InfoRow label="좋아하는 것" value={info.favorite} />
      </div>
    </div>
  );
}

export function CoupleIntroSection({ data }: Props) {
  if (!data.groomInfo && !data.brideInfo) return null;

  return (
    <Section id="couple" className="px-5 py-12 border-t border-neutral-100">
      <div className="mx-auto max-w-md">
        <SectionHeader title="우리를 소개합니다" subtitle="Get to know us" />

        <div className="grid gap-4 md:grid-cols-2">
          {data.groomInfo ? <CoupleCard info={data.groomInfo} /> : null}
          {data.brideInfo ? <CoupleCard info={data.brideInfo} /> : null}
        </div>
      </div>
    </Section>
  );
}
