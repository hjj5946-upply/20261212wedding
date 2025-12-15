import { useState } from "react";
import type { WeddingConfig } from "../config/wedding";
import { Button } from "../components/Button";
import { Toast } from "../components/Toast";
import { AccountModal } from "../components/AccountModal";
import { Section } from "../components/Section";

type Props = { data: WeddingConfig };

export function InfoSection({ data }: Props) {
  const [toast, setToast] = useState<{ open: boolean; msg: string }>({
    open: false,
    msg: "",
  });

  const [accountOpen, setAccountOpen] = useState<"groom" | "bride" | null>(null);

  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setToast({ open: true, msg: "복사했습니다" });
  };

  return (
    <Section id="info" className="px-5 py-12 border-t border-neutral-100">
      <Toast
        open={toast.open}
        message={toast.msg}
        onClose={() => setToast({ open: false, msg: "" })}
      />

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

      <div className="mx-auto max-w-md">
        {/* ✅ 타이틀 수정 */}
        <h2 className="text-lg font-semibold">{data.copy.infoTitle}</h2>

        {/* 예식 정보 */}
        <div className="mt-4 space-y-2 text-sm text-neutral-700">
          <div>{data.ceremony.dateText}</div>
          <div className="font-medium">{data.ceremony.venueName}</div>
          <div className="text-neutral-600">{data.ceremony.venueAddress}</div>
          {data.ceremony.venueDetail ? (
            <div className="text-neutral-600">{data.ceremony.venueDetail}</div>
          ) : null}
        </div>

        {/* 연락 */}
        <div className="mt-8 space-y-3">
          {data.contacts.groomPhone ? (
            <a href={`tel:${data.contacts.groomPhone}`}>
              <Button variant="secondary">신랑에게 전화</Button>
            </a>
          ) : null}

          {data.contacts.bridePhone ? (
            <a href={`tel:${data.contacts.bridePhone}`}>
              <Button variant="secondary">신부에게 전화</Button>
            </a>
          ) : null}
        </div>

        {/* ✅ 마음 전하실 곳(톤 다운) */}
        <div className="mt-10 rounded-2xl border border-neutral-200 p-4">
          <div className="text-sm font-semibold">{data.copy.giftTitle}</div>
          <div className="mt-1 text-xs text-neutral-500">{data.copy.giftNotice}</div>

          <div className="mt-4 space-y-2">
            <Button variant="secondary" onClick={() => setAccountOpen("groom")}>
              신랑측 확인
            </Button>
            
            <Button variant="secondary" onClick={() => setAccountOpen("bride")}>
              신부측 확인
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
}
