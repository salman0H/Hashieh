"use client";
import { useState } from "react";
import { Download, Plus, X } from "lucide-react";
import type { PersonalState, Sticky } from "../lib/types";
import { PageTitle } from "./Shared";
export default function Notes({
  state,
  setState,
  lessonId,
  compact = false,
}: {
  state: PersonalState;
  setState: React.Dispatch<React.SetStateAction<PersonalState>>;
  lessonId?: string;
  compact?: boolean;
}) {
  const [text, setText] = useState(""),
    [color, setColor] = useState<Sticky["color"]>("yellow");
  const notes = state.stickies.filter(
    (n) => !lessonId || n.lessonId === lessonId,
  );
  const add = () => {
    if (!text.trim()) return;
    setState((s) => ({
      ...s,
      stickies: [
        {
          id: crypto.randomUUID(),
          text: text.trim(),
          color,
          lessonId: lessonId || null,
          createdAt: new Date().toISOString(),
        },
        ...s.stickies,
      ],
    }));
    setText("");
  };
  const download = () => {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(state, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "hashiyeh-personal.json";
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <>
      {!compact && (
        <PageTitle
          label="THOUGHTS ON PAPER"
          title="حاشیه‌ها هم بخشی از درس‌اند."
          description="چیزهایی که با زبان خودت می‌نویسی، بهتر می‌مانند. این برگه‌ها روی مرورگر تو ذخیره می‌شوند."
        />
      )}
      <div className="note-composer">
        <textarea
          maxLength={4000}
          aria-label="متن یادداشت تازه"
          placeholder="یک مثال، یک سؤال، یک چیزی که نمی‌خوای یادت بره…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div>
          <div className="color-picks">
            {(["yellow", "pink", "blue"] as const).map((c) => (
              <button
                key={c}
                aria-label={`رنگ ${c}`}
                aria-pressed={color === c}
                className={`color-${c} ${color === c ? "selected" : ""}`}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
          <button
            className="primary small"
            disabled={!text.trim()}
            onClick={add}
          >
            <Plus size={16} />
            چسباندن یادداشت
          </button>
        </div>
      </div>
      <div className="notes-grid">
        {notes.map((n) => (
          <div className={`personal-note paper-${n.color}`} key={n.id}>
            <span className="tape" />
            <textarea
              aria-label="ویرایش یادداشت"
              value={n.text}
              onChange={(e) =>
                setState((s) => ({
                  ...s,
                  stickies: s.stickies.map((item) =>
                    item.id === n.id ? { ...item, text: e.target.value } : item,
                  ),
                }))
              }
            />
            <div>
              <small>{new Date(n.createdAt).toLocaleDateString("fa-IR")}</small>
              <button
                className="icon-button"
                aria-label="حذف یادداشت"
                onClick={() =>
                  setState((s) => ({
                    ...s,
                    stickies: s.stickies.filter((item) => item.id !== n.id),
                  }))
                }
              >
                <X size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
      {!compact && (
        <button className="text-button export-button" onClick={download}>
          <Download size={17} />
          دریافت نسخهٔ یادداشت‌ها و پیشرفت
        </button>
      )}
    </>
  );
}
