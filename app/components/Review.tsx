"use client";
import { useEffect, useState } from "react";
import { Check, RotateCcw } from "lucide-react";
import type { WordEntry, PersonalState } from "../lib/types";
import { fa, get } from "../lib/client";
import { PageTitle } from "./Shared";
export default function Review({
  state,
  setState,
}: {
  state: PersonalState;
  setState: React.Dispatch<React.SetStateAction<PersonalState>>;
}) {
  const [words, setWords] = useState<WordEntry[]>([]),
    [index, setIndex] = useState(0),
    [flipped, setFlipped] = useState(false),
    [loaded, setLoaded] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    get("review")
      .then((d) => {
        const list = Array.isArray(d) ? d : d.items || [];
        setWords(
          list
            .filter(
              (w: WordEntry) =>
                !state.reviews[w.id] ||
                state.reviews[w.id].due <= new Date().toISOString(),
            )
            .slice(0, 10),
        );
        setLoaded(true);
      })
      .catch((e) => setError(e.message));
  }, []);
  const word = words[index];
  const answer = (correct: boolean) => {
    const due = new Date(
      Date.now() + (correct ? 3 : 1) * 86400000,
    ).toISOString();
    setState((s) => ({
      ...s,
      reviews: {
        ...s.reviews,
        [word.id]: {
          due,
          correct: (s.reviews[word.id]?.correct || 0) + (correct ? 1 : 0),
          attempts: (s.reviews[word.id]?.attempts || 0) + 1,
        },
      },
    }));
    setIndex((i) => i + 1);
    setFlipped(false);
  };
  return (
    <>
      <PageTitle
        label="A LITTLE EVERY DAY"
        title="کمی مرور، کمی ماندگارتر"
        description="ده واژه از فهرست اولویت کلاس؛ معنی را به یاد بیاور، بعد برگه را برگردان."
      />
      {error ? (
        <div className="empty">{error}</div>
      ) : !loaded ? (
        <div className="loading">آماده کردن برگه‌ها…</div>
      ) : !word ? (
        <div className="review-finish">
          <span>✳</span>
          <h2>
            {words.length
              ? "مرور امروزت تمام شد."
              : "برگهٔ سررسیدشده‌ای نداری."}
          </h2>
          <p>واژه‌های سخت فردا و واژه‌های آشنا سه روز دیگر برمی‌گردند.</p>
        </div>
      ) : (
        <div className="review-area">
          <div className="review-progress">
            <span>
              برگهٔ {fa(index + 1)} از {fa(words.length)}
            </span>
            <div>
              <i style={{ width: `${(index / words.length) * 100}%` }} />
            </div>
          </div>
          <button
            className={`flashcard ${flipped ? "flipped" : ""}`}
            onClick={() => setFlipped(!flipped)}
            aria-label="برگرداندن برگه"
          >
            <span className="tape" />
            <small>{flipped ? "پشت برگه / معنی" : "روی برگه / واژه"}</small>
            {flipped ? (
              <>
                <h2>
                  {word.senses
                    .map((s) => s.translation.fa)
                    .filter(Boolean)
                    .join("؛ ")}
                </h2>
                <p dir="ltr">{word.word}</p>
              </>
            ) : (
              <>
                <h2 dir="ltr">{word.word}</h2>
                <p>معنی‌اش یادت هست؟</p>
              </>
            )}
            <span className="flashcard-hint">
              <RotateCcw size={15} />
              برای برگرداندن کلیک کن
            </span>
          </button>
          {flipped && (
            <div className="review-actions">
              <button className="secondary" onClick={() => answer(false)}>
                دوباره ببینمش
              </button>
              <button className="primary" onClick={() => answer(true)}>
                بلدمش
                <Check size={17} />
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
