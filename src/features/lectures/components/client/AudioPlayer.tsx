"use client";
// src/features/lectures/components/client/AudioPlayer.tsx
// Purpose-built audio player. No third-party library — ~3KB vs 100KB+ alternatives.
// Uses the native HTMLAudioElement API entirely.

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { cn } from "@shared/lib/utils";
import { formatDuration } from "@shared/lib/format";

interface AudioPlayerProps {
  lectureId: string;
  lectureTitle: string;
  scholarName: string | null;
  audioKey: string;
  audioUrl: string;
  durationSecs: number;
  allowDownload: boolean;
  thumbnailUrl: string | null;
}

const PLAYBACK_SPEEDS = [0.75, 1, 1.25, 1.5, 1.75, 2];

export function AudioPlayer({
  lectureId,
  lectureTitle,
  scholarName,
  audioUrl,
  durationSecs,
  allowDownload,
  thumbnailUrl,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(durationSecs);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(1); // index into PLAYBACK_SPEEDS
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const speed = PLAYBACK_SPEEDS[speedIdx] ?? 1;

  // ── Sync audio element with state ──────────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = muted ? 0 : volume;
    audio.playbackRate = speed;
  }, [volume, muted, speed]);

  // ── Wire up audio events ───────────────────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDuration = () => setDuration(audio.duration || durationSecs);
    const onPlay = () => {
      setPlaying(true);
      setLoading(false);
    };
    const onPause = () => setPlaying(false);
    const onWaiting = () => setLoading(true);
    const onCanPlay = () => setLoading(false);
    const onEnded = () => {
      setPlaying(false);
      setCurrentTime(0);
      audio.currentTime = 0;
    };
    const onError = () => {
      setError(true);
      setLoading(false);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDuration);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDuration);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, [durationSecs]);

  // ── Controls ────────────────────────────────────────────────────────────────
  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || error) return;
    setLoading(true);
    if (playing) {
      audio.pause();
    } else {
      try {
        await audio.play();
      } catch {
        setError(true);
        setLoading(false);
      }
    }
  }, [playing, error]);

  const seek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const audio = audioRef.current;
      const bar = progressRef.current;
      if (!audio || !bar || !duration) return;
      const rect = bar.getBoundingClientRect();
      const ratio = (e.clientX - rect.left) / rect.width;
      audio.currentTime = Math.max(0, Math.min(ratio * duration, duration));
    },
    [duration],
  );

  const skip = useCallback(
    (seconds: number) => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.currentTime = Math.max(
        0,
        Math.min(audio.currentTime + seconds, duration),
      );
    },
    [duration],
  );

  const cycleSpeed = useCallback(() => {
    setSpeedIdx((i) => (i + 1) % PLAYBACK_SPEEDS.length);
  }, []);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // ── Keyboard shortcuts on the player ───────────────────────────────────────
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
          e.preventDefault();
          skip(-10);
          break;
        case "ArrowRight":
          e.preventDefault();
          skip(10);
          break;
        case "m":
          setMuted((m) => !m);
          break;
      }
    },
    [togglePlay, skip],
  );

  return (
    <div
      className={cn(
        "rounded-2xl overflow-hidden shadow-lg",
        "bg-primary-900 text-white",
      )}
      role="region"
      aria-label={`Audio player: ${lectureTitle}`}
      onKeyDown={onKeyDown}
      tabIndex={0}
    >
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        aria-hidden="true"
      />

      {/* ── Player header ──────────────────────────────────────────── */}
      <div className="flex items-center gap-4 px-5 pt-5 pb-4">
        {/* Thumbnail */}
        <div className="size-14 rounded-xl overflow-hidden bg-primary-800 shrink-0">
          {thumbnailUrl ? (
            <Image
              src={thumbnailUrl}
              alt={lectureTitle}
              width={56}
              height={56}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="rgba(255,255,255,0.3)"
                aria-hidden="true"
              >
                <path d="M9 18V5l12-2v13M9 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm12-2c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Title + scholar */}
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-sm text-white leading-snug line-clamp-2">
            {lectureTitle}
          </p>
          {scholarName && (
            <p className="text-xs text-white/50 mt-0.5">{scholarName}</p>
          )}
        </div>

        {/* Speed button */}
        <button
          type="button"
          onClick={cycleSpeed}
          aria-label={`Playback speed: ${speed}x. Click to change`}
          className="shrink-0 px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 transition-colors text-xs font-mono font-bold text-white/80 hover:text-white min-w-[3rem] text-center"
        >
          {speed}×
        </button>
      </div>

      {/* ── Progress bar ───────────────────────────────────────────── */}
      <div className="px-5">
        <div
          ref={progressRef}
          role="slider"
          aria-label="Seek audio"
          aria-valuemin={0}
          aria-valuemax={duration}
          aria-valuenow={Math.round(currentTime)}
          aria-valuetext={`${formatDuration(Math.round(currentTime))} of ${formatDuration(Math.round(duration))}`}
          tabIndex={0}
          onClick={seek}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") skip(-5);
            if (e.key === "ArrowRight") skip(5);
          }}
          className="group relative h-1.5 bg-white/20 rounded-full cursor-pointer hover:h-2.5 transition-all duration-fast"
        >
          {/* Buffered fill */}
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-0 bg-white/20 rounded-full"
            style={{ width: `${progress}%` }}
          />
          {/* Played fill */}
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-0 bg-accent-400 rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
          {/* Scrub handle */}
          <div
            aria-hidden="true"
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 size-3.5 rounded-full bg-white shadow opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `${progress}%` }}
          />
        </div>

        {/* Time display */}
        <div className="flex items-center justify-between mt-1.5 text-xs font-mono text-white/40">
          <span
            aria-label={`Current time: ${formatDuration(Math.round(currentTime))}`}
          >
            {formatDuration(Math.round(currentTime))}
          </span>
          <span
            aria-label={`Total duration: ${formatDuration(Math.round(duration))}`}
          >
            {formatDuration(Math.round(duration))}
          </span>
        </div>
      </div>

      {/* ── Controls row ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-4">
        {/* Left: volume */}
        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? "Unmute" : "Mute"}
          className="text-white/50 hover:text-white transition-colors p-1"
        >
          {muted ? <VolumeMuteIcon /> : <VolumeIcon />}
        </button>

        {/* Centre: skip back + play/pause + skip forward */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => skip(-10)}
            aria-label="Skip back 10 seconds"
            className="text-white/60 hover:text-white transition-colors"
          >
            <SkipBackIcon />
          </button>

          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? "Pause" : "Play"}
            disabled={error}
            className={cn(
              "size-12 rounded-full flex items-center justify-center",
              "bg-white text-primary-900",
              "hover:bg-accent-300 transition-colors duration-fast",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-900",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              "shadow-lg",
            )}
          >
            {loading ? (
              <svg
                className="animate-spin"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeOpacity="0.25"
                />
                <path
                  d="M12 2a10 10 0 0 1 10 10"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            ) : playing ? (
              <PauseIcon />
            ) : (
              <PlayIcon />
            )}
          </button>

          <button
            type="button"
            onClick={() => skip(10)}
            aria-label="Skip forward 10 seconds"
            className="text-white/60 hover:text-white transition-colors"
          >
            <SkipForwardIcon />
          </button>
        </div>

        {/* Right: download */}
        {allowDownload && audioUrl ? (
          <a
            href={audioUrl}
            download
            aria-label="Download audio"
            className="text-white/50 hover:text-white transition-colors p-1"
          >
            <DownloadIcon />
          </a>
        ) : (
          <div className="w-6" aria-hidden="true" />
        )}
      </div>

      {/* ── Error state ─────────────────────────────────────────────── */}
      {error && (
        <div
          role="alert"
          className="px-5 pb-4 text-center text-sm text-red-300"
        >
          Audio could not be loaded. Please try again later.
        </div>
      )}

      {/* ── Keyboard hints ─────────────────────────────────────────── */}
      <p className="px-5 pb-3 text-[10px] text-white/20 text-center">
        Space = play/pause · ← → = seek 10s · M = mute
      </p>
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function PlayIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </svg>
  );
}

function SkipBackIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M1 4v6h6" />
      <path d="M3.51 15a9 9 0 1 0 .49-4.68" />
      <text
        x="8.5"
        y="15"
        fontSize="5"
        fill="currentColor"
        stroke="none"
        fontFamily="monospace"
        fontWeight="bold"
      >
        10
      </text>
    </svg>
  );
}

function SkipForwardIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M23 4v6h-6" />
      <path d="M20.49 15a9 9 0 1 1-.49-4.68" />
      <text
        x="8.5"
        y="15"
        fontSize="5"
        fill="currentColor"
        stroke="none"
        fontFamily="monospace"
        fontWeight="bold"
      >
        10
      </text>
    </svg>
  );
}

function VolumeIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );
}

function VolumeMuteIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}
