"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowUpLeft, BookOpen, Search, Network } from "lucide-react";
import type { WordEntry, LessonSummary } from "../lib/types";
import { get } from "../lib/client";
import { Modal } from "./Shared";
export default function SearchDialog({
  close,
  open,
}: {
  close: () => void;
  open: (id: string) => void;
}) {
  const [query, setQuery] = useState(""),
    [result, setResult] = useState<{
      lessons: LessonSummary[];
      sessions: { id: string; title: string }[];
      words: WordEntry[];
    }>({ lessons: [], sessions: [], words: [] }),
    [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    input.current?.focus();
  }, []);
  useEffect(() => {
    let active = true;
    const t = setTimeout(
      () =>
        get("search", { q: query })
          .then((d) => active && setResult(d))
          .catch((e) => active && setError(e.message)),
      200,
    );
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [query]);
  return (
    <Modal close={close} label="جست‌وجو در دفتر">
      <div className="global-search">
        <Search size={22} />
        <input
          ref={input}
          placeholder="مبحث، جلسه یا واژه…"
          aria-label="جست‌وجو در دفتر"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <kbd>ESC</kbd>
      </div>
      <div className="search-results">
        {error && <p>{error}</p>}
        {result.lessons.map((l) => (
          <button key={l.id} onClick={() => open(l.id)}>
            <Network size={17} />
            <span>
              {l.title}
              <small>{l.english}</small>
            </span>
            <ArrowUpLeft size={16} />
          </button>
        ))}
        {result.sessions.map((s) => (
          <button key={s.id} onClick={() => open(s.id)}>
            <BookOpen size={17} />
            {s.title}
            <ArrowUpLeft size={16} />
          </button>
        ))}
        {result.words.length > 0 && (
          <div className="search-word-results">
            <small>واژه‌های دفتر</small>
            {result.words.map((w) => (
              <div key={w.id}>
                <b dir="ltr">{w.word}</b>
                <span>{w.senses[0]?.translation.fa}</span>
              </div>
            ))}
          </div>
        )}
        {query &&
          !result.lessons.length &&
          !result.sessions.length &&
          !result.words.length && <p>چیزی پیدا نشد.</p>}
      </div>
    </Modal>
  );
}
