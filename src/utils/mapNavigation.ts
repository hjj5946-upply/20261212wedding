export type MapType = "naver" | "kakao" | "tmap";

export function buildMapLinks(type: MapType, lat: number, lng: number, name: string) {
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

/**
 * 앱 설치되어 있으면 앱 열리고,
 * 미설치/차단이면 웹으로 폴백.
 */
export function openDeepLinkOrFallback(type: MapType, deepLink: string, fallbackUrl: string) {
  const ua = navigator.userAgent;
  const isMobile = /Android|iPhone|iPad|iPod/i.test(ua);

  // PC는 웹
  if (!isMobile) {
    window.open(fallbackUrl, "_blank", "noreferrer");
    return;
  }

  // ✅ 카카오는 미설치 시 "아무 반응"이 많이 나서 웹을 즉시 여는 게 UX가 제일 안정적
  if (type === "kakao") {
    window.open(fallbackUrl, "_blank", "noreferrer");
    return;
  }

  const start = Date.now();

  // 딥링크 시도 (같은 탭)
  window.location.href = deepLink;

  // 일정 시간 후에도 페이지가 그대로면 웹으로 폴백
  setTimeout(() => {
    // 앱으로 전환되면 보통 JS가 멈추거나, visibility가 바뀜.
    // 여기까지 실행되고 있으면 폴백 처리.
    if (Date.now() - start >= 900) {
      window.location.href = fallbackUrl;
    }
  }, 900);
}
