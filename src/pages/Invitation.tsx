import { useState } from "react";
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


export function Invitation() {
  const data = WEDDING;

  const [mapSelectOpen, setMapSelectOpen] = useState(false);

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

  return (
    <main className="min-h-screen bg-white text-neutral-900 pb-28">

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
      />s

      {/* 본문 */}
      <HeroSection data={data} onShare={onShare} />
      <MessageSection data={data} />
      <CoupleIntroSection data={data} />
      <StorySection data={data} />
      <GallerySection data={data} />
      <InfoSection data={data} />
      <GiftAccountsSection data={data} onCopy={copyText} />
      <LocationSection data={data} onOpenMap={onOpenMap} onCopy={copyText} />
      <RsvpSection data={data} onToast={(msg) => setToast({ open: true, msg })} onSubmit={submitRsvp} />
      <GuestbookSection onToast={(msg) => setToast({ open: true, msg })} />
      <FooterSection data={data} />

      {/* 플로팅 CTA */}
      <FloatingCTA onShare={onShare} onOpenMap={onOpenMap} />
    </main>
  );
}
