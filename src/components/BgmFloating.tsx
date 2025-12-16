import { useEffect, useState } from "react";
import {
  getBgmEnabled,
  setBgmEnabled,
  initBgm,
  playBgm,
  pauseBgm,
  isBgmPlaying,
} from "../utils/bgm";

export function BgmFloating() {
  const [enabled, setEnabledState] = useState(getBgmEnabled());
  const [playing, setPlaying] = useState(false);

  // 오디오 준비 + play/pause 상태 동기화
  useEffect(() => {
    const a = initBgm();

    const sync = () => setPlaying(isBgmPlaying());
    sync();

    a.addEventListener("play", sync);
    a.addEventListener("pause", sync);

    return () => {
      a.removeEventListener("play", sync);
      a.removeEventListener("pause", sync);
    };
  }, []);

  // enabled 변경 반영
  useEffect(() => {
    setBgmEnabled(enabled);
    if (!enabled) {
      pauseBgm();
      setPlaying(false);
    }
  }, [enabled]);

  const toggle = async () => {
    const next = !enabled;
    setEnabledState(next);

    if (next) {
        try {
        await playBgm();                 // 재생
        localStorage.setItem("bgm_enabled_v1", "1"); // ✅ ON 확정
        setPlaying(true);
        } catch {
        setPlaying(false);
        }
    } else {
        pauseBgm();
        localStorage.setItem("bgm_enabled_v1", "0");   // ✅ OFF 저장
        setPlaying(false);
    }
    };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="bgm toggle"
      className={[
        "fixed top-4 right-4 z-50",
        "w-7 h-7",
        "rounded-full bg-black/45 backdrop-blur shadow",
        "p-1",
        "flex items-center justify-center",
        "active:scale-[0.99] transition",
        "select-none",
      ].join(" ")}
    >
      <EqIcon playing={playing && enabled} />
    </button>
  );
}

function EqIcon({ playing }: { playing: boolean }) {
  return (
    <span className="inline-flex items-end gap-[2px] h-3">
      <span className={barCls(playing, 1)} />
      <span className={barCls(playing, 2)} />
      <span className={barCls(playing, 3)} />
    </span>
  );
}

function barCls(playing: boolean, idx: number) {
  return [
    "w-[2px] rounded-full bg-white/90",
    playing ? `animate-eq${idx}` : "h-[6px] opacity-40",
  ].join(" ");
}
