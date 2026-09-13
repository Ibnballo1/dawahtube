import { useState, useCallback } from "react";
import { storage } from "@/lib/storage/mmkv";

const POSITION_KEY_PREFIX = "position:";
const RESUME_THRESHOLD_SECS = 60;

export function useResumePrompt(lectureId: string) {
  const saved = storage.getNumber(`${POSITION_KEY_PREFIX}${lectureId}`) ?? 0;
  const [dismissed, setDismissed] = useState(false);

  const shouldPrompt = saved > RESUME_THRESHOLD_SECS && !dismissed;

  const dismiss = useCallback(() => setDismissed(true), []);

  return { shouldPrompt, savedPosition: saved, dismiss };
}
