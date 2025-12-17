import { Modal } from "./Modal";

function MapButton({
  kind,
  onClick,
}: {
  kind: "naver" | "kakao" | "tmap";
  onClick: () => void;
}) {
  const meta = {
    naver: { label: "네이버 지도", bg: "#03C75A", fg: "#fff", icon: "/images/naver_map.png" },
    kakao: { label: "카카오맵", bg: "#FEE500", fg: "#000", icon: "/images/kakao_map.png" },
    tmap: { label: "티맵", bg: "#111827", fg: "#fff", icon: "/images/tmap.png" },
  }[kind];

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl border border-neutral-200 px-4 py-3 flex items-center justify-center gap-2 active:scale-[0.99]"
      style={{ backgroundColor: meta.bg, color: meta.fg }}
    >
      <img src={meta.icon} alt="" className="h-5 w-auto" />
      <span className="text-sm font-semibold">{meta.label}</span>
    </button>
  );
}

export function MapSelectModal({
  open,
  onClose,
  onNavigate,
}: {
  open: boolean;
  onClose: () => void;
  onNavigate: (type: "naver" | "kakao" | "tmap") => void;
}) {
  return (
    <Modal open={open} title="길찾기 선택" onClose={onClose}>
      <div className="space-y-3">
        <MapButton kind="naver" onClick={() => onNavigate("naver")} />
        <MapButton kind="kakao" onClick={() => onNavigate("kakao")} />
        <MapButton kind="tmap" onClick={() => onNavigate("tmap")} />
      </div>
    </Modal>
  );
}
