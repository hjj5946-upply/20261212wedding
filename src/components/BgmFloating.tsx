import { useEffect, useRef, useState } from "react";
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
  // 토글이 처리되는 동안 연타를 막는다(재생 시작과 정지가 엇갈리면 배지 상태가 꼬인다)
  const busyRef = useRef(false);

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

  /*
   * ⚠️ enabled 를 useEffect 로 다시 반영하지 않는다.
   *    예전에는 toggle 이 pause 하고, 뒤이어 effect 가 setBgmEnabled(false) → 2초 페이드아웃을
   *    또 걸었다. 그 페이드 콜백 끝에 pause() 가 있어서, 2초 안에 다시 켜면 방금 시작한 재생을
   *    멈춰버렸다(= 껐다 켜면 다시 안 켜지던 원인). 지금은 toggle 한 곳에서만 상태를 바꾼다.
   */
  const toggle = async () => {
    if (busyRef.current) return;
    busyRef.current = true;

    const next = !enabled;
    setEnabledState(next);

    try {
      if (next) {
        // playBgm 이 localStorage("1") 까지 처리한다
        await playBgm();
        setPlaying(true);
      } else {
        pauseBgm();
        setBgmEnabled(false); // localStorage("0")
        setPlaying(false);
      }
    } catch {
      // 브라우저가 재생을 거부한 경우
      setPlaying(false);
    } finally {
      busyRef.current = false;
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="bgm toggle"
      aria-pressed={enabled}
      className={[
        "fixed top-4 right-4 z-50 mobile-fixed-tr",
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
