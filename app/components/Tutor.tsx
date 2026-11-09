"use client";
import { useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { Modal, Markdown } from "./Shared";
export default function Tutor({
  id,
  available,
  close,
}: {
  id: string;
  available: boolean;
  close: () => void;
}) {
  const [question, setQuestion] = useState(""),
    [answer, setAnswer] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function ask() {
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: id, question }),
      });
      const d = await r.json();
      if (!r.ok) throw Error(d.error || "پاسخ دریافت نشد.");
      setAnswer(d.text);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal close={close} label="همراه مطالعه">
      <div className="tutor-dialog">
        <Sparkles size={30} />
        <h2>با هم بازش کنیم.</h2>
        <p>پاسخ‌ها بر پایهٔ جزوهٔ همین مبحث ساخته می‌شوند.</p>
        {!available ? (
          <div className="notice">
            برای فعال‌شدن همراه، کلید GROQ_API_KEY را در تنظیمات سرور اضافه کن.
            جزوه و تمام امکانات مطالعه بدون این اتصال کار می‌کنند.
          </div>
        ) : (
          <>
            <textarea
              aria-label="سؤال از همراه"
              maxLength={2000}
              placeholder="مثلاً چرا در این مثال از این زمان استفاده شده؟"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <button
              className="primary"
              disabled={busy || !question.trim()}
              onClick={ask}
            >
              {busy ? "در حال خواندن جزوه…" : "پرسیدن"}
              <Send size={16} />
            </button>
            {error && <p role="alert">{error}</p>}
            {answer && <Markdown text={answer} />}
          </>
        )}
      </div>
    </Modal>
  );
}
