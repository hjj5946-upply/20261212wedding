// src/utils/mapNavigation.ts
export function buildMapLinks(
    type: "naver" | "kakao" | "tmap",
    lat: number,
    lng: number,
    name: string
  ) {
    const encName = encodeURIComponent(name);
  
    if (type === "naver") {
      return {
        deep: `nmap://place?lat=${lat}&lng=${lng}&name=${encName}`,
        web: `https://map.naver.com/v5/search/${encodeURIComponent(name)}`,
      };
    }
  
    if (type === "kakao") {
      return {
        deep: `kakaomap://look?p=${lat},${lng}`,
        web: `https://map.kakao.com/link/map/${encName},${lat},${lng}`,
      };
    }
  
    return {
      deep: `tmap://route?goalx=${lng}&goaly=${lat}&goalname=${encName}`,
      web: `https://www.tmap.co.kr`,
    };
  }
  
  export function openDeepLinkOrFallback(deepLink: string, fallbackUrl: string) {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  
    if (!isMobile) {
      window.open(fallbackUrl, "_blank", "noreferrer");
      return;
    }
  
    const start = Date.now();
    window.location.href = deepLink;
  
    setTimeout(() => {
      // 앱으로 전환되면 JS가 멈추는 경우가 많음
      if (Date.now() - start < 1200) return;
      window.location.href = fallbackUrl;
    }, 1000);
  }
  