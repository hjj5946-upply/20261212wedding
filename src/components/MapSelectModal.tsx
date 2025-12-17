import { Modal } from "./Modal";

const BASE = import.meta.env.BASE_URL;

function MapButton({
  kind,
  onClick,
}: {
  kind: "naver" | "kakao" | "tmap";
  onClick: () => void;
}) {
  if (kind === "naver") {
    return (
      <button
        type="button"
        onClick={onClick}
        className="w-full h-12 rounded-2xl bg-[#03C75A] flex items-center justify-center active:scale-[0.99]"
        aria-label="네이버 지도"
      >
        <img
          src={`${BASE}images/navermap.png`}
          alt="네이버 지도"
          className="h-5 w-auto object-contain"
        />
      </button>
    );
  }

  if (kind === "kakao") {
    return (
      <button
        type="button"
        onClick={onClick}
        className="w-full h-12 rounded-2xl bg-[#FEE500] flex items-center justify-center gap-2 active:scale-[0.99]"
        aria-label="카카오맵"
      >
        <img
          src={`${BASE}images/kakaomap.png`}
          alt="카카오맵"
          className="h-6 w-auto object-contain"
        />
        <span className="text-sm font-semibold text-black">카카오맵</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full h-12 rounded-2xl bg-white border border-neutral-300 flex items-center justify-center active:scale-[0.99]"
      aria-label="티맵"
    >
      <img
        src={`${BASE}images/tmap.png`}
        alt="티맵"
        className="h-6 w-auto object-contain"
      />
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
