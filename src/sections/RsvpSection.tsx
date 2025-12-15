import type { WeddingConfig } from "../config/wedding";
type Props = { data: WeddingConfig };

export function RsvpSection({}: Props) {
  return (
    <section className="px-5 py-12 border-t border-neutral-100">
      <div className="mx-auto max-w-md">
        <h2 className="text-lg font-semibold">RSVP</h2>
        <p className="mt-2 text-sm text-neutral-600">
          (Sprint 3에서 저장 방식 결정 후 구현)
        </p>
      </div>
    </section>
  );
}
