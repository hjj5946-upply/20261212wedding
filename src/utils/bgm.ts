const LS_ENABLED = "bgm_enabled_v1";

const BASE = import.meta.env.BASE_URL || "/";

const TRACKS = [
  BASE + encodeURI("audio/Rubber Bazooka.mp3"),
  BASE + encodeURI("audio/Can't Stop the Feeling.mp3"),
  BASE + encodeURI("audio/Came Here for Love.mp3"),
  BASE + encodeURI("audio/Sugar.mp3"),
  BASE + encodeURI("audio/Love.mp3"),
  BASE + encodeURI("audio/Kiss Me.mp3"),
];

const VOLUME = 0.35;
const FADE_MS = 2000;

let audio: HTMLAudioElement | null = null;
let currentTrackIndex = -1;
let fadeTimer: number | null = null;

function getRandomTrack(): string {
  let idx;
  do {
    idx = Math.floor(Math.random() * TRACKS.length);
  } while (idx === currentTrackIndex && TRACKS.length > 1);
  currentTrackIndex = idx;
  return TRACKS[idx];
}

function fadeIn(a: HTMLAudioElement) {
  if (fadeTimer) clearInterval(fadeTimer);
  a.volume = 0;
  const step = VOLUME / (FADE_MS / 50);
  fadeTimer = window.setInterval(() => {
    if (a.volume + step >= VOLUME) {
      a.volume = VOLUME;
      clearInterval(fadeTimer!);
      fadeTimer = null;
    } else {
      a.volume += step;
    }
  }, 50);
}

function fadeOut(a: HTMLAudioElement, onDone: () => void) {
  if (fadeTimer) clearInterval(fadeTimer);
  const step = a.volume / (FADE_MS / 50);
  fadeTimer = window.setInterval(() => {
    if (a.volume - step <= 0) {
      a.volume = 0;
      clearInterval(fadeTimer!);
      fadeTimer = null;
      onDone();
    } else {
      a.volume -= step;
    }
  }, 50);
}

export function getBgmEnabled(): boolean {
  const v = localStorage.getItem(LS_ENABLED);
  return v === null ? true : v === "1";
}

export function setBgmEnabled(on: boolean) {
  localStorage.setItem(LS_ENABLED, on ? "1" : "0");
  if (!on && audio) fadeOut(audio, () => audio?.pause());
}

export function initBgm() {
  if (audio) return audio;

  audio = new Audio(getRandomTrack());
  audio.volume = 0;
  audio.preload = "auto";

  audio.addEventListener("timeupdate", () => {
    const a = audio!;
    if (!a.duration) return;
    const remaining = a.duration - a.currentTime;
    if (remaining <= FADE_MS / 1000 && a.volume > 0) {
      fadeOut(a, () => {
        a.src = getRandomTrack();
        a.load();
        if (getBgmEnabled()) {
          // 재생 거부 시 unhandled rejection 이 남지 않게 처리
          a.play()
            .then(() => fadeIn(a))
            .catch(() => { });
        }
      });
    }
  });

  return audio;
}

export async function playBgm() {
  const a = initBgm();
  await a.play();
  fadeIn(a);
  localStorage.setItem(LS_ENABLED, "1");
}

export function pauseBgm() {
  audio?.pause();
}

export function isBgmPlaying() {
  return audio ? !audio.paused : false;
}