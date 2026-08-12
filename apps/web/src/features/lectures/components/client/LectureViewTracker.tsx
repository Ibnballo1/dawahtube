"use client";
// src/features/lectures/components/client/LectureViewTracker.tsx
// Fires once on mount. Invisible — no UI rendered.
// sessionId is stored in sessionStorage so one browser tab = one view.

import { useEffect } from "react";
import { nanoid } from "nanoid";
import { trackLectureView } from "../../actions/lecture.actions";

interface LectureViewTrackerProps {
  lectureId: string;
}

const SESSION_KEY = "dwt_session_id";

function getOrCreateSessionId(): string {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const id = nanoid(21);
    sessionStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    // sessionStorage blocked (private browsing, iframe, etc.)
    return nanoid(21);
  }
}

export function LectureViewTracker({ lectureId }: LectureViewTrackerProps) {
  useEffect(() => {
    const sessionId = getOrCreateSessionId();

    // Fire and forget — analytics failures must never affect the page
    trackLectureView({ lectureId, sessionId }).catch(() => undefined);
  }, [lectureId]); // Only re-fire if lecture changes (shouldn't on a detail page)

  return null; // No DOM output
}
