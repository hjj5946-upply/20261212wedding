const LS_ENABLED = "bgm_enabled_v1";

let audio: HTMLAudioElement | null = null;

export function getBgmEnabled(): boolean {
  const v = localStorage.getItem(LS_ENABLED);
  return v === null ? true : v === "1";
}

export function setBgmEnabled(on: boolean) {
  localStorage.setItem(LS_ENABLED, on ? "1" : "0");
  if (!on) audio?.pause();
}

export function initBgm() {
  if (audio) return audio;

  const url =
    (import.meta.env.BASE_URL || "/") +
    encodeURI("audio/A Whole New World.mp3");

  audio = new Audio(url);
  audio.loop = true;
  audio.volume = 0.35;
  audio.preload = "auto";

  return audio;
}

export async function playBgm() {
  const a = initBgm();
  await a.play();
  localStorage.setItem(LS_ENABLED, "1");
}

export function pauseBgm() {
  audio?.pause();
}

export function isBgmPlaying() {
  return audio ? !audio.paused : false;
}
