import { Modal } from "./Modal";
import { Button } from "./Button";

export function MapSelectModal({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (type: "naver" | "kakao" | "tmap") => void;
}) {
  return (
    <Modal open={open} title="길찾기 선택" onClose={onClose}>
      <div className="space-y-3">
        <Button variant="primary" fullWidth onClick={() => onSelect("naver")}>네이버 지도</Button>
        <Button variant="primary" fullWidth onClick={() => onSelect("kakao")}>카카오맵</Button>
        <Button variant="primary" fullWidth onClick={() => onSelect("tmap")}>티맵</Button>
      </div>
    </Modal>
  );
}
