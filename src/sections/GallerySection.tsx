import type { WeddingConfig } from "../config/wedding";
type Props = { data: WeddingConfig };

export function GallerySection({ data }: Props) {
  return (
    <section className="px-5 py-12 border-t border-neutral-100">
      <div className="mx-auto max-w-md">
        <h2 className="text-lg font-semibold">Gallery</h2>
        <p className="mt-2 text-sm text-neutral-600">
          이미지 {data.gallery.length}장 (모달은 Sprint 2)
        </p>
      </div>
    </section>
  );
}
