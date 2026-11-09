# Markdown در حاشیه / Markdown in Hashiyeh

قالب شروع: [lesson.md](../templates/lesson.md)

## دو مسیر واردکردن

- **شخصی / Personal:** در «یادداشت‌های من» یا داخل درس، فایل `.md` را انتخاب کن. فایل حداکثر یک مگابایت، روی مرورگر ذخیره می‌شود. با «نمای خواندن Markdown» خروجی را ببین؛ متن اصلی همچنان قابل ویرایش است. این کار GitHub یا دادهٔ مرجع سرور را تغییر نمی‌دهد.
- **محتوای مخزن / Repository:** `npm run import:markdown -- file.md concept-present-perfect note-md-unique-name` را اجرا کن. پس از بررسی، `--write` اضافه کن. عنوان از اولین H1 گرفته می‌شود. شناسهٔ مفهوم باید موجود باشد. فایل موجود بازنویسی نمی‌شود. سپس اعتبارسنجی و deploy مجدد.

## قرارداد نوشتن

هر زبان را در پاراگراف جدا بنویس. مرورگر جهت هر پاراگراف، عنوان، مورد فهرست و سلول جدول را از اولین نویسهٔ قوی تشخیص می‌دهد. کلمه‌های کوتاه انگلیسی داخل توضیح فارسی را داخل backtick بنویس تا مستقل نمایش داده شوند. متن‌های ترکیبی پیچیده را با جملهٔ فارسی شروع کن؛ عنوان انگلیسی را در خط جدا بگذار. کدها همیشه LTR هستند.

Use separate paragraphs for separate languages. Each block uses automatic first-strong-character direction; inline code is isolated as LTR. Keep a blank line between paragraphs and around headings, lists and tables.

## پشتیبانی فعلی / Supported

- Heading, paragraphs, emphasis, links, blockquotes, lists.
- GFM tables, task lists, strikethrough and fenced code blocks.
- `[[Target|Label]]` and `[[Target]]` display their readable labels. These are not resolved vault links yet.
- Raw HTML is not executed. MDX/JavaScript is not executed.

## تفاوت با Obsidian / Boundaries

YAML frontmatter is not parsed into metadata; omit it in this starter. Vault graph discovery, `![[embeds]]`, attachment resolution, Obsidian callout styling, Dataview, math rendering and plugins are not implemented. Use standard Markdown blockquotes for callouts and standard links for navigation. There is no syntax highlighting yet.

Legacy captured plain text may contain flattened tables. Direction and typography improvements do not reconstruct lost table structure automatically; rewrite those sections as GFM tables in a reviewed Markdown lesson when needed.
