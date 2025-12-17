import { useEffect, useState } from "react";
import type { WeddingConfig, AccountInfo } from "../config/wedding";
import { Section } from "../components/Section";
import { Button } from "../components/Button";

type Props = {
  data: WeddingConfig;
  onCopy: (text: string) => void; // Invitation의 copyText 사용(Toast 1곳 유지)
};

function maskAccountNumber(num: string) {
  const digits = num.replace(/\D/g, "");
  if (digits.length <= 6) return num;

  let i = 0;
  const keep = digits.length - 6;
  return num.replace(/\d/g, (m) => {
    const out = i < keep ? m : "*";
    i += 1;
    return out;
  });
}

function AccountList({
  accounts,
  onCopy,
}: {
  accounts: AccountInfo[];
  onCopy: (text: string) => void;
}) {
  const [revealIndex, setRevealIndex] = useState<number | null>(null);

  useEffect(() => {
    if (revealIndex === null) return;
    const t = setTimeout(() => setRevealIndex(null), 10000);
    return () => clearTimeout(t);
  }, [revealIndex]);

  return (
    <div className="space-y-3">
      {accounts.map((a, idx) => {
        const isRevealed = revealIndex === idx;
        const shownNumber = isRevealed ? a.number : maskAccountNumber(a.number);
        const copyText = `${a.bank} ${a.number} (${a.holder})`;

        return (
          <div key={idx} className="rounded-2xl border border-neutral-200 p-4">
            <div className="text-sm font-medium">{a.holder}</div>

            <div className="mt-1 text-sm text-neutral-700">
              {a.bank} {shownNumber}
            </div>

            {a.memo ? (
              <div className="mt-1 text-xs text-neutral-500">{a.memo}</div>
            ) : null}

            <div className="mt-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => setRevealIndex(isRevealed ? null : idx)}
                >
                  {isRevealed ? "가리기" : "계좌 보기"}
                </Button>

                <Button
                  variant="primary"
                  type="button"
                  onClick={() => onCopy(copyText)}
                >
                  복사
                </Button>
              </div>

              <Button
                variant="secondary"
                type="button"
                className="w-full bg-[#FEE800] text-black border border-neutral-200"
                onClick={async () => {
                  await onCopy(copyText);
                  const url = a.kakaoPayUrl || "https://www.kakaopay.com/";
                  window.open(url, "_blank", "noreferrer");
                }}
              >
                카카오페이로 송금
              </Button>
            </div>


            {isRevealed ? (
              <div className="mt-2 text-[11px] text-neutral-400">
                보안상 10초 후 자동으로 가려집니다.
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export function GiftAccountsSection({ data, onCopy }: Props) {
  const [open, setOpen] = useState<null | "groom" | "bride">(null);

  return (
    <Section id="gift" className="px-5 py-12 border-t border-neutral-100">
      <div className="mx-auto max-w-md text-center">
      <div className="text-xs tracking-wide text-neutral-400">Account</div>
        <h2 className="mt-1 text-lg font-semibold">마음 전하는 곳</h2>
        <p className="mt-3 text-sm text-neutral-500 leading-relaxed">
          참석이 어려우신 분들을 위해 계좌 정보를 안내드립니다.
          <br />
          축하의 마음만으로도 충분히 감사드립니다.
        </p>

        <div className="mt-6 space-y-3">
          {/* 신랑 */}
          <div className="rounded-2xl border border-neutral-200 overflow-hidden">
            <button
              type="button"
              className="w-full px-4 py-4 flex items-center justify-between bg-white"
              onClick={() => setOpen(open === "groom" ? null : "groom")}
              aria-expanded={open === "groom"}
            >
              <span className="text-sm font-medium text-neutral-900">신랑측 계좌</span>
              <span className="text-sm text-neutral-400">{open === "groom" ? "−" : "+"}</span>
            </button>
            {open === "groom" ? (
              <div className="px-4 pb-4">
                <AccountList accounts={data.groomAccounts} onCopy={onCopy} />
              </div>
            ) : null}
          </div>

          {/* 신부 */}
          <div className="rounded-2xl border border-neutral-200 overflow-hidden">
            <button
              type="button"
              className="w-full px-4 py-4 flex items-center justify-between bg-white"
              onClick={() => setOpen(open === "bride" ? null : "bride")}
              aria-expanded={open === "bride"}
            >
              <span className="text-sm font-medium text-neutral-900">신부측 계좌</span>
              <span className="text-sm text-neutral-400">{open === "bride" ? "−" : "+"}</span>
            </button>
            {open === "bride" ? (
              <div className="px-4 pb-4">
                <AccountList accounts={data.brideAccounts} onCopy={onCopy} />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </Section>
  );
}
