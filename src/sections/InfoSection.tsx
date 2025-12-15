import type { WeddingConfig } from "../config/wedding";
type Props = { data: WeddingConfig };

export function InfoSection({ data }: Props) {
  return (
    <section className="px-5 py-12 border-t border-neutral-100">
      <div className="mx-auto max-w-md">
        <h2 className="text-lg font-semibold">Wedding Info</h2>
        <div className="mt-4 space-y-2 text-sm text-neutral-700">
          <div>{data.ceremony.dateText}</div>
          <div className="font-medium">{data.ceremony.venueName}</div>
          <div className="text-neutral-600">{data.ceremony.venueAddress}</div>
          {data.ceremony.venueDetail ? (
            <div className="text-neutral-600">{data.ceremony.venueDetail}</div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
