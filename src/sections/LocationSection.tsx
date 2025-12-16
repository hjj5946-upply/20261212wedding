import type { WeddingConfig } from "../config/wedding";
import { Button } from "../components/Button";
import { Section } from "../components/Section";
import { SectionHeader } from "../components/SectionHeader";
import { asset } from "../utils/asset";

type Props = {
  data: WeddingConfig;
  onOpenMap: () => void;
  onCopy: (text: string) => void;
};

export function LocationSection({ data, onOpenMap, onCopy }: Props) {
  const { venueName, venueAddress } = data.ceremony;
  const mapImageUrl = asset("images/casa_map.webp");

  return (
    <Section id="location" className="px-5 py-12 border-t border-neutral-100">
      <div className="mx-auto max-w-md">
        <SectionHeader title={data.copy.locationTitle} />

        <a
          href={mapImageUrl}
          target="_blank"
          rel="noreferrer"
          className="block overflow-hidden rounded-2xl border border-neutral-200 bg-white"
          aria-label="약도 원본 이미지 열기"
        >
          <img src={mapImageUrl} alt="웨딩홀 약도" className="w-full" />
        </a>

        <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4 text-sm">
          <div className="font-medium text-neutral-900">{venueName}</div>
          <div className="mt-1 text-neutral-600">{venueAddress}</div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button variant="secondary" fullWidth onClick={onOpenMap}>
            길찾기
          </Button>
          <Button variant="secondary" fullWidth onClick={() => onCopy(venueAddress)}>
            주소 복사
          </Button>
        </div>
      </div>
    </Section>
  );
}
