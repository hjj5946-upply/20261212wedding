const LS_ENABLED = "bgm_enabled_v1";

const BASE = import.meta.env.BASE_URL || "/";

// ⚠️ 파일명은 public/audio 의 실제 이름과 **대소문자까지** 같아야 한다.
//    개발 환경(Windows)은 대소문자를 가리지 않아서 통과하지만, 배포 서버는
//    대소문자를 구분하므로 한 글자만 달라도 그 곡만 404 → "가끔 음악이 안 나옴"이 된다.
const TRACKS = [
  BASE + encodeURI("audio/Rubber Bazooka.mp3"),
  BASE + encodeURI("audio/Can't Stop The Feeling.mp3"),
  BASE + encodeURI("audio/Sugar.mp3"),
  BASE + encodeURI("audio/Love.mp3"),
  BASE + encodeURI("audio/Kiss Me.mp3"),
];

const VOLUME = 0.35;
const FADE_MS = 2000;

let audio: HTMLAudioElement | null = null;
let currentTrackIndex = -1;
let fadeTimer: number | null = null;
// 파일을 못 읽은 곡을 건너뛴 횟수. 전 곡이 실패하면 무한 재시도를 멈춘다.
let failoverCount = 0;

function getRandomTrack(): string {
  let idx;
  do {
    idx = Math.floor(Math.random() * TRACKS.length);
  } while (idx === currentTrackIndex && TRACKS.length > 1);
  currentTrackIndex = idx;
  return TRACKS[idx];
}

function loadTrack(a: HTMLAudioElement, src: string) {
  a.src = src;
  a.load();
}

/**
 * 진행 중인 페이드를 취소한다.
 * ⚠️ 끄기(fadeOut)의 콜백에는 `pause()` 가 들어 있다. 페이드가 끝나기 전에 다시 켜면
 *    "방금 시작한 재생"을 그 콜백이 뒤늦게 멈춰버리므로, 재생/정지 진입점마다 먼저 부른다.
 *    (배지를 껐다가 바로 다시 눌렀을 때 다시 켜지지 않던 원인)
 */
function cancelFade() {
  if (fadeTimer !== null) {
    clearInterval(fadeTimer);
    fadeTimer = null;
  }
}

function fadeIn(a: HTMLAudioElement) {
  cancelFade();
  a.volume = 0;
  const step = VOLUME / (FADE_MS / 50);
  fadeTimer = window.setInterval(() => {
    if (a.volume + step >= VOLUME) {
      a.volume = VOLUME;
      cancelFade();
    } else {
      a.volume += step;
    }
  }, 50);
}

function fadeOut(a: HTMLAudioElement, onDone: () => void) {
  cancelFade();
  if (a.volume <= 0) {
    onDone();
    return;
  }
  const step = a.volume / (FADE_MS / 50);
  fadeTimer = window.setInterval(() => {
    if (a.volume - step <= 0) {
      a.volume = 0;
      cancelFade();
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
  if (on) {
    // 켜는 쪽은 playBgm() 이 담당한다. 여기서는 끄기용 페이드만 취소해 둔다.
    cancelFade();
    return;
  }
  if (audio) fadeOut(audio, () => audio?.pause());
}

export function initBgm() {
  if (audio) return audio;

  audio = new Audio(getRandomTrack());
  audio.volume = 0;
  audio.preload = "auto";

  // 재생이 실제로 시작되면 실패 카운터를 리셋한다
  audio.addEventListener("playing", () => {
    failoverCount = 0;
  });

  // 파일을 못 읽는 곡(404·디코드 실패)은 조용히 건너뛴다.
  // 이게 없으면 그 곡에 걸린 세션은 끝까지 무음이 된다.
  audio.addEventListener("error", () => {
    const a = audio;
    if (!a || failoverCount >= TRACKS.length) return;
    failoverCount += 1;
    loadTrack(a, getRandomTrack());
    if (!getBgmEnabled()) return;
    a.play()
      .then(() => fadeIn(a))
      .catch(() => { });
  });

  audio.addEventListener("timeupdate", () => {
    const a = audio!;
    if (!a.duration) return;
    const remaining = a.duration - a.currentTime;
    if (remaining <= FADE_MS / 1000 && a.volume > 0) {
      fadeOut(a, () => {
        loadTrack(a, getRandomTrack());
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
  // 끄는 중이었다면 그 페이드(끝에 pause 가 달려 있다)를 먼저 취소한다
  cancelFade();
  localStorage.setItem(LS_ENABLED, "1");

  try {
    await a.play();
  } catch {
    // 이 곡을 못 트는 경우(파일 문제)라면 다른 곡으로 한 번 더 시도한다.
    // 자동재생 차단이 원인이면 여기서도 실패하고, 호출한 쪽이 처리한다.
    loadTrack(a, getRandomTrack());
    await a.play();
  }

  fadeIn(a);
}

export function pauseBgm() {
  cancelFade();
  audio?.pause();
}

export function isBgmPlaying() {
  return audio ? !audio.paused : false;
}
