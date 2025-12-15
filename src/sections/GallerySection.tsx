import { useState } from "react";
import type { WeddingConfig } from "../config/wedding";
import { ImageModal } from "../components/ImageModal";
import { Section } from "../components/Section";
import { asset } from "../utils/asset";

type Props = { data: WeddingConfig };

export function GallerySection({ data }: Props) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const opened = openIdx !== null ? data.gallery[openIdx] : null;

  return (
    <Section id="gallery" className="px-5 py-12 border-t border-neutral-100">
      <ImageModal
        open={openIdx !== null}
        title="Gallery"
        src={opened ? asset(opened.src) : ""}
        alt={opened?.alt}
        onClose={() => setOpenIdx(null)}
      />

      <div className="mx-auto max-w-md">
        <h2 className="text-lg font-semibold">Gallery</h2>

        {data.gallery.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-600">
            갤러리 사진을 추가하면 여기에 표시됩니다.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-3 gap-2">
            {data.gallery.map((img, idx) => (
              <button
                key={`${img.src}-${idx}`}
                onClick={() => setOpenIdx(idx)}
                className="aspect-square overflow-hidden rounded-xl border border-neutral-200"
                aria-label={`open image ${idx + 1}`}
              >
                <img
                  src={img.src}
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
