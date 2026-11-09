"use client";
import { useState } from "react";
import { ArrowUpLeft, Check, Layers3, Network } from "lucide-react";
import type { AppModel, PersonalState, LessonSummary } from "../lib/types";
import { fa } from "../lib/client";
import { PageTitle } from "./Shared";
import Board from "./Board";
export function Home({
  model,
  state,
  open,
  go,
}: {
  model: AppModel;
  state: PersonalState;
  open: (id: string) => void;
  go: (v: string) => void;
}) {
  const [all, setAll] = useState(false),
    [category, setCategory] = useState("همه");
  const categories = ["همه", ...new Set(model.lessons.map((l) => l.category))];
  const resume =
    model.lessons.find((l) => l.id === state.lastLesson) ||
    model.lessons.find((l) => l.id === "concept-present-perfect") ||
    model.lessons[0];
  return (
    <>
      <section className="hero enter">
        <div>
          <span className="eyebrow">
            <span />
            یک کلاس، هزار اتصال تازه
          </span>
          <h1>
            یاد گرفتن،
            <br />
            <span className="hand-underline">به هم وصل می‌شه.</span>
            <span className="hero-asterisk">✳</span>
          </h1>
          <p>
            چیزهایی که سر کلاس یاد می‌گیری، اینجا کنار هم جا می‌گیرن.
            <br />
            یک مبحث رو بردار، کشف کن و به زبان خودت یادداشت کن.
          </p>
          <div className="hero-actions">
            <button className="primary" onClick={() => open(resume.id)}>
              بریم سراغ {resume.title}
              <ArrowUpLeft size={18} />
            </button>
            <span className="quiet">با ریتم خودت ادامه بده</span>
          </div>
        </div>
        <div className="hero-paper">
          <span className="tape" />
          <span className="scribble">a little every day.</span>
          <p>
            قرار نیست همه‌چیز رو
            <br />
            یک‌باره یاد بگیری.
          </p>
          <div className="paper-rule" />
          <small>
            {fa(state.completed.length)} مبحث مطالعه‌شده
            <br />
            از {fa(model.stats.concepts)} مبحث در دفترت
          </small>
          <svg viewBox="0 0 120 50" aria-hidden="true">
            <path d="M5 35 Q35 5 70 25 T112 12 M103 10 L114 11 L110 23" />
          </svg>
        </div>
      </section>
      <section className="map-section enter">
        <div className="section-head">
          <div>
            <span className="eyebrow muted">THE BIG PICTURE</span>
            <h2>
              تختهٔ مسیر یادگیری{" "}
              <span className="count">{fa(model.stats.concepts)} مبحث</span>
            </h2>
          </div>
          <div className="segmented">
            <button
              className={!all ? "selected" : ""}
              onClick={() => setAll(false)}
            >
              <Network size={15} />
              نقشه
            </button>
            <button
              className={all ? "selected" : ""}
              onClick={() => setAll(true)}
            >
              <Layers3 size={15} />
              همهٔ مباحث
            </button>
          </div>
        </div>
        {all ? (
          <>
            <div className="chips">
              {categories.map((c) => (
                <button
                  className={c === category ? "selected" : ""}
                  key={c}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="topic-grid">
              {model.lessons
                .filter((l) => category === "همه" || l.category === category)
                .map((l) => (
                  <Topic
                    key={l.id}
                    lesson={l}
                    open={open}
                    done={state.completed.includes(l.id)}
                  />
                ))}
            </div>
          </>
        ) : (
          <Board
            lessons={model.lessons}
            completed={state.completed}
            open={open}
          />
        )}
      </section>
      <section className="under-board enter">
        <div className="section-head">
          <div>
            <span className="eyebrow muted">FROM YOUR CLASSROOM</span>
            <h2>از کلاس تا اینجا</h2>
          </div>
          <button className="text-button" onClick={() => go("sessions")}>
            همهٔ {fa(model.stats.sessions)} جلسه
            <ArrowUpLeft size={16} />
          </button>
        </div>
        <div className="session-strip">
          {model.sessions
            .slice(-3)
            .reverse()
            .map((s, i) => (
              <button key={s.id} onClick={() => open(s.id)}>
                <span className="session-index">
                  {String(model.sessions.length - i).padStart(2, "0")}
                </span>
                <div>
                  <small>یادداشت‌های کلاس</small>
                  <h3>{s.title}</h3>
                  <span>{fa(s.documents)} بخش در این جلسه</span>
                </div>
                <ArrowUpLeft size={19} />
              </button>
            ))}
        </div>
        <div className="data-caption">
          <span>
            <b>{fa(model.stats.vocabulary)}</b> واژه از گفت‌وگوهای تو
          </span>
          <span>
            <b>{fa(model.stats.messages)}</b> پیام در آرشیو درس‌ها
          </span>
          <span>هر هفته، یک تکهٔ تازه به این نقشه.</span>
        </div>
      </section>
    </>
  );
}

export function Topic({
  lesson: l,
  open,
  done = false,
}: {
  lesson: LessonSummary;
  open: (id: string) => void;
  done?: boolean;
}) {
  return (
    <button className="topic-card" onClick={() => open(l.id)}>
      <span className="eyebrow muted">
        {l.category}
        {done && <Check size={15} />}
      </span>
      <h3>{l.title}</h3>
      <small dir="ltr">{l.english}</small>
      <p>{l.description}</p>
      <span className="text-button">
        ورود به مبحث
        <ArrowUpLeft size={16} />
      </span>
    </button>
  );
}

export function Sessions({
  model,
  open,
}: {
  model: AppModel;
  open: (id: string) => void;
}) {
  return (
    <>
      <PageTitle
        label="THE CLASS JOURNAL"
        title="جلسه‌ها، به ترتیبِ یاد گرفتن"
        description="هر جلسه، با توضیح‌ها و مثال‌های همان گفت‌وگو."
      />
      <div className="sessions-list">
        {model.sessions.map((s, i) => (
          <button key={s.id} onClick={() => open(s.id)}>
            <span className="session-index">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <h3>{s.title}</h3>
              <p>
                {fa(s.documents)} بخش · {fa(s.lessonIds.length)} موضوع مرتبط
              </p>
            </div>
            <ArrowUpLeft size={22} />
          </button>
        ))}
      </div>
    </>
  );
}
