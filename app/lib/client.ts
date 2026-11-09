export const fa = (n: number) => n.toLocaleString("fa-IR");
export async function get(kind: string, params: Record<string, string> = {}) {
  const response = await fetch(
    `/api/content?${new URLSearchParams({ kind, ...params })}`,
  );
  if (!response.ok) throw Error("دریافت داده ممکن نشد. دوباره تلاش کن.");
  return response.json();
}
