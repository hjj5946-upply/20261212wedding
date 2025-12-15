import type { WeddingConfig } from "../config/wedding";
type Props = { data: WeddingConfig };

export function StorySection({ data: _data }: Props) {
  return (
    <section className="px-5 py-12 border-t border-neutral-100">
      <div className="mx-auto max-w-md">
        <h2 className="text-lg font-semibold">Our Story</h2>
        <p className="mt-2 text-sm text-neutral-600">
          (다음 스프린트에서 타임라인으로 확장)
        </p>
      </div>
    </section>
  );
}