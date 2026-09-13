import { useCallback } from "react";
import { usePlayerStore } from "../store/playerStore";
import * as playerService from "../services/playerService";
import type { QueueTrack } from "../types/player.types";

export function usePlayer() {
  const state = usePlayerStore();

  const play = useCallback((tracks: QueueTrack[], startIndex: number) => {
    return playerService.playQueue(tracks, startIndex);
  }, []);

  return {
    ...state,
    currentTrack: state.queue[state.queueIndex] ?? null,
    hasNext: state.queueIndex + 1 < state.queue.length,
    hasPrevious: state.queueIndex > 0,
    play,
    togglePlayPause: playerService.togglePlayPause,
    seekBy: playerService.seekBy,
    seekTo: playerService.seekTo,
    setSpeed: playerService.setSpeed,
    next: playerService.next,
    previous: playerService.previous,
    startSleepTimer: playerService.startSleepTimer,
    setSleepAtEndOfLecture: playerService.setSleepAtEndOfLecture,
    clearSleepTimer: playerService.clearSleepTimer,
    setVolume: playerService.setVolume,
  };
}
