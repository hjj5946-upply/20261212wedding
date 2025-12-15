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
import { AccountSelectModal } from "../components/AccountSelectModal";
import { AccountModal } from "../components/AccountModal";
import { Toast } from "../components/Toast";

export function Invitation() {
  const data = WEDDING;

  const [accountSelectOpen, setAccountSelectOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState<"groom" | "bride" | null>(null);

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

    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
      } else {
        await navigator.clipboard.writeText(url);
        setToast({ open: true, msg: "링크를 복사했습니다" });
      }
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        setToast({ open: true, msg: "링크를 복사했습니다" });
      } catch {
        // ignore
      }
    }
  };

  const onOpenMap = () => {
    window.open(data.ceremony.naverMapUrl, "_blank", "noreferrer");
  };

//   const onOpenAccount = () => {
//     setAccountSelectOpen(true);
//   };

  return (
    <main className="min-h-screen bg-white text-neutral-900 pb-28">
      {/* pb-28: 플로팅 바에 가려지지 않게 하단 여백 */}

      <Toast
        open={toast.open}
        message={toast.msg}
        onClose={() => setToast({ open: false, msg: "" })}
      />

      {/* 계좌 선택 */}
      <AccountSelectModal
        open={accountSelectOpen}
        onClose={() => setAccountSelectOpen(false)}
        onSelect={(type) => {
          setAccountSelectOpen(false);
          setAccountOpen(type);
        }}
      />

      {/* 계좌 상세 */}
      <AccountModal
        open={accountOpen === "groom"}
        title="신랑측 계좌"
        accounts={data.groomAccounts}
        onClose={() => setAccountOpen(null)}
        onCopy={copyText}
      />
      <AccountModal
        open={accountOpen === "bride"}
        title="신부측 계좌"
        accounts={data.brideAccounts}
        onClose={() => setAccountOpen(null)}
        onCopy={copyText}
      />

      {/* 본문 */}
      <HeroSection data={data} />
      <MessageSection data={data} />
      <CoupleIntroSection data={data} />
      <StorySection data={data} />
      <GallerySection data={data} />
      <InfoSection data={data} />
      <LocationSection data={data} />
      <RsvpSection data={data} />
      <FooterSection data={data} />

      {/* 플로팅 CTA */}
      <FloatingCTA onShare={onShare} onOpenMap={onOpenMap} />
    </main>
  );
}
