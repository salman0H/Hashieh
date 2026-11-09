"use client";
import { useEffect, useState } from "react";
import type { PersonalState } from "../lib/types";
const initial: PersonalState = {
  version: 1,
  completed: [],
  bookmarks: [],
  stickies: [],
  reviews: {},
  lastLesson: null,
  theme: "paper",
};
export function usePersonal() {
  const [state, setState] = useState(initial),
    [ready, setReady] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    try {
      const raw = localStorage.getItem("hashiyeh.v1");
      if (raw) {
        const value = JSON.parse(raw);
        if (
          value.version !== 1 ||
          !Array.isArray(value.stickies) ||
          !Array.isArray(value.completed)
        )
          throw Error();
        setState({ ...initial, ...value });
      }
    } catch {
      setError(
        "خواندن یادداشت‌های ذخیره‌شده ممکن نشد. پیش از ذخیرهٔ دوباره، از داده‌های مرورگر نسخه بگیر.",
      );
    }
    setReady(true);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = state.theme;
    if (ready && !error)
      try {
        localStorage.setItem("hashiyeh.v1", JSON.stringify(state));
      } catch {
        setError("فضای ذخیره‌سازی مرورگر در دسترس نیست.");
      }
  }, [state, ready, error]);
  return { state, setState, ready, error };
}
