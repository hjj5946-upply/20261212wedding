import type { WeddingConfig, CoupleInfo } from "../config/wedding";
import { Section } from "../components/Section";

type Props = { data: WeddingConfig };

function InfoRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2 text-xs">
      <span className="min-w-[56px] shrink-0 text-wedding-gold-300 font-semibold">
        {label}
      </span>
      <span className="text-neutral-700 whitespace-pre-line break-words">
        {value}
      </span>
    </div>
  );
}

function PhotoCard({
  info,
  sideLabel,
}: {
  info: CoupleInfo;
  sideLabel: "신랑" | "신부";
}) {
  return (
    <div className="h-full overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      {/* 사진 */}
      <div className="px-4 pt-4">
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-neutral-100">
          {info.photoUrl ? (
            <img
              src={info.photoUrl}
              alt={`${sideLabel} ${info.name}`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">
              사진을 추가해주세요
            </div>
          )}
        </div>
      </div>

      {/* 정보 */}
      <div className="px-4 py-4">
        <div className="text-center">
          <div className="text-base font-semibold text-neutral-900">
            {sideLabel} {info.name}
          </div>
          {info.role ? (
            <div className="mt-1 text-[11px] text-neutral-500">{info.role}</div>
          ) : null}
          <div className="mx-auto mt-3 h-px w-10 bg-wedding-gold-200" />
        </div>

        {info.introduction ? (
          <p className="mt-3 text-center text-xs leading-6 text-neutral-700 whitespace-pre-line break-words">
            {info.introduction}
          </p>
        ) : null}

        <div className="mt-4 space-y-2">
          <InfoRow label="MBTI" value={info.mbti} />
          <InfoRow label="취미" value={info.hobby} />
          <InfoRow label="좋아하는 것" value={info.favorite} />
        </div>
      </div>
    </div>
  );
}

// ✅ 이 이름이 Invitation.tsx에서 import 하는 이름과 정확히 같아야 함
export function CoupleIntroSection({ data }: Props) {
  if (!data.groomInfo && !data.brideInfo) return null;

  return (
    <Section
      id="couple"
      className="px-5 py-12 border-t border-neutral-100 bg-neutral-100"
    >
      <div className="mx-auto max-w-3xl">
        {/* 중앙 제목 */}
        <div className="text-center">
          {/* <img src="/about-us-logo.svg" alt="ABOUT US" className="mx-auto h-8" /> */}
          <div className="text-[13px] font-semibold tracking-[0.22em] text-neutral-800">
            ABOUT US
          </div>
          <div className="mt-2 text-sm font-semibold text-neutral-600">
            저희를 소개합니다
          </div>
          <div className="mx-auto mt-4 h-px w-12 bg-wedding-gold-200" />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 md:gap-4 items-stretch">
          {data.groomInfo ? (
            <PhotoCard info={data.groomInfo} sideLabel="신랑" />
          ) : (
            <div className="rounded-2xl border border-dashed border-neutral-200 bg-white" />
          )}

          {data.brideInfo ? (
            <PhotoCard info={data.brideInfo} sideLabel="신부" />
          ) : (
            <div className="rounded-2xl border border-dashed border-neutral-200 bg-white" />
          )}
        </div>
      </div>
    </Section>
  );
}
