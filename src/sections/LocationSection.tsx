import type { WeddingConfig } from "../config/wedding";
type Props = { data: WeddingConfig };

export function LocationSection({ data }: Props) {
  return (
    <section className="px-5 py-12 border-t border-neutral-100">
      <div className="mx-auto max-w-md">
        <h2 className="text-lg font-semibold">Location</h2>
        <p className="mt-2 text-sm text-neutral-600">
          (다음 스프린트에서 길찾기 버튼/지도 추가)
        </p>
        <div className="mt-4 rounded-2xl border border-neutral-200 p-4 text-sm">
          <div className="font-medium">{data.ceremony.venueName}</div>
          <div className="mt-1 text-neutral-600">{data.ceremony.venueAddress}</div>
        </div>
      </div>
    </section>
  );
}
