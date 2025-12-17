import { useEffect, useState } from "react";
import { WEDDING } from "../config/wedding";

import { HeroSection } from "../sections/HeroSection";
import { MessageSection } from "../sections/MessageSection";
import { CoupleIntroSection } from "../sections/CoupleIntroSection";
import { StorySection } from "../sections/StorySection";
import { GallerySection } from "../sections/GallerySection";
import { InfoSection } from "../sections/InfoSection";
import { LocationSection } from "../sections/LocationSection";
import { RsvpSection } from "../sections/RsvpSection";
import { FooterSection } from "../sections/FooterSection";

import { FloatingCTA } from "../components/FloatingCTA";
import { Toast } from "../components/Toast";
import { MapSelectModal } from "../components/MapSelectModal";
import { shareOrCopyLink } from "../utils/share";
import { GiftAccountsSection } from "../sections/GiftAccountsSection";
import { GuestbookSection } from "../sections/GuestbookSection";

import { supabase } from "../lib/supabase";
import { BgmFloating } from "../components/BgmFloating";
import { getBgmEnabled, initBgm, playBgm } from "../utils/bgm";

export function Invitation() {
  useEffect(() => {
    if (!getBgmEnabled()) {
      console.log("[BGM] disabled by localStorage. key=bgm_enabled_v1");
      return;
    }
    const a = initBgm();
    let armed = true;

    const tryPlayNow = (e: Event) => {
      const type = e.type;
      const tag = (e.target as HTMLElement)?.tagName;
      console.log(`[BGM] event=${type} target=${tag} armed=${armed} paused=${a.paused}`);

      if (!armed) return;

      const p = playBgm();

      p.then(() => {
        localStorage.setItem("bgm_enabled_v1", "1");
        armed = false;
        setToast({ open: true, msg: "배경음악이 재생되었습니다" });
        cleanup();
      }).catch((err) => {
        console.log("[BGM] play() failed:", err);
      });
    };

    const cleanup = () => {
      document.removeEventListener("pointerdown", tryPlayNow, true);
      document.removeEventListener("touchstart", tryPlayNow, true);
      document.removeEventListener("click", tryPlayNow, true);
      document.removeEventListener("wheel", tryPlayNow, true);
      document.removeEventListener("keydown", tryPlayNow, true);
    };

    document.addEventListener("pointerdown", tryPlayNow, true);
    document.addEventListener("touchstart", tryPlayNow, true);
    document.addEventListener("click", tryPlayNow, true);
    document.addEventListener("wheel", tryPlayNow, true);    
    document.addEventListener("keydown", tryPlayNow, true);  

    return cleanup;
  }, []);


  const data = WEDDING;

  const [mapSelectOpen, setMapSelectOpen] = useState(false);
  const [showCTA, setShowCTA] = useState(false);

  const [toast, setToast] = useState<{ open: boolean; msg: string }>({
    open: false,
    msg: "",
  });

  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setToast({ open: true, msg: "복사했습니다" });
  };

  const onShare = async () => {
    const url = window.location.href;
    const title = `${data.couple.groomName} ♥ ${data.couple.brideName} 결혼식`;
    const text = `${data.ceremony.dateText} | ${data.ceremony.venueName}`;
  
    const result = await shareOrCopyLink({ title, text, url });
  
    if (result === "copied") setToast({ open: true, msg: "링크를 복사했습니다" });
    if (result === "failed") setToast({ open: true, msg: "공유에 실패했습니다" });
  };

  const onOpenMap = () => setMapSelectOpen(true);

  const openMapByType = (type: "naver" | "kakao" | "tmap") => {
    const c = data.ceremony;
    const url =
      type === "naver" ? c.naverMapUrl :
      type === "kakao" ? c.kakaoMapUrl :
      c.tmapUrl;

    window.open(url, "_blank", "noreferrer");
  };

  const submitRsvp = async (payload: {
    status: "attend" | "maybe" | "decline";
    name: string;
    phone?: string;
    count: number;
    memo?: string;
  }) => {
    const { error } = await supabase.from("rsvps").insert({
      ...payload,
      user_agent: navigator.userAgent,
    });
    if (error) throw error;
  };

  useEffect(() => {
    const giftSection = document.getElementById("gift");
    if (!giftSection) return;
  
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const giftTop = giftSection.offsetTop;
  
      setShowCTA(scrollY > giftTop - 200);
    };
  
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="min-h-screen bg-white text-neutral-900 pb-28">
      <BgmFloating />
      
      <Toast
        open={toast.open}
        message={toast.msg}
        onClose={() => setToast({ open: false, msg: "" })}
      />

      <MapSelectModal
        open={mapSelectOpen}
        onClose={() => setMapSelectOpen(false)}
        onSelect={(type) => {
          setMapSelectOpen(false);
          openMapByType(type);
        }}
      />

      {/* 본문 */}
      <HeroSection data={data} onShare={onShare} />
      <MessageSection data={data} />
      <InfoSection data={data} />
      <CoupleIntroSection data={data} />
      <StorySection data={data} />
      <GallerySection data={data} />
      <GiftAccountsSection data={data} onCopy={copyText} />
      <LocationSection data={data} onOpenMap={onOpenMap} onCopy={copyText} />
      <RsvpSection data={data} onToast={(msg) => setToast({ open: true, msg })} onSubmit={submitRsvp} />
      <GuestbookSection onToast={(msg) => setToast({ open: true, msg })} />
      <FooterSection data={data} />

      {/* 플로팅 CTA */}
      <FloatingCTA visible={showCTA} onShare={onShare} onOpenMap={onOpenMap} />
    </main>
  );
}
