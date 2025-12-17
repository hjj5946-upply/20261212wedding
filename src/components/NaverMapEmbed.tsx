import { useEffect, useRef } from "react";

declare global {
  interface Window {
    navermap_authFailure?: () => void;
    naver?: any;
  }
}

function loadScriptOnce(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src^="https://oapi.map.naver.com/openapi/v3/maps.js"]`) as
      | HTMLScriptElement
      | null;

    if (existing) {
      // 이미 로드된 경우: naver.maps 존재하면 OK
      if (window.naver?.maps) return resolve();
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Naver Maps script")));
      return;
    }

    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Naver Maps script"));
    document.head.appendChild(s);
  });
}

type Props = {
  lat: number;
  lng: number;
  zoom?: number;
};

export function NaverMapEmbed({ lat, lng, zoom = 16 }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const keyId = import.meta.env.VITE_NAVER_MAP_CLIENT_ID as string | undefined;
    if (!keyId || !ref.current) return;

    // 인증 실패 콜백(한 번만 세팅)
    window.navermap_authFailure = () => {
      // 필요하면 UI로 보여주고, 링크로 폴백하는 방식도 가능
      console.error("[NaverMap] auth failure");
    };

    const src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${keyId}`;

    (async () => {
      await loadScriptOnce(src);

      if (!window.naver?.maps) {
        console.error("[NaverMap] naver.maps is not available");
        return;
      }

      const center = new window.naver.maps.LatLng(lat, lng);
      const map = new window.naver.maps.Map(ref.current, { center, zoom });
      new window.naver.maps.Marker({ position: center, map });
    })().catch((e) => console.error(e));
  }, [lat, lng, zoom]);

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      <div ref={ref} className="h-[220px] w-full" />
    </div>
  );
}
