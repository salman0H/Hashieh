"use client";
import { useState } from "react";
import { ArrowLeft, BookOpen, LockKeyhole } from "lucide-react";
export default function Login({ configured }: { configured: boolean }) {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <main className="login-page">
      <div className="login-art" aria-hidden="true">
        <span>
          هر چیزی که یاد می‌گیری،
          <br />
          اینجا به هم می‌رسد.
        </span>
        <BookOpen size={88} />
      </div>
      <section className="login-card">
        <div className="brand">
          <span className="brand-mark">حـ</span>
          <div>
            <strong>حاشیه</strong>
            <small>فضای یادگیری تو</small>
          </div>
        </div>
        <LockKeyhole size={26} />
        <h1>برگردیم به یادگیری.</h1>
        <p>
          {configured
            ? "برای ورود به فضای شخصی مطالعه، رمزت را وارد کن."
            : "این فضای مطالعه هنوز برای دسترسی آنلاین تنظیم نشده است."}
        </p>
        {configured ? (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError("");
              try {
                const r = await fetch("/api/auth", {
                  method: "POST",
                  body: new FormData(e.currentTarget),
                });
                const d = await r.json();
                if (r.ok) window.location.reload();
                else setError(d.error);
              } catch {
                setError("ارتباط برقرار نشد. دوباره امتحان کن.");
              } finally {
                setBusy(false);
              }
            }}
          >
            <label htmlFor="password">رمز فضای مطالعه</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
            <p role="alert">{error}</p>
            <button className="primary" disabled={busy}>
              {busy ? "در حال ورود…" : "ورود به حاشیه"}
              <ArrowLeft size={18} />
            </button>
          </form>
        ) : (
          <div className="setup-note">
            مالک سایت باید SITE_PASSWORD و SESSION_SECRET را در تنظیمات محیطی
            Vercel قرار دهد.
          </div>
        )}
      </section>
    </main>
  );
}
