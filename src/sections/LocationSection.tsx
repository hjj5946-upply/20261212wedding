import type { WeddingConfig } from "../config/wedding";
import { Button } from "../components/Button";
import { Section } from "../components/Section";
import { asset } from "../utils/asset";

type Props = { data: WeddingConfig };

export function LocationSection({ data }: Props) {
  const { venueName, venueAddress, naverMapUrl } = data.ceremony;

  const mapImageUrl = asset("images/casa_map.webp");

  return (
    <Section className="px-5 py-12 border-t border-neutral-100">
      <div className="mx-auto max-w-md">
        <h2 className="text-lg font-semibold">Location</h2>

        <a
          href={mapImageUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 block overflow-hidden rounded-2xl border border-neutral-200"
          aria-label="약도 원본 이미지 열기"
        >
          <img src={mapImageUrl} alt="웨딩홀 약도" className="w-full" />
        </a>

        <div className="mt-4 text-sm">
          <div className="font-medium">{venueName}</div>
          <div className="mt-1 text-neutral-600">{venueAddress}</div>
        </div>

        <div className="mt-6">
          <a href={naverMapUrl} target="_blank" rel="noreferrer">
            <Button variant="secondary">네이버 지도에서 보기</Button>
          </a>
        </div>
      </div>
    </Section>
  );
}
