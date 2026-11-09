"use client";
import { useEffect, useState } from "react";
import { ArrowUpLeft, Bookmark, Search, Volume2, X } from "lucide-react";
import type { WordEntry, PersonalState } from "../lib/types";
import { fa, get } from "../lib/client";
import { PageTitle } from "./Shared";
export default function Vocabulary({
  state,
  toggle,
}: {
  state: PersonalState;
  toggle: (key: "bookmarks", id: string) => void;
}) {
  const [query, setQuery] = useState(""),
    [page, setPage] = useState(0),
    [family, setFamily] = useState(""),
    [result, setResult] = useState<{ items: WordEntry[]; total: number }>({
      items: [],
      total: 0,
    }),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    setLoading(true);
    const timer = setTimeout(
      () =>
        get("vocabulary", {
          q: query,
          page: String(page),
          ...(family ? { family } : {}),
        })
          .then((d) => {
            if (active) {
              setResult(d);
              setError("");
            }
          })
          .catch((e) => active && setError(e.message))
          .finally(() => active && setLoading(false)),
      200,
    );
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query, page, family]);
  return (
    <>
      <PageTitle
        label="WORDS WITH A STORY"
        title="واژه‌ها، با ریشه و معنا"
        description="فراتر از ترجمه؛ معنی، مثال و خانوادهٔ واژه‌هایی که در کلاس دیده‌ای."
      />
      <div className="word-toolbar">
        <div className="input-search">
          <Search size={20} />
          <input
            aria-label="جست‌وجوی واژه"
            placeholder="یک واژه یا معنی فارسی…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
          />
        </div>
        <span>{loading ? "در حال جست‌وجو…" : `${fa(result.total)} واژه`}</span>
        {family && (
          <button
            className="text-button"
            onClick={() => {
              setFamily("");
              setPage(0);
            }}
          >
            خروج از خانواده
            <X size={16} />
          </button>
        )}
      </div>
      {error && <p role="alert">{error}</p>}
      <div className="word-grid" aria-busy={loading}>
        {result.items.map((w) => (
          <article className="word-card" key={w.id}>
            <div className="word-top">
              <button
                className="icon-button"
                aria-label={`نشان کردن ${w.word}`}
                onClick={() => toggle("bookmarks", w.id)}
              >
                <Bookmark
                  size={17}
                  fill={
                    state.bookmarks.includes(w.id) ? "currentColor" : "none"
                  }
                />
              </button>
              <button
                className="word-pronounce"
                onClick={() => {
                  if ("speechSynthesis" in window) {
                    const u = new SpeechSynthesisUtterance(w.word);
                    u.lang = "en-US";
                    speechSynthesis.speak(u);
                  }
                }}
                aria-label={`تلفظ ${w.word}`}
              >
                <Volume2 size={16} />
                <h3 dir="ltr">{w.word}</h3>
              </button>
            </div>
            {w.senses.map((s) => (
              <div className="word-sense" key={s.id}>
                <span className="pos" dir="ltr">
                  {s.partOfSpeech}
                </span>
                <strong>{s.translation.fa || "معنی فارسی ثبت نشده"}</strong>
                {s.definition.en && <p dir="ltr">{s.definition.en}</p>}
                {s.examples?.slice(0, 1).map((ex, i) => (
                  <blockquote dir="auto" key={i}>
                    {ex.data.text}
                  </blockquote>
                ))}
              </div>
            ))}
            {w.familyId && (
              <button
                className="text-button"
                onClick={() => {
                  setFamily(w.familyId!);
                  setQuery("");
                  setPage(0);
                }}
              >
                خانوادهٔ این واژه
                <ArrowUpLeft size={14} />
              </button>
            )}
          </article>
        ))}
      </div>
      {!loading && !result.items.length && (
        <div className="empty">واژه‌ای با این عبارت پیدا نشد.</div>
      )}
      <div className="pagination">
        <button
          className="secondary"
          disabled={page === 0}
          onClick={() => setPage((p) => p - 1)}
        >
          قبلی
        </button>
        <span>
          {fa(page + 1)} / {fa(Math.max(1, Math.ceil(result.total / 24)))}
        </span>
        <button
          className="secondary"
          disabled={(page + 1) * 24 >= result.total}
          onClick={() => setPage((p) => p + 1)}
        >
          بعدی
        </button>
      </div>
    </>
  );
}
