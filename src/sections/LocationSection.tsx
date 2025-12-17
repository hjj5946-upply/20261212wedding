import { useEffect, useMemo, useRef } from "react";
import type { WeddingConfig } from "../config/wedding";
import { Button } from "../components/Button";
import { Section } from "../components/Section";
// import { SectionHeader } from "../components/SectionHeader";
// import { asset } from "../utils/asset";

type Props = {
  data: WeddingConfig;
  onOpenMap: () => void;
  onCopy: (text: string) => void;
};

function loadScriptOnce(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(
      `script[src^="https://oapi.map.naver.com/openapi/v3/maps.js"]`
    ) as HTMLScriptElement | null;

    if (existing) {
      if ((existing as any)._loaded) return resolve();
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Naver Maps script")));
      return;
    }

    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.defer = true;
    (s as any)._loaded = false;
    s.onload = () => {
      (s as any)._loaded = true;
      resolve();
    };
    s.onerror = () => reject(new Error("Failed to load Naver Maps script"));
    document.head.appendChild(s);
  });
}

// 네이버 지도 렌더 (좌표 없으면 fallback 링크 카드로 대체)
function NaverMap({
  title,
  address,
  lat,
  lng,
}: {
  title: string;
  address: string;
  lat?: number;
  lng?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  const naverSearchUrl = useMemo(() => {
    const q = encodeURIComponent(`${title}`.trim());
    return `https://map.naver.com/v5/search/${q}`;
  }, [title]);

  useEffect(() => {
    (window as any).navermap_authFailure = () => {
      console.error("[NaverMap] Open API 인증 실패");
    };

    // 좌표가 없으면 지도 SDK 로딩/렌더 불가 -> 링크 카드로 처리
    if (!lat || !lng) return;

    const clientId = import.meta.env.VITE_NAVER_MAP_CLIENT_ID as string | undefined;
    if (!clientId) return;

    const src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`;

    (async () => {
      try {
        await loadScriptOnce(src);
        const w = window as any;
        if (!w.naver?.maps || !ref.current) return;

        const center = new w.naver.maps.LatLng(lat, lng);
        const map = new w.naver.maps.Map(ref.current, {
          center,
          zoom: 16,
        });

        new w.naver.maps.Marker({
          position: center,
          map,
        });
      } catch {
        // 실패 시 그냥 fallback 링크 UI만 남김(아래 렌더에서 처리)
      }
    })();
  }, [lat, lng]);

  // 1) 좌표 없음 or 2) clientId 없음 => 네이버지도 링크 카드
  const clientId = (import.meta.env.VITE_NAVER_MAP_CLIENT_ID as string | undefined) || "";
  if (!lat || !lng || !clientId) {
    return (
      <a
        href={naverSearchUrl}
        target="_blank"
        rel="noreferrer"
        className="block px-4 py-3 border-t border-neutral-100"
      >
        <div className="text-sm font-semibold text-neutral-900">{title}</div>
        <div className="mt-1 text-xs text-neutral-600">{address}</div>
      </a>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      <div ref={ref} className="h-[220px] w-full" />
      <a
        href={naverSearchUrl}
        target="_blank"
        rel="noreferrer"
        className="block px-4 py-3 border-t border-neutral-100"
      >
        <div className="text-sm font-semibold text-neutral-900">{title}</div>
        <div className="mt-1 text-xs text-neutral-600">{address}</div>
      </a>
    </div>
  );
}

export function LocationSection({ data, onOpenMap, onCopy }: Props) {
  const { venueName, venueAddress } = data.ceremony as any;

  // 가능하면 config에 좌표를 넣어두는 걸 추천 (없으면 검색 링크로 fallback)
  const venueLat = (data.ceremony as any).venueLat as number | undefined;
  const venueLng = (data.ceremony as any).venueLng as number | undefined;

  // const mapImageUrl = asset("images/casa_map.webp");

  return (
    <Section id="location" className="px-5 py-12 border-t border-neutral-100">
      <div className="mx-auto max-w-md">
        {/* 헤더: Location + 오시는 길 (중앙) */}
        <div className="text-center">
          <div className="text-xs tracking-wide text-neutral-400">Location</div>
          <h2 className="mt-1 text-lg font-semibold text-neutral-900">오시는 길</h2>
        </div>

        {/* 기존 약도 이미지: 주석 처리 */}
        {/*
        <a
          href={mapImageUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-6 block overflow-hidden rounded-2xl border border-neutral-200 bg-white"
          aria-label="약도 원본 이미지 열기"
        >
          <img src={mapImageUrl} alt="웨딩홀 약도" className="w-full" />
        </a>
        */}

        {/* 네이버 지도 */}
        <div className="mt-6">
          <NaverMap title={venueName} address={venueAddress} lat={venueLat} lng={venueLng} />
        </div>

        {/* <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4 text-sm">
          <div className="font-medium text-neutral-900">{venueName}</div>
          <div className="mt-1 text-neutral-600">{venueAddress}</div>
        </div> */}

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

export function NaverMapEmbed({ lat, lng }: { lat: number; lng: number }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const clientId = import.meta.env.VITE_NAVER_MAP_CLIENT_ID as string | undefined;
    if (!clientId || !ref.current) return;

    const src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`;

    (async () => {
      await loadScriptOnce(src);
      const w = window as any;

      const center = new w.naver.maps.LatLng(lat, lng);
      const map = new w.naver.maps.Map(ref.current, { center, zoom: 16 });
      new w.naver.maps.Marker({ position: center, map });
    })().catch(console.error);
  }, [lat, lng]);

  return <div ref={ref} className="h-[220px] w-full rounded-2xl border border-neutral-200 bg-white" />;
}