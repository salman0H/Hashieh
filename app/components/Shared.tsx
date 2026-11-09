"use client";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
export function PageTitle({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description: string;
}) {
  return (
    <div className="page-title">
      <span className="eyebrow muted">{label}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}

export function Markdown({ text }: { text: string }) {
  return (
    <div className="markdown" dir="auto">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p dir="auto">{children}</p>,
          h1: ({ children }) => <h1 dir="auto">{children}</h1>,
          h2: ({ children }) => <h2 dir="auto">{children}</h2>,
          h3: ({ children }) => <h3 dir="auto">{children}</h3>,
          li: ({ children }) => <li dir="auto">{children}</li>,
          td: ({ children }) => <td dir="auto">{children}</td>,
          th: ({ children }) => <th dir="auto">{children}</th>,
          blockquote: ({ children }) => (
            <blockquote dir="auto">{children}</blockquote>
          ),
          pre: ({ children }) => <pre dir="ltr">{children}</pre>,
          code: ({ children }) => <code dir="ltr">{children}</code>,
        }}
      >
        {text.replace(
          /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,
          (_, target, label) => label || target,
        )}
      </ReactMarkdown>
    </div>
  );
}

export function Modal({
  children,
  close,
  label,
}: {
  children: React.ReactNode;
  close: () => void;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const before = document.activeElement as HTMLElement;
    document.body.style.overflow = "hidden";
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab") {
        const els = ref.current?.querySelectorAll<HTMLElement>(
          "button:not(:disabled),input,textarea,a[href]",
        );
        if (!els?.length) return;
        const first = els[0],
          last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", key);
    ref.current?.focus();
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", key);
      before?.focus();
    };
  }, [close]);
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        ref={ref}
      >
        <button
          className="modal-close icon-button"
          aria-label="بستن"
          onClick={close}
        >
          <X size={21} />
        </button>
        {children}
      </div>
    </div>
  );
}
