import "server-only";
import fs from "node:fs";
import path from "node:path";
import { labels, sessionTitles } from "./presentation";
import type {
  AppModel,
  LessonDetail,
  LessonSummary,
  SessionSummary,
  StudyDocument,
  WordEntry,
} from "./types";

// Canonical JSON deliberately stays on the server. Only requested lesson bodies cross the API.
type RecordData = {
  id: string;
  type: string;
  title: Record<string, string>;
  payload: Record<string, any>;
  provenance: { sourceRefs: { sourceId: string; locator: string }[] };
  extensions: Record<string, any>;
};
let snapshot: RecordData[] | null = null;
function files(dir: string): string[] {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) =>
      entry.isDirectory()
        ? files(path.join(dir, entry.name))
        : entry.name.endsWith(".json")
          ? [path.join(dir, entry.name)]
          : [],
    )
    .sort();
}
export function records() {
  if (!snapshot)
    snapshot = files(path.join(process.cwd(), "content"))
      .filter((p) => !p.includes(`${path.sep}relations${path.sep}`))
      .map((p) => JSON.parse(fs.readFileSync(p, "utf8")));
  return snapshot;
}
const localizedTitle = (r: RecordData) => r.title.fa || r.title.en || r.id;
export function appModel(): AppModel {
  const all = records();
  const notes = all.filter((r) => r.type === "note");
  const sequence =
    all.find((r) => r.id === "collection-original-class-sessions")?.payload
      .itemIds || [];
  const sessions: SessionSummary[] = all
    .filter((r) => r.type === "session")
    .map((r, i) => ({
      id: r.id,
      title: sessionTitles[r.id] || localizedTitle(r),
      english: r.title.en || "",
      lessonIds: r.payload.conceptIds || [],
      documents: (r.payload.itemIds || []).length,
      order: sequence.indexOf(r.id) >= 0 ? sequence.indexOf(r.id) : i,
    }))
    .sort((a, b) => a.order - b.order);
  const lessons: LessonSummary[] = all
    .filter((r) => r.type === "concept")
    .map((r) => {
      const key = r.id.replace("concept-", ""),
        meta = labels[key];
      return {
        id: r.id,
        title: meta?.fa || localizedTitle(r),
        english: r.title.en || key,
        description:
          meta?.description || "یادداشت‌ها و مثال‌های مرتبط از کلاس‌های تو.",
        category: meta?.category || "ساختار جمله",
        formula: meta?.formula,
        documents: notes.filter(
          (n) =>
            (n.payload.conceptIds || []).includes(r.id) &&
            n.id.startsWith("note-original-") &&
            n.payload.blocks?.[0]?.data.role === "assistant-source",
        ).length,
        sessionIds: sessions
          .filter((s) => s.lessonIds.includes(r.id))
          .map((s) => s.id),
      };
    });
  return {
    lessons,
    sessions,
    stats: {
      vocabulary: all.filter((r) => r.type === "entry").length,
      sessions: sessions.length,
      concepts: lessons.length,
      messages: all.filter((r) => r.id.startsWith("src-original-")).length,
    },
    subjects: all
      .filter((r) => r.type === "subject")
      .map((r) => ({ id: r.id, title: localizedTitle(r) })),
    tutorAvailable: !!process.env.GROQ_API_KEY,
  };
}
function document(r: RecordData): StudyDocument {
  return {
    id: r.id,
    title: localizedTitle(r),
    role: r.payload.blocks?.[0]?.data.role || "source",
    blocks: (r.payload.blocks || []).map((b: any) => ({
      id: b.id,
      type: b.type,
      text:
        b.data.text ||
        b.data.prompt ||
        b.data.fallbackText ||
        b.data.parts?.map((p: any) => p.text).join(" + ") ||
        b.data.columns
          ?.map((c: any) => `${c.title.en || c.title.fa}: ${c.text}`)
          .join("\n") ||
        "",
    })),
    sourceRefs: r.provenance.sourceRefs,
  };
}
export function getLesson(id: string): LessonDetail | null {
  const model = appModel();
  const summary = model.lessons.find((l) => l.id === id);
  const session = model.sessions.find((s) => s.id === id);
  if (!summary && !session) return null;
  const all = records();
  const sessionRecord = session ? all.find((r) => r.id === id) : null;
  const docs = all.filter(
    (r) =>
      r.type === "note" &&
      r.id.startsWith("note-original-") &&
      r.payload.blocks?.[0]?.data.role === "assistant-source" &&
      (sessionRecord
        ? (sessionRecord.payload.itemIds || []).includes(r.id)
        : (r.payload.conceptIds || []).includes(id)),
  );
  const key = summary?.english.toLowerCase().replace(" comparison", "") || "";
  docs.sort((a, b) => {
    const score = (r: RecordData) =>
      (r.payload.blocks || []).filter((b: any) =>
        b.data.text?.split("\n")[0].toLowerCase().includes(key),
      ).length;
    return score(b) - score(a);
  });
  const related = model.lessons
    .filter(
      (l) =>
        l.id !== id &&
        (session
          ? session.lessonIds.includes(l.id)
          : l.category === summary?.category),
    )
    .slice(0, 4);
  const practices = all
    .filter(
      (r) =>
        r.type === "exercise" &&
        r.payload.mode === "practice" &&
        r.payload.gradable &&
        (r.payload.conceptIds || []).includes(id),
    )
    .map((r) => ({
      id: r.id,
      prompt: r.payload.prompt,
      options: r.payload.options,
      answers: r.payload.answers,
      explanation: r.payload.explanation,
    }));
  return {
    summary: summary || {
      id: session!.id,
      title: session!.title,
      english: session!.english,
      category: "جلسهٔ کلاس",
      description: "یادداشت کامل این جلسه، با مثال‌ها و توضیح‌های کلاس.",
      documents: docs.length,
      sessionIds: [session!.id],
    },
    documents: docs.map(document),
    related,
    practices,
  };
}
export function getWords(
  query = "",
  page = 0,
  family?: string,
): { items: WordEntry[]; total: number } {
  const q = query.toLocaleLowerCase().trim();
  const list = records()
    .filter(
      (r) =>
        r.type === "entry" &&
        (!family || r.payload.familyId === family) &&
        (!q ||
          JSON.stringify([
            r.payload.lemma,
            ...(r.payload.senses || []).map((s: any) => s.translation.fa || ""),
          ])
            .toLocaleLowerCase()
            .includes(q)),
    )
    .sort((a, b) => a.payload.lemma.localeCompare(b.payload.lemma));
  return {
    items: list.slice(page * 24, page * 24 + 24).map((r) => ({
      id: r.id,
      word: r.payload.lemma,
      familyId: r.payload.familyId,
      senses: r.payload.senses,
    })),
    total: list.length,
  };
}
export function getReviewWords(): WordEntry[] {
  const priorities =
    records().find((r) => r.id === "collection-priority-a")?.payload.itemIds ||
    [];
  return records()
    .filter(
      (r) =>
        r.type === "entry" &&
        priorities.includes(r.id) &&
        r.payload.senses.some((s: any) => s.translation.fa),
    )
    .map((r) => ({
      id: r.id,
      word: r.payload.lemma,
      familyId: r.payload.familyId,
      senses: r.payload.senses,
    }));
}
export function search(query: string) {
  const model = appModel(),
    q = query.toLocaleLowerCase().trim();
  return {
    lessons: model.lessons
      .filter((l) => `${l.title} ${l.english}`.toLocaleLowerCase().includes(q))
      .slice(0, 5),
    sessions: model.sessions
      .filter((s) => `${s.title} ${s.english}`.toLocaleLowerCase().includes(q))
      .slice(0, 3),
    words: q ? getWords(q).items.slice(0, 5) : [],
  };
}
