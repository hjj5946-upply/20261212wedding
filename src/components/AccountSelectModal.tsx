import { Modal } from "./Modal";
import { Button } from "./Button";

export function AccountSelectModal({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (type: "groom" | "bride") => void;
}) {
  return (
    <Modal open={open} title="계좌 선택" onClose={onClose}>
      <div className="space-y-3">
        <Button variant="primary" onClick={() => onSelect("groom")}>
          신랑측 계좌 보기
        </Button>
        <Button variant="primary" onClick={() => onSelect("bride")}>
          신부측 계좌 보기
        </Button>
      </div>
    </Modal>
  );
}
