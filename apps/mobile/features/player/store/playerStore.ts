import { create } from "zustand";
import type {
  QueueTrack,
  PlaybackSpeed,
  SleepTimerOption,
  PlayerErrorKind,
} from "../types/player.types";

interface PlayerState {
  queue: QueueTrack[];
  queueIndex: number;
  isPlaying: boolean;
  isBuffering: boolean;
  positionSecs: number;
  durationSecs: number;
  speed: PlaybackSpeed;
  error: PlayerErrorKind;
  sleepTimer: SleepTimerOption | null;
  sleepTimerEndsAt: number | null; // epoch ms, null for "end-of-lecture"

  setQueue: (tracks: QueueTrack[], startIndex: number) => void;
  setPlaying: (playing: boolean) => void;
  setBuffering: (buffering: boolean) => void;
  setPosition: (secs: number) => void;
  setDuration: (secs: number) => void;
  setSpeed: (speed: PlaybackSpeed) => void;
  setError: (error: PlayerErrorKind) => void;
  setSleepTimer: (
    option: SleepTimerOption | null,
    endsAt: number | null,
  ) => void;
  advanceQueue: () => void;
  volume: number;
  setVolume: (volume: number) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  queue: [],
  queueIndex: -1,
  isPlaying: false,
  isBuffering: false,
  positionSecs: 0,
  durationSecs: 0,
  speed: 1,
  error: null,
  volume: 1,
  setVolume: (volume) => set({ volume }),
  sleepTimer: null,
  sleepTimerEndsAt: null,

  setQueue: (tracks, startIndex) =>
    set({ queue: tracks, queueIndex: startIndex, positionSecs: 0 }),
  setPlaying: (isPlaying) => set({ isPlaying }),
  setBuffering: (isBuffering) => set({ isBuffering }),
  setPosition: (positionSecs) => set({ positionSecs }),
  setDuration: (durationSecs) => set({ durationSecs }),
  setSpeed: (speed) => set({ speed }),
  setError: (error) => set({ error }),
  setSleepTimer: (sleepTimer, sleepTimerEndsAt) =>
    set({ sleepTimer, sleepTimerEndsAt }),
  advanceQueue: () => {
    const { queue, queueIndex } = get();
    if (queueIndex + 1 < queue.length)
      set({ queueIndex: queueIndex + 1, positionSecs: 0 });
  },
}));

export const currentTrack = () => {
  const { queue, queueIndex } = usePlayerStore.getState();
  return queue[queueIndex] ?? null;
};
