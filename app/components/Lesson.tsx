"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  ArrowUpLeft,
  ArrowRight,
  BookOpen,
  Bookmark,
  Check,
  Sparkles,
  StickyNote,
} from "lucide-react";
import type { LessonDetail, PersonalState } from "../lib/types";
import gsap from "gsap";
import { fa, get } from "../lib/client";
import { Markdown } from "./Shared";
import Notes from "./Notes";
import Tutor from "./Tutor";
import { Topic } from "./Home";
export default function Lesson({
  id,
  open,
  back,
  state,
  setState,
  toggle,
  tutorAvailable,
}: {
  id: string;
  open: (id: string) => void;
  back: () => void;
  state: PersonalState;
  setState: React.Dispatch<React.SetStateAction<PersonalState>>;
  toggle: (key: "completed" | "bookmarks", id: string) => void;
  tutorAvailable: boolean;
}) {
  const [detail, setDetail] = useState<LessonDetail | null>(null),
    [error, setError] = useState(""),
    [tab, setTab] = useState("board"),
    [doc, setDoc] = useState(0),
    [tutor, setTutor] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let active = true;
    get("lesson", { id })
      .then((d) => active && setDetail(d))
      .catch((e) => active && setError(e.message));
    return () => {
      active = false;
    };
  }, [id]);
  useLayoutEffect(() => {
    if (!detail) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(".lesson-paper", {
        y: 30,
        rotate: 1,
        opacity: 0,
        duration: 0.65,
        stagger: 0.1,
        ease: "power3.out",
      });
    });
    return () => mm.revert();
  }, [detail]);
  if (error)
    return (
      <div className="empty">
        {error}
        <button onClick={back}>بازگشت</button>
      </div>
    );
  if (!detail)
    return (
      <div className="loading">
        <span className="loading-dot" />
        در حال آوردن برگه‌ها…
      </div>
    );
  const s = detail.summary,
    current = detail.documents[doc];
  const focus = current?.blocks.findIndex((b) =>
    b.text
      .split("\n")[0]
      .toLowerCase()
      .includes(s.english.toLowerCase().replace(" comparison", "")),
  );
  const previewStart = focus !== undefined && focus >= 0 ? focus : 0;
  return (
    <div ref={ref}>
      <button className="text-button back" onClick={back}>
        <ArrowRight size={17} />
        بازگشت به دفتر
      </button>
      <div className="lesson-heading">
        <div>
          <span className="eyebrow muted">
            {s.category} / <bdi>{s.english}</bdi>
          </span>
          <h1>{s.title}</h1>
          <p>{s.description}</p>
        </div>
        <div className="lesson-actions">
          <button
            className="icon-button"
            aria-label="نشان کردن مبحث"
            aria-pressed={state.bookmarks.includes(id)}
            onClick={() => toggle("bookmarks", id)}
          >
            <Bookmark
              fill={state.bookmarks.includes(id) ? "currentColor" : "none"}
              size={21}
            />
          </button>
          <button
            className={state.completed.includes(id) ? "secondary" : "primary"}
            onClick={() => toggle("completed", id)}
          >
            <Check size={17} />
            {state.completed.includes(id) ? "مطالعه شد" : "مطالعه کردم"}
          </button>
        </div>
      </div>
      <div className="lesson-tabs">
        <button
          className={tab === "board" ? "active" : ""}
          onClick={() => setTab("board")}
        >
          روی تخته
        </button>
        <button
          className={tab === "source" ? "active" : ""}
          onClick={() => setTab("source")}
        >
          متن کامل جزوه <small>{fa(detail.documents.length)}</small>
        </button>
        <button
          className={tab === "practice" ? "active" : ""}
          onClick={() => setTab("practice")}
        >
          تمرین
        </button>
      </div>
      {tab === "board" ? (
        <>
          <div className="study-board">
            <div className="lesson-paper summary-paper">
              <span className="tape" />
              <span className="eyebrow">TODAY’S FOCUS</span>
              <h2>{s.title}</h2>
              <p>{s.description}</p>
              {s.formula && (
                <div className="formula" dir="ltr">
                  {s.formula}
                </div>
              )}
              <div className="dashed-rule" />
              <span className="quiet">
                از مثال شروع کن؛ بعد قاعده را پیدا کن.
              </span>
              <button className="text-button" onClick={() => setTab("source")}>
                خواندن توضیح‌ها و مثال‌های اصلی
                <ArrowUpLeft size={17} />
              </button>
            </div>
            <div className="lesson-paper reading-paper">
              <span className="eyebrow">از جزوهٔ تو</span>
              <h3>یک نگاه به یادداشت‌های کلاس</h3>
              {current ? (
                <div className="source-preview">
                  <Markdown
                    text={current.blocks
                      .slice(previewStart, previewStart + 3)
                      .map((b) => b.text)
                      .join("\n\n")}
                  />
                </div>
              ) : (
                <p>
                  این موضوع هنوز جزوهٔ مستقلی ندارد. از موضوع‌های مرتبط شروع کن.
                </p>
              )}
              <button className="text-button" onClick={() => setTab("source")}>
                ادامهٔ جزوه
                <ArrowUpLeft size={16} />
              </button>
            </div>
          </div>
          <div className="lesson-below">
            <div>
              <div className="section-head">
                <h2>حاشیه‌های این درس</h2>
                <StickyNote size={19} />
              </div>
              <Notes state={state} setState={setState} lessonId={id} compact />
            </div>
            <div className="tutor-card">
              <span className="tutor-star">✳</span>
              <h3>یه جای درس گنگه؟</h3>
              <p>از همراه مطالعه، با تکیه بر همین جزوه سؤال بپرس.</p>
              <button className="secondary" onClick={() => setTutor(true)}>
                <Sparkles size={16} />
                پرسیدن از همراه
              </button>
              <small>
                {tutorAvailable ? "متصل به Groq" : "آمادهٔ اتصال به Groq"}
              </small>
            </div>
          </div>
          <div className="section-head">
            <h2>یک اتصال دیگر</h2>
          </div>
          <div className="topic-grid related">
            {detail.related.map((l) => (
              <Topic key={l.id} lesson={l} open={open} />
            ))}
          </div>
        </>
      ) : tab === "source" ? (
        <div className="source-layout">
          <aside className="document-list">
            <span className="eyebrow muted">برگه‌های این مبحث</span>
            {detail.documents.map((d, i) => (
              <button
                key={d.id}
                className={doc === i ? "selected" : ""}
                onClick={() => setDoc(i)}
              >
                <span>{fa(i + 1)}</span>
                <span>{d.title}</span>
              </button>
            ))}
          </aside>
          <article className="source-document">
            {current ? (
              <>
                <div className="source-meta">
                  <span>متن اصلی گفت‌وگو · هنوز بازبینی نشده</span>
                  <span>
                    {fa(doc + 1)} / {fa(detail.documents.length)}
                  </span>
                </div>
                <h2>{current.title}</h2>
                {current.blocks.map((b) => (
                  <section key={b.id}>
                    <Markdown text={b.text} />
                  </section>
                ))}
                <div className="source-id" dir="ltr">
                  {current.id}
                </div>
              </>
            ) : (
              <div className="empty">
                برای این موضوع متن مستقلی ثبت نشده است.
              </div>
            )}
          </article>
        </div>
      ) : (
        <PracticePanel detail={detail} />
      )}
      {tutor && (
        <Tutor
          id={id}
          available={tutorAvailable}
          close={() => setTutor(false)}
        />
      )}
    </div>
  );
}

