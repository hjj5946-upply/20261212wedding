import type { WeddingConfig, CoupleInfo } from "../config/wedding";
import { Section } from "../components/Section";

type Props = { data: WeddingConfig };

function CoupleCard({ info, side }: { info: CoupleInfo; side: "left" | "right" }) {
  return (
    <div
      className={`bg-white rounded-2xl p-6 shadow-md border-2 ${
        side === "left" ? "border-wedding-pink-200" : "border-wedding-peach-200"
      } hover:shadow-lg transition-all`}
    >
      <div className="text-center mb-4">
        <h3 className="text-2xl font-bold text-neutral-800">{info.name}</h3>
        <p className="text-sm text-neutral-500">{info.role}</p>
      </div>

      {info.introduction && (
        <p className="text-sm text-neutral-600 text-center mb-4 italic">
          "{info.introduction}"
        </p>
      )}

      <div className="space-y-3 text-sm">
        {info.mbti && (
          <div className="flex items-start gap-2">
            <span className="text-wedding-pink-500 font-semibold min-w-[60px]">MBTI</span>
            <span className="text-neutral-700">{info.mbti}</span>
          </div>
        )}
        {info.hobby && (
          <div className="flex items-start gap-2">
            <span className="text-wedding-pink-500 font-semibold min-w-[60px]">취미</span>
            <span className="text-neutral-700">{info.hobby}</span>
          </div>
        )}
        {info.favorite && (
          <div className="flex items-start gap-2">
            <span className="text-wedding-pink-500 font-semibold min-w-[60px]">좋아하는 것</span>
            <span className="text-neutral-700">{info.favorite}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function CoupleIntroSection({ data }: Props) {
  if (!data.groomInfo && !data.brideInfo) {
    return null;
  }

  return (
    <Section className="px-5 py-16 bg-gradient-to-b from-wedding-cream-50 to-white">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-800">우리를 소개합니다</h2>
          <p className="mt-2 text-sm text-neutral-500">Get to know us</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {data.groomInfo && <CoupleCard info={data.groomInfo} side="left" />}
          {data.brideInfo && <CoupleCard info={data.brideInfo} side="right" />}
        </div>
      </div>
    </Section>
  );
}
