import { useState } from "react";
import type { WeddingConfig } from "../config/wedding";
import { ImageModal } from "../components/ImageModal";
import { Section } from "../components/Section";
import { SectionHeader } from "../components/SectionHeader";
import { asset } from "../utils/asset";

type Props = { data: WeddingConfig };

export function GallerySection({ data }: Props) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const opened = openIdx !== null ? data.gallery[openIdx] : null;

  return (
    <Section id="gallery" className="px-5 py-12 border-t border-neutral-100">
      <ImageModal
        open={openIdx !== null}
        title={data.copy.galleryTitle}
        src={opened ? asset(opened.src) : ""}
        alt={opened?.alt}
        onClose={() => setOpenIdx(null)}
      />

      <div className="mx-auto max-w-md">
        <SectionHeader title={data.copy.galleryTitle} />

        {data.gallery.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 text-sm text-neutral-600">
            갤러리 사진을 추가하면 여기에 표시됩니다.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {data.gallery.map((img, idx) => (
              <button
                key={`${img.src}-${idx}`}
                onClick={() => setOpenIdx(idx)}
                className="aspect-square overflow-hidden rounded-2xl border border-neutral-200 bg-wedding-ivory-50"
                aria-label={`open image ${idx + 1}`}
                type="button"
              >
                <img
                  src={asset(img.src)}
                  alt={img.alt ?? `gallery-${idx + 1}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}