function PracticePanel({ detail }: { detail: LessonDetail }) {
  const [selected, setSelected] = useState<Record<string, string>>({});
  return (
    <div className="practice-list">
      {detail.practices.length ? (
        detail.practices.map((p, i) => (
          <div className="practice-card" key={p.id}>
            <span className="eyebrow muted">تمرین تکمیلی {fa(i + 1)}</span>
            <h3 dir="auto">{p.prompt}</h3>
            <div className="practice-options">
              {p.options.map((o) => (
                <button
                  dir="ltr"
                  className={selected[p.id] === o ? "selected" : ""}
                  key={o}
                  onClick={() => setSelected((s) => ({ ...s, [p.id]: o }))}
                >
                  {o}
                </button>
              ))}
            </div>
            {selected[p.id] && (
              <div role="status" className="answer">
                {p.answers.some((a) => a.text === selected[p.id])
                  ? "درسته!"
                  : "یک بار دیگر به ساختار جمله نگاه کن."}
                <p>{p.explanation.fa}</p>
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="empty">
          <BookOpen size={30} />
          <h3>این بخش جای تمرین بعدی توست.</h3>
          <p>فعلاً مثال‌های جزوه را با جمله‌های زندگی خودت بازنویسی کن.</p>
        </div>
      )}
    </div>
  );
}
