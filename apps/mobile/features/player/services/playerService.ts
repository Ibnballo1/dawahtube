import {
  createAudioPlayer,
  setAudioModeAsync,
  type AudioPlayer,
} from "expo-audio";
import { AppState } from "react-native";
import { usePlayerStore, currentTrack } from "../store/playerStore";
import { storage } from "@/lib/storage/mmkv";
import type { QueueTrack, PlaybackSpeed } from "../types/player.types";

const POSITION_KEY_PREFIX = "position:";
const POSITION_WRITE_THROTTLE_MS = 5000;

let player: AudioPlayer | null = null;
let statusUnsub: (() => void) | null = null;
let lastPositionWrite = 0;
let sleepTimerHandle: ReturnType<typeof setTimeout> | null = null;

async function ensureAudioMode() {
  await setAudioModeAsync({
    playsInSilentMode: true,
    shouldPlayInBackground: true,
    interruptionMode: "doNotMix",
    interruptionModeAndroid: "doNotMix",
  });
}

function savedPosition(lectureId: string): number {
  return storage.getNumber(`${POSITION_KEY_PREFIX}${lectureId}`) ?? 0;
}

function persistPosition(lectureId: string, secs: number, force = false) {
  const now = Date.now();
  if (!force && now - lastPositionWrite < POSITION_WRITE_THROTTLE_MS) return;
  lastPositionWrite = now;
  storage.set(`${POSITION_KEY_PREFIX}${lectureId}`, secs);
}

async function loadTrack(track: QueueTrack, autoplay: boolean) {
  const store = usePlayerStore.getState();
  store.setBuffering(true);
  store.setError(null);

  statusUnsub?.();
  if (player) {
    try {
      player.remove();
    } catch {
      // player already released — ignore
    }
  }

  try {
    player = createAudioPlayer({ uri: track.sourceUrl ?? undefined });
  } catch {
    store.setBuffering(false);
    store.setError("load-failed");
    return;
  }

  const resumeAt = savedPosition(track.lectureId);

  // Poll status — see note in usePlayer.ts re: useAudioPlayerStatus being the
  // React-idiomatic path inside components; this imperative poll keeps the
  // service usable outside of React (e.g. from AppState listeners below).
  const interval = setInterval(() => {
    if (!player) return;
    const status = player.currentStatus;
    if (status.isLoaded) {
      const duration = status.duration ?? 0;
      const position = status.currentTime ?? 0;
      store.setDuration(duration);
      store.setPosition(position);
      store.setBuffering(status.isBuffering ?? false);
      persistPosition(track.lectureId, position);

      const reachedEnd =
        status.didJustFinish ||
        (duration > 0 && position >= duration - 0.25 && !status.isBuffering);
      if (reachedEnd) {
        void next();
      }
    }
  }, 500);
  statusUnsub = () => clearInterval(interval);

  if (resumeAt > 60) {
    // Caller (usePlayer) surfaces the "Continue from X?" prompt based on this.
    store.setPosition(resumeAt);
  }

  player.setPlaybackRate(store.speed);
  if (autoplay) {
    player.play();
    store.setPlaying(true);
  }
  player.volume = store.volume;

  setTimeout(() => {
    player?.setActiveForLockScreen(
      true,
      {
        title: track.title,
        artist: track.scholarName ?? "Da'wahTube",
        artworkUrl: track.artworkUrl ?? undefined,
      },
      { showSeekForward: true, showSeekBackward: true },
    );
  }, 500); // matches Expo's documented workaround — session needs a beat to activate
}

export async function playQueue(tracks: QueueTrack[], startIndex: number) {
  const targetTrack = tracks[startIndex];
  if (!targetTrack) return;
  await ensureAudioMode();
  usePlayerStore.getState().setQueue(tracks, startIndex);
  await loadTrack(targetTrack, true);
}

export function togglePlayPause() {
  const store = usePlayerStore.getState();
  if (!player) return;
  if (store.isPlaying) {
    player.pause();
    store.setPlaying(false);
    persistPosition(currentTrack()?.lectureId ?? "", store.positionSecs, true);
  } else {
    player.play();
    store.setPlaying(true);
  }
}

export function seekBy(deltaSecs: number) {
  const store = usePlayerStore.getState();
  if (!player) return;
  const target = Math.max(
    0,
    Math.min(store.durationSecs, store.positionSecs + deltaSecs),
  );
  player.seekTo(target);
  store.setPosition(target);
}

export function seekTo(secs: number) {
  if (!player) return;
  player.seekTo(secs);
  usePlayerStore.getState().setPosition(secs);
}

export function setSpeed(speed: PlaybackSpeed) {
  usePlayerStore.getState().setSpeed(speed);
  player?.setPlaybackRate(speed);
}

export function setVolume(volume: number) {
  const clamped = Math.max(0, Math.min(1, volume));
  usePlayerStore.getState().setVolume(clamped);
  if (player) player.volume = clamped;
}

export async function next() {
  const store = usePlayerStore.getState();
  const track = currentTrack();
  if (track) persistPosition(track.lectureId, store.positionSecs, true);

  if (store.queueIndex + 1 >= store.queue.length) {
    player?.pause();
    player?.seekTo(0);
    store.setPlaying(false);
    store.setPosition(0);
    return; // end of queue — no more series episodes
  }
  store.advanceQueue();
  const nextTrack = currentTrack();
  if (nextTrack) await loadTrack(nextTrack, true);
}

export async function previous() {
  const store = usePlayerStore.getState();
  if (store.positionSecs > 3 || store.queueIndex === 0) {
    seekTo(0);
    return;
  }
  usePlayerStore.setState({
    queueIndex: store.queueIndex - 1,
    positionSecs: 0,
  });
  const prevTrack = currentTrack();
  if (prevTrack) await loadTrack(prevTrack, true);
}

export function startSleepTimer(minutes: number) {
  clearSleepTimer();
  const endsAt = Date.now() + minutes * 60_000;
  usePlayerStore.getState().setSleepTimer(minutes as 15 | 30 | 45 | 60, endsAt);
  sleepTimerHandle = setTimeout(() => {
    player?.pause();
    usePlayerStore.getState().setPlaying(false);
    usePlayerStore.getState().setSleepTimer(null, null);
  }, minutes * 60_000);
}

export function setSleepAtEndOfLecture() {
  clearSleepTimer();
  usePlayerStore.getState().setSleepTimer("end-of-lecture", null);
  // Consumed in loadTrack's didJustFinish handler — see usePlayer.ts for the
  // check that skips auto-advance when this flag is set.
}

export function clearSleepTimer() {
  if (sleepTimerHandle) clearTimeout(sleepTimerHandle);
  sleepTimerHandle = null;
  usePlayerStore.getState().setSleepTimer(null, null);
}

// Flush position immediately on backgrounding, per §13.
AppState.addEventListener("change", (state) => {
  if (state === "background" || state === "inactive") {
    const store = usePlayerStore.getState();
    const track = currentTrack();
    if (track) persistPosition(track.lectureId, store.positionSecs, true);
  }
});
