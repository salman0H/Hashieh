"use client";
import { fa } from "../lib/client";
import { Home, Sessions } from "./Home";
import SearchDialog from "./SearchDialog";
import Review from "./Review";
import Vocabulary from "./Vocabulary";
import Notes from "./Notes";
import Lesson from "./Lesson";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import gsap from "gsap";
import {
  BookOpen,
  ChevronLeft,
  Layers3,
  Menu,
  Moon,
  Search,
  StickyNote,
  Sun,
  RotateCcw,
  Network,
} from "lucide-react";
import { usePersonal } from "./usePersonal";
import type { AppModel } from "../lib/types";
const navigation = [
  { id: "map", label: "نقشهٔ یادگیری", icon: Network },
  { id: "sessions", label: "جلسه‌های کلاس", icon: BookOpen },
  { id: "words", label: "واژه‌نامه", icon: Layers3 },
  { id: "review", label: "زمان مرور", icon: RotateCcw },
  { id: "notes", label: "یادداشت‌های من", icon: StickyNote },
];
export default function Workspace({ model }: { model: AppModel }) {
  const { state, setState, ready, error } = usePersonal();
  const [view, setView] = useState("map"),
    [lesson, setLesson] = useState<string | null>(null),
    [search, setSearch] = useState(false),
    [mobile, setMobile] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const open = useCallback(
    (id: string) => {
      setLesson(id);
      setMobile(false);
      setState((s) => ({ ...s, lastLesson: id }));
      history.pushState({}, "", `?lesson=${encodeURIComponent(id)}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [setState],
  );
  useEffect(() => {
    const sync = () =>
      setLesson(new URLSearchParams(location.search).get("lesson"));
    sync();
    window.addEventListener("popstate", sync);
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearch((s) => !s);
      }
      if (e.key === "Escape") {
        setSearch(false);
        setMobile(false);
      }
    };
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener("keydown", key);
    };
  }, []);
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(".enter", {
        y: 22,
        opacity: 0,
        duration: 0.75,
        stagger: 0.09,
        ease: "power3.out",
      });
    });
    return () => mm.revert();
  }, []);
  const go = (id: string) => {
    setView(id);
    setLesson(null);
    setMobile(false);
    history.pushState({}, "", location.pathname);
  };
  const toggle = (key: "completed" | "bookmarks", id: string) =>
    setState((s) => ({
      ...s,
      [key]: s[key].includes(id)
        ? s[key].filter((v) => v !== id)
        : [...s[key], id],
    }));
  return (
    <div ref={root} className="workspace">
      <aside className={`sidebar ${mobile ? "mobile-open" : ""}`}>
        <a className="brand" href="/" aria-label="حاشیه، خانه">
          <span className="brand-mark">حـ</span>
          <span>
            حاشیه<small>جایی برای وصل کردن آموخته‌ها</small>
          </span>
        </a>
        <div className="subject-switch">
          <span className="subject-icon">En</span>
          <div>
            <strong>اتاق زبان انگلیسی</strong>
            <small>دفتر یادگیری شخصی</small>
          </div>
          <span className="small-dot" />
        </div>
        <span className="nav-label">روی میز من</span>
        <nav>
          {navigation.map((n) => (
            <button
              key={n.id}
              className={view === n.id && !lesson ? "active" : ""}
              onClick={() => go(n.id)}
            >
              <n.icon size={19} />
              {n.label}
              {n.id === "notes" && state.stickies.length > 0 && (
                <small>{fa(state.stickies.length)}</small>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="room-note">
            <span>فضای رشد دارد.</span>
            <p>امروز زبان، فردا هر چیزی که کنجکاوت می‌کند.</p>
            <span className="tiny-orbit">✳</span>
          </div>
          <span className="edition">HASHIYEH / PERSONAL EDITION</span>
        </div>
      </aside>
      {mobile && (
        <button
          className="sidebar-scrim"
          aria-label="بستن منو"
          onClick={() => setMobile(false)}
        />
      )}
      <main className="main">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu"
              onClick={() => setMobile(!mobile)}
              aria-label="منو"
            >
              <Menu size={20} />
            </button>
            <span>فضای یادگیری</span>
            <ChevronLeft size={13} />
            <b>انگلیسی</b>
          </div>
          <div className="top-actions">
            <button
              aria-label="جست‌وجو در دفتر"
              className="search-trigger"
              onClick={() => setSearch(true)}
            >
              <Search size={17} />
              <span>دنبال چی می‌گردی؟</span>
              <kbd>⌘ K</kbd>
            </button>
            <button
              className="icon-button"
              aria-label="تغییر پوسته"
              onClick={() =>
                setState((s) => ({
                  ...s,
                  theme: s.theme === "paper" ? "ink" : "paper",
                }))
              }
            >
              {state.theme === "paper" ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <span className="avatar">س</span>
          </div>
        </header>
        {error && (
          <div role="alert" className="notice">
            {error}
          </div>
        )}
        <div className="page-content" key={lesson || view}>
          {lesson ? (
            <Lesson
              id={lesson}
              open={open}
              back={() => go(view)}
              state={state}
              setState={setState}
              toggle={toggle}
              tutorAvailable={model.tutorAvailable}
            />
          ) : view === "map" ? (
            <Home model={model} state={state} open={open} go={go} />
          ) : view === "sessions" ? (
            <Sessions model={model} open={open} />
          ) : view === "words" ? (
            <Vocabulary state={state} toggle={toggle} />
          ) : view === "review" ? (
            <Review state={state} setState={setState} />
          ) : (
            <Notes state={state} setState={setState} />
          )}
        </div>
        <footer className="page-footer">
          <span>آموختن، یک مسیر شخصی‌ست.</span>
          <span>
            ساخته‌شده از گفت‌وگوها و کلاس‌های تو{" "}
            <span className="footer-star">✳</span>
          </span>
        </footer>
      </main>
      {search && (
        <SearchDialog
          close={() => setSearch(false)}
          open={(id) => {
            setSearch(false);
            open(id);
          }}
        />
      )}
      {!ready && <span className="sr-only">در حال خواندن پیشرفت</span>}
    </div>
  );
}
