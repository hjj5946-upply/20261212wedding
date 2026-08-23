import { useCallback, useEffect, useState } from "react";
import { WEDDING } from "../config/wedding";
import { HeroSection } from "../sections/HeroSection";
import { MessageSection } from "../sections/MessageSection";
import { CoupleIntroSection } from "../sections/CoupleIntroSection";
import { StorySection } from "../sections/StorySection";
import { GallerySection } from "../sections/GallerySection";
import { InfoSection } from "../sections/InfoSection";
import { LocationSection } from "../sections/LocationSection";
import { FooterSection } from "../sections/FooterSection";
import { FloatingCTA } from "../components/FloatingCTA";
import { Toast } from "../components/Toast";
import { MapSelectModal } from "../components/MapSelectModal";
import { GiftAccountsSection } from "../sections/GiftAccountsSection";
// 방명록 일시 비활성화 (되살리려면 이 import + onGuestbookToast + JSX 3곳 주석 해제)
// import { GuestbookSection } from "../sections/GuestbookSection";
// import { supabase } from "../lib/supabase";
import { BgmFloating } from "../components/BgmFloating";
import { getBgmEnabled, initBgm, isBgmPlaying, playBgm } from "../utils/bgm";
import { buildMapLinks, openDeepLinkOrFallback } from "../utils/mapNavigation";

export function Invitation() {
  const [fadeIn, setFadeIn] = useState(false);
  const [mapSelectOpen, setMapSelectOpen] = useState(false);
  const [showCTA, setShowCTA] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; msg: string }>({ open: false, msg: "" });

  const data = WEDDING;

  // ✅ 콜백을 렌더마다 새로 만들지 않는다.
  //    (하위 섹션의 memo가 실제로 동작하고, Toast의 자동 닫힘 타이머도 리셋되지 않음)
  const handleNavigate = (type: "naver" | "kakao" | "tmap") => {
    const { venueLat, venueLng, venueName } = data.ceremony;
    const { deep, web } = buildMapLinks(type, venueLat!, venueLng!, venueName);
    openDeepLinkOrFallback(type, deep, web);
  };

  const copyText = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text);
    setToast({ open: true, msg: "복사했습니다" });
  }, []);

  const onShare = useCallback(async () => {
    const url = window.location.href;
    const title = document.title || "모바일 청첩장";
    const text = "소중한 분들을 초대합니다.";

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        return;
      }
    }

    await navigator.clipboard.writeText(url);
    setToast({ open: true, msg: "링크가 복사되었습니다." });
  }, []);

  const onOpenMap = useCallback(() => setMapSelectOpen(true), []);
  const onCloseToast = useCallback(() => setToast({ open: false, msg: "" }), []);
  // 방명록 일시 비활성화
  // const onGuestbookToast = useCallback(
  //   (msg: string) => setToast({ open: true, msg }),
  //   []
  // );

  // const submitRsvp = async (payload: {
  //   status: "attend" | "maybe" | "decline";
  //   name: string;
  //   phone?: string;
  //   count: number;
  //   memo?: string;
  // }) => {
  //   const { error } = await supabase.from("rsvps").insert({
  //     ...payload,
  //     user_agent: navigator.userAgent,
  //   });
  //   if (error) throw error;
  // };

  useEffect(() => {
    const timer = setTimeout(() => setFadeIn(true), 200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!getBgmEnabled()) return;
    if (isBgmPlaying()) {
      setToast({ open: true, msg: "배경음악이 재생되었습니다" });
      return;
    }

    initBgm();
    let armed = true;

    const tryPlayNow = (_: Event) => {
      if (!armed) return;
      if (isBgmPlaying()) {
        armed = false;
        cleanup();
        return;
      }

      playBgm()
        .then(() => {
          localStorage.setItem("bgm_enabled_v1", "1");
          armed = false;
          setToast({ open: true, msg: "배경음악이 재생되었습니다" });
          cleanup();
        })
        .catch(
          () => {

          });
    };

    const cleanup = () => {
      document.removeEventListener("click", tryPlayNow, true);
      document.removeEventListener("touchend", tryPlayNow, true);
    };

    document.addEventListener("click", tryPlayNow, true);
    document.addEventListener("touchend", tryPlayNow, true);

    return cleanup;
  }, []);

  // 플로팅 CTA: "마음 전하는 곳" 섹션부터 노출.
  // 기존 구현은 스크롤 이벤트마다 offsetTop을 읽어(= 강제 레이아웃 계산) 스크롤을
  // 무겁게 만들었다. 임계값은 캐시하고, 리스너는 passive + rAF 스로틀로 바꾼다.
  useEffect(() => {
    const giftSection = document.getElementById("gift");
    if (!giftSection) return;

    let threshold = giftSection.offsetTop - 200;
    let raf = 0;

    const update = () => {
      raf = 0;
      setShowCTA(window.scrollY > threshold);
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };

    // 이미지 로드/폰트 적용으로 섹션 위치가 밀리면 임계값을 다시 잰다
    const ro = new ResizeObserver(() => {
      threshold = giftSection.offsetTop - 200;
      onScroll();
    });
    ro.observe(document.body);

    update();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <BgmFloating />

      <Toast
        open={toast.open}
        message={toast.msg}
        onClose={onCloseToast}
      />

      <MapSelectModal
        open={mapSelectOpen}
        onClose={() => setMapSelectOpen(false)}
        onNavigate={(type) => {
          setMapSelectOpen(false);
          handleNavigate(type);
        }}
      />

      <FloatingCTA visible={showCTA} onShare={onShare} onOpenMap={onOpenMap} />

      <main
        className={[
          "min-h-screen bg-white text-neutral-900 pb-28",
          "transition-opacity",
          fadeIn ? "opacity-100" : "opacity-0",
        ].join(" ")}
        style={{
          transitionDuration: "2500ms",
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <HeroSection data={data} onShare={onShare} />
        <MessageSection data={data} />
        <InfoSection data={data} />
        <CoupleIntroSection data={data} />
        <StorySection data={data} />
        <GallerySection />
        <GiftAccountsSection data={data} onCopy={copyText} />
        <LocationSection data={data} onOpenMap={onOpenMap} onCopy={copyText} />
        {/* <RsvpSection
          onToast={(msg) => setToast({ open: true, msg })}
          onSubmit={submitRsvp}
        /> */}
        {/* 방명록 일시 비활성화 */}
        {/* <GuestbookSection onToast={onGuestbookToast} /> */}
        <FooterSection />
      </main>
    </>
  );
}