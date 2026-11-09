import { NextResponse } from "next/server";
import { authorized } from "@/app/lib/auth";
import {
  getLesson,
  getWords,
  getReviewWords,
  search,
} from "@/app/lib/repository";
export const runtime = "nodejs";
export async function GET(request: Request) {
  if (!(await authorized()))
    return NextResponse.json(
      { error: "ابتدا وارد فضای مطالعه شو." },
      { status: 401 },
    );
  const url = new URL(request.url),
    kind = url.searchParams.get("kind");
  let result: unknown;
  if (kind === "lesson") {
    result = getLesson(url.searchParams.get("id") || "");
    if (!result)
      return NextResponse.json({ error: "این درس پیدا نشد." }, { status: 404 });
  } else if (kind === "vocabulary")
    result = getWords(
      (url.searchParams.get("q") || "").slice(0, 200),
      Math.max(0, Math.min(10000, Number(url.searchParams.get("page")) || 0)),
      url.searchParams.get("family") || undefined,
    );
  else if (kind === "review") result = { items: getReviewWords() };
  else if (kind === "search")
    result = search((url.searchParams.get("q") || "").slice(0, 200));
  else
    return NextResponse.json(
      { error: "درخواست نامعتبر است." },
      { status: 400 },
    );
  return NextResponse.json(result, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
