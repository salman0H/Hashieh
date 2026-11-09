const fs = require('node:fs');
const path = require('node:path');
const { ROOT, load } = require('./content.cjs');
const { records, relations } = load();
const counts = records.reduce((all, r) => ({ ...all, [r.type]:(all[r.type] || 0) + 1 }), {});
const entries = records.filter(r => r.type === 'entry').sort((a,b) => a.payload.lemma.localeCompare(b.payload.lemma, 'en'));
const senses = entries.reduce((sum, e) => sum + e.payload.senses.length, 0);
const missingMeanings = entries.filter(e => !e.payload.senses.length).length;
const imported = JSON.parse(fs.readFileSync(path.join(ROOT, 'imports/visible-vocabulary-rows.json')));
const originalReportPath=path.join(ROOT,'imports/original-chat-import-report.json');
const original=fs.existsSync(originalReportPath)?JSON.parse(fs.readFileSync(originalReportPath)):null;
const md = value => String(value).replaceAll('|', '\\|').replaceAll('\n', ' ');
const link = r => `[${md(r.title.en || r.title.fa)}](../content/${({subject:'subjects',source:'sources',session:'sessions',concept:'concepts',entry:'entries',collection:'collections',note:'notes',writing:'writings',correction:'corrections',exercise:'exercises',resource:'resources',policy:'policies'})[r.type]}/${r.id}.json)`;
const report = `# گزارش استخراج متن گفت‌وگو

این بسته در تاریخ ۲۰۲۶-۱۱-۰۸ تهیه شده است. استخراج اول از لینک اشتراکی فقط ۱۶ پیام در دسترس داشت. در مرحلهٔ دوم، نسخهٔ اصلی [Advanced English](https://chatgpt.com/c/6aad7536-7e08-83eb-9abf-e9948baa5e7d) در Chrome خوانده شد: ${original?.messages || 0} بدنهٔ پیام از ابتدا تا انتهای شاخهٔ فعال، شامل ${original?.userMessages || 0} پیام کاربر و ${original?.assistantMessages || 0} پاسخ دستیار، ذخیره شده‌اند. این وضعیت به معنی بازیابی فایل‌های پیوست، نسخه‌های دیگر پاسخ‌ها یا همهٔ محتوای تعاملیِ جداگانه نیست.

[متن کامل مرتب‌شده](../imports/advanced-english-transcript.txt) و [فهرست پیام‌ها](CHAT-INDEX.md) برای مرور آماده‌اند. استخراج متن و بررسی صحت آموزشی دو کار جدا هستند؛ مطالب دستیار هنوز unreviewed هستند.

## تعدادها

| مورد | تعداد |
|---|---:|
| رکوردهای مستقل، شامل منابع | ${records.length} |
| بدنهٔ پیام از نسخهٔ اصلی | ${original?.messages || 0} |
| پیام زبان‌آموز / پاسخ دستیار در نسخهٔ اصلی | ${original?.userMessages || 0} / ${original?.assistantMessages || 0} |
| نویسهٔ متن ثبت‌شده | ${original?.characters || 0} |
| بخش متنی قابل ارجاع | ${original?.sections || 0} |
| جدول حفظ‌شده از نسخهٔ اصلی | ${original?.sourceTables || 0} |
| مجموعهٔ جلسه یا یادداشتِ متصل به محتوا | ${counts.session} |
| مفهوم دسته‌بندی‌شده | ${counts.concept} |
| ردیف واژگانی از جدول‌های مرحلهٔ دوم، پیش از ادغام تکرارها | ${original?.lexicalRows || 0} |
| ردیف‌های واژگانی حفظ‌شده از استخراج اولیه | ${imported.rows.length} |
| مدخل واژه یا عبارت، همراه موارد یادداشت‌ها | ${entries.length} |
| معنای ثبت‌شده، شامل گونه‌های ترجمهٔ نیازمند ادغام | ${senses} |
| مدخل بدون معنای تفکیک‌شده | ${missingMeanings} |
| مجموعهٔ خانوادهٔ کلمات | ${records.filter(r=>r.type==='collection' && r.payload.kind==='word-family').length} |
| Writing مستقلِ مرحلهٔ اول؛ نمونه‌های دیگر در متن پاسخ‌ها محفوظ‌اند | ${counts.writing} |
| اصلاح مستقل مرحلهٔ اول؛ اصلاح‌های دیگر در متن و جدول‌ها محفوظ‌اند | ${counts.correction} |
| مجموعهٔ پاسخ تمرین با صورت سؤال مفقود | ${counts.exercise} |
| رابطهٔ پیشنهادی | ${relations.length} |
| منبع فایل یا تصویر مفقود/ارجاعی | ${counts.resource} |

## دسته‌بندی محتوای جلسات

| مجموعه | محورهای اصلی |
|---|---|
| مشاغل و آرزوها | سؤال‌سازی، would like، جمله‌های شخصی و واژگان شغلی |
| آینده و سفر آخر هفته | will، going to، قرار قبلی و جدول زمانی؛ Writing اولیه |
| تجربه‌های زندگی و خبر | حال کامل، ever/never، گذشته ساده، موصولی و Writing خبرنگاری |
| ورزش و عادت‌ها | used to، فعل‌های همراه ورزش، خانوادهٔ واژگان |
| ورزش‌های آبی و ترس | شرطی دوم، clause، عبارت‌های کاربردی و سؤال‌های واژگانی |
| تیم، سرگرمی و عبارت‌ها | حال کامل، دو معنی take up، مالکیت جمع و unless/only if |
| افعال وجهی | اجازه، توانایی، الزام، توصیه، ممنوعیت و نبود اجبار |
| یونیت ۸ | متن پاسخ کامل Get Set, Go! و مرور آن اکنون موجود است؛ تصویر اصلی هنوز جداست |
| یادداشت‌های A1–A8 | متن جزوه‌ای که کاربر داخل گفت‌وگو نوشته بود اکنون محفوظ است |
| خدمات، پوشاک، هوا و شدت‌دهنده‌ها | used to و so / such / too / enough همراه توضیح کامل |
| مرورهای تکمیلی | gerund / infinitive، stative verbs، articles، مجهول و جمله‌های موصولی |
| کار و درآمد | Employment & Career، نیازهای اساسی، خلاصه‌کردن صحبت دیگران |
| Song Lab و روش مطالعه | سه بررسی آهنگ و طرح سیستم یادگیری، با متن همان پاسخ‌ها |
| آزمون و رفع اشکال | بدنهٔ پیام‌های مربوط به آزمون و تحلیل پاسخ‌ها؛ اسناد/ابزارهای جدا ممکن است متن افزوده داشته باشند |

نام‌گذاری جلسات و conceptها در این مرحله editorial است. ترتیب موجود از صفحه گرفته شده؛ تاریخ واقعی کلاس‌ها قطعی نیست. collection ترتیب جلسات، مسیرِ پیش‌نیاز نیست.

## آنچه عمداً تکمیل نشده

- فایل واژگان ۴۷۴ ردیفی، ورک‌شیت‌ها، تصاویر و فایل‌های DeepSeek در این نوبتِ استخراج متن دانلود نشده‌اند. متنِ مربوط به آن‌ها و جدول‌های واقعاً نمایش‌داده‌شده ذخیره شده است.
- محتوای Google Doc ارجاع‌شده مستقیماً خوانده نشده؛ متن جزوه‌ای که خود کاربر داخل گفت‌وگو چسبانده بود، اکنون استخراج شده است.
- شاخهٔ فعال گفت‌وگو با ۵۴ نوبت و ۱۰۸ بدنهٔ پیام ثبت شده؛ پاسخ‌های جایگزین، نسخه‌های تاریخی یا شاخه‌های دیگر در این دامنه نیستند.
- بدنهٔ پیام‌ها و سلول‌های جدول در imports/advanced-english-original.json و رکوردهای src-original حفظ شده‌اند. این یک capture از رابط است، نه export رسمی حساب؛ بعضی برچسب‌های رابط و تعداد selectionها داخل آن باقی مانده‌اند.
- متن selectionهای نقل‌شده فقط به اندازه‌ای ثبت شده که در بدنهٔ پیام دیده می‌شد. ابزارها، آزمون‌ها و canvasهای جداگانه ممکن است متن اضافه‌ای بیرون از بدنهٔ پاسخ داشته باشند.
- همهٔ پیام‌ها در note-originalها و ۱۷۹۵ بلوک قرار دارند؛ ادغام واژگان از جدول‌ها انجام شده است. تبدیل تک‌تک مثال‌ها، Writingها و تمرین‌های داخل نثر به رکورد تخصصی مستقل هنوز انجام نشده؛ متنشان حذف نشده است.
- تعریف انگلیسیِ ناموجود با synonym پر نشده؛ مقدار آن null مانده است. ${missingMeanings} مدخل فقط رخداد در یادداشت دارند و هنوز معنی/نقش تفکیک‌شده ندارند.
- عبارت‌های مبهم مثل هم‌معنی‌گرفتن drown/sink یا لحن bookworm/swot/nerd به‌عنوان سؤال نیازمند بررسی حفظ شده‌اند.
- دو مورد از اصلاح‌ها، مثال خطای ساخته‌شده در پاسخ دستیار هستند، نه خطای مشاهده‌شده از زبان‌آموز؛ در extensions مشخص شده‌اند.
- دادهٔ نمونهٔ React وارد مطالب واقعی نشده است؛ وضعیت تسلط و تاریخ مطالعهٔ ساختگی وجود ندارد.

## خروجی آمادهٔ مرحلهٔ بعد

Schema، قالب ورود جلسه، اعتبارسنجی ارجاع‌ها، تشخیص چرخهٔ پیش‌نیاز، و تبدیل به گراف، بانک واژگان، فلش‌کارت، Markdown و ورودی بازیابی آماده‌اند. تمام رکوردهای آموزشی هنوز draft/private و unreviewed هستند. وضعیت draft به معنی کمبود ساختار نیست؛ صحت آموزشی و تکمیل منابع هنوز باید بررسی شود.
`;
fs.writeFileSync(path.join(ROOT,'docs/EXTRACTION.md'),report);
const catalog = ['# فهرست محتوای استخراج‌شده', '', 'این فهرست از JSONهای اصلی ساخته می‌شود. تمام موارد فعلاً پیش‌نویس و بررسی‌نشده‌اند.', '', '## جلسات', '', ...records.filter(r => r.type === 'session').map(r => `- ${link(r)} — ${r.payload.completeness}`), '', '## مفهوم‌ها', '', ...records.filter(r => r.type === 'concept').map(r => `- ${link(r)}`), '', '## Writing', '', ...records.filter(r => r.type === 'writing').map(r => `- ${link(r)} — ${r.payload.blocks[0].data.role}`), '', '## واژگان و عبارت‌ها', '', '| مدخل | معنی‌های منبع | خانواده |', '|---|---|---|', ...entries.map(e => `| ${link(e)} | ${md(e.payload.senses.map(s => `${s.partOfSpeech}: ${s.translation.fa || s.definition.en || 'نامشخص'}`).join(' / ') || 'نیازمند تکمیل از یادداشت')} | ${e.payload.familyId || '—'} |`), ''];
fs.writeFileSync(path.join(ROOT,'docs/CATALOG.md'),catalog.join('\n'));
console.log(`Updated extraction report and catalog (${entries.length} entries, ${senses} senses).`);
if(original){
  const capture=JSON.parse(fs.readFileSync(path.join(ROOT,'imports/advanced-english-original.json')));
  const messages=new Map(capture.messages.map(m=>[m.messageId,m]));
  const index=['# فهرست پیام‌های نسخهٔ اصلی','','۱۰۸ بدنهٔ پیام، در ۵۴ نوبت از شاخهٔ فعال گفت‌وگو. هر لینک متن همان پیام را در دادهٔ اصلی باز می‌کند.','','[رونوشت کامل متنی](../imports/advanced-english-transcript.txt)','','| نوبت | درخواست کاربر | پاسخ دستیار |','|---|---|---|'];
  for(let i=0;i<capture.chronologicalMessageIds.length;i+=2){
    const u=messages.get(capture.chronologicalMessageIds[i]),a=messages.get(capture.chronologicalMessageIds[i+1]);
    const preview=m=>md((m.headings[0]?.text||m.text.replace(/^\d+ selections?\s*/, '').split('\n').find(s=>s.trim())||m.role).slice(0,110));
    index.push(`| ${i/2+1} | [${preview(u)}](../content/notes/note-original-${u.messageId}.json) | [${preview(a)}](../content/notes/note-original-${a.messageId}.json) |`);
  }
  fs.writeFileSync(path.join(ROOT,'docs/CHAT-INDEX.md'),index.join('\n')+'\n');
}
