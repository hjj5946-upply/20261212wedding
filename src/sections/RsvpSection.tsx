import { useState } from "react";
import type { WeddingConfig } from "../config/wedding";
import { Button } from "../components/Button";
import { Section } from "../components/Section";
import { SectionHeader } from "../components/SectionHeader";

type Props = {
  data: WeddingConfig;
  onToast: (msg: string) => void; // ✅ Invitation 토스트 재사용
};

type AttendStatus = "attend" | "maybe" | "decline";

export function RsvpSection({ data, onToast }: Props) {
  const [status, setStatus] = useState<AttendStatus>("attend");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [count, setCount] = useState(1);
  const [meal, setMeal] = useState<"yes" | "no">("yes");
  const [memo, setMemo] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const isValid = name.trim().length >= 2 && count >= 0 && count <= 10;

  const handleSubmit = async () => {
    if (!isValid) {
      onToast("이름(2글자 이상)과 인원 정보를 확인해 주세요.");
      return;
    }
    setSubmitting(true);

    // ✅ 목업 처리 (추후 supabase insert로 교체)
    await new Promise((r) => setTimeout(r, 600));

    setSubmitting(false);
    setDone(true);
    onToast("RSVP가 접수되었습니다.");
    console.log("RSVP payload(mock):", {
      status,
      name: name.trim(),
      phone: phone.trim(),
      count,
      meal,
      memo: memo.trim(),
    });
  };

  return (
    <Section id="rsvp" className="px-5 py-12 border-t border-neutral-100">
      <div className="mx-auto max-w-md">
        <SectionHeader
          title={data.copy.rsvpTitle}
          subtitle="참석 여부를 남겨주시면 준비에 큰 도움이 됩니다."
        />

        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          {/* 상태 선택 */}
          <div className="grid grid-cols-3 gap-2">
            <ToggleChip
              active={status === "attend"}
              onClick={() => setStatus("attend")}
              disabled={done}
            >
              참석
            </ToggleChip>
            <ToggleChip
              active={status === "maybe"}
              onClick={() => setStatus("maybe")}
              disabled={done}
            >
              미정
            </ToggleChip>
            <ToggleChip
              active={status === "decline"}
              onClick={() => setStatus("decline")}
              disabled={done}
            >
              불참
            </ToggleChip>
          </div>

          {/* 입력 폼 */}
          <div className="mt-6 space-y-4">
            <Field label="성함 *">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예) 홍길동"
                className={inputCls}
                disabled={done}
              />
            </Field>

            <Field label="연락처(선택)">
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="예) 01012345678"
                className={inputCls}
                disabled={done}
                inputMode="numeric"
              />
            </Field>

            <Field label="동반 인원">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className={stepBtnCls}
                  onClick={() => setCount((v) => Math.max(0, v - 1))}
                  disabled={done}
                  aria-label="decrease"
                >
                  −
                </button>

                <div className="min-w-12 rounded-2xl border border-neutral-200 bg-white py-2 text-center text-sm text-neutral-800">
                  {count}
                </div>

                <button
                  type="button"
                  className={stepBtnCls}
                  onClick={() => setCount((v) => Math.min(10, v + 1))}
                  disabled={done}
                  aria-label="increase"
                >
                  +
                </button>

                <div className="text-xs text-neutral-500">0~10</div>
              </div>
            </Field>

            <Field label="식사 여부(선택)">
              <div className="grid grid-cols-2 gap-2">
                <ToggleChip active={meal === "yes"} onClick={() => setMeal("yes")} disabled={done}>
                  식사함
                </ToggleChip>
                <ToggleChip active={meal === "no"} onClick={() => setMeal("no")} disabled={done}>
                  식사 안함
                </ToggleChip>
              </div>
            </Field>

            <Field label="메모(선택)">
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="전달할 내용이 있으면 적어주세요."
                className={`${inputCls} min-h-[88px] resize-none`}
                disabled={done}
              />
            </Field>
          </div>

          {/* 제출 */}
          <div className="mt-6">
            <Button
              fullWidth
              onClick={handleSubmit}
              disabled={!isValid || submitting || done}
              className={!isValid ? "opacity-60" : ""}
            >
              {done ? "제출 완료" : submitting ? "제출 중..." : "제출하기"}
            </Button>

            <p className="mt-3 text-xs text-neutral-500">
              * 현재는 저장 방식 결정 전이라 “목업 제출”로만 동작합니다.
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-xs font-medium text-neutral-700">{label}</div>
      {children}
    </div>
  );
}

function ToggleChip({
  active,
  onClick,
  children,
  disabled,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "rounded-2xl border px-3 py-2 text-sm transition",
        active
          ? "border-neutral-900 bg-neutral-900 text-white"
          : "border-neutral-200 bg-white text-neutral-900",
        disabled ? "opacity-60" : "active:scale-[0.99]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

const inputCls =
  "w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-900";

const stepBtnCls =
  "h-10 w-10 rounded-2xl border border-neutral-200 bg-white text-sm active:scale-[0.99] disabled:opacity-60";
