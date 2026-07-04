"use client";
// src/features/articles/components/client/ArticleViewTracker.tsx

import { useEffect } from "react";
import { nanoid } from "nanoid";
import { trackArticleView } from "../../actions/article.actions";

interface ArticleViewTrackerProps {
  articleId: string;
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
    return nanoid(21);
  }
}

export function ArticleViewTracker({ articleId }: ArticleViewTrackerProps) {
  useEffect(() => {
    const sessionId = getOrCreateSessionId();
    trackArticleView({ articleId, sessionId }).catch(() => undefined);
  }, [articleId]);

  return null;
}
