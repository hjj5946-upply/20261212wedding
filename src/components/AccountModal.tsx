import type { AccountInfo } from "../config/wedding";
import { Button } from "./Button";
import { Modal } from "./Modal";

export function AccountModal({
  open,
  title,
  accounts,
  onClose,
  onCopy,
}: {
  open: boolean;
  title: string;
  accounts: AccountInfo[];
  onClose: () => void;
  onCopy: (text: string) => void;
}) {
  return (
    <Modal open={open} title={title} onClose={onClose}>
      <div className="space-y-3">
        {accounts.map((a, idx) => {
          const copyText = `${a.bank} ${a.number} (${a.holder})`;
          return (
            <div key={idx} className="rounded-2xl border border-neutral-200 p-4">
              <div className="text-sm font-medium">{a.holder}</div>
              <div className="mt-1 text-sm text-neutral-700">
                {a.bank} {a.number}
              </div>
              {a.memo ? (
                <div className="mt-1 text-xs text-neutral-500">{a.memo}</div>
              ) : null}
              <div className="mt-3">
                <Button variant="primary" onClick={() => onCopy(copyText)}>
                  계좌번호 복사
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
