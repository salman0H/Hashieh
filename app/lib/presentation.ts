// Presentation metadata belongs here, independently of canonical learning content.
export const labels: Record<
  string,
  { fa: string; description: string; formula?: string; category?: string }
> = {
  "present-simple": {
    fa: "حال ساده",
    description: "از عادت‌ها و واقعیت‌های روزمره شروع کن.",
    formula: "Subject + verb (s/es)",
    category: "زمان‌ها",
  },
  "past-simple": {
    fa: "گذشتهٔ ساده",
    description: "روایت اتفاق‌هایی که در گذشته تمام شده‌اند.",
    formula: "Subject + past verb",
    category: "زمان‌ها",
  },
  "past-continuous": {
    fa: "گذشتهٔ استمراری",
    description: "اتفاقی که در لحظه‌ای از گذشته جریان داشت.",
    formula: "was / were + verb-ing",
    category: "زمان‌ها",
  },
  "present-continuous": {
    fa: "حال استمراری",
    description: "اتفاق‌های در جریان و قرارهای آینده.",
    formula: "am / is / are + verb-ing",
    category: "زمان‌ها",
  },
  "present-perfect": {
    fa: "حال کامل",
    description: "پلی میان تجربه‌های گذشته و همین حالا.",
    formula: "have / has + past participle",
    category: "زمان‌ها",
  },
  "present-perfect-continuous": {
    fa: "حال کامل استمراری",
    description: "وقتی خودِ فعالیت و مدت آن مهم است.",
    formula: "have / has been + verb-ing",
    category: "زمان‌ها",
  },
  "past-perfect": {
    fa: "گذشتهٔ کامل",
    description: "اتفاقی پیش از اتفاق دیگری در گذشته.",
    formula: "had + past participle",
    category: "زمان‌ها",
  },
  "past-perfect-continuous": {
    fa: "گذشتهٔ کامل استمراری",
    description: "مدت یک فعالیت، قبل از نقطه‌ای در گذشته.",
    formula: "had been + verb-ing",
    category: "زمان‌ها",
  },
  "future-forms": {
    fa: "ساختارهای آینده",
    description: "تفاوت تصمیم، قصد، قرار و برنامهٔ زمانی.",
    formula: "will · going to · present tenses",
    category: "زمان‌ها",
  },
  "relative-clauses": {
    fa: "جمله‌های موصولی",
    description: "اطلاعات بیشتر، با who و which و that.",
    formula: "who · which · that · where",
    category: "ساختار جمله",
  },
  "zero-conditional": {
    fa: "شرطی نوع صفر",
    description: "شرط‌هایی برای حقیقت‌ها و نتیجه‌های عمومی.",
    category: "شرطی‌ها",
  },
  "first-conditional": {
    fa: "شرطی نوع اول",
    description: "شرط و نتیجه‌ای ممکن در آینده.",
    category: "شرطی‌ها",
  },
  "second-conditional": {
    fa: "شرطی نوع دوم",
    description: "دربارهٔ موقعیت‌های فرضی حرف بزن.",
    formula: "if + past, would + verb",
    category: "شرطی‌ها",
  },
  "third-conditional": {
    fa: "شرطی نوع سوم",
    description: "اگر گذشته طور دیگری پیش می‌رفت…",
    category: "شرطی‌ها",
  },
  modals: {
    fa: "افعال وجهی",
    description: "توانایی، اجازه، توصیه و الزام را جدا کن.",
    formula: "can · should · must · may",
    category: "ساختار جمله",
  },
  "modal-base-form": {
    fa: "فعل بعد از Modal",
    description: "ساختار سادهٔ فعل پس از افعال وجهی.",
    category: "ساختار جمله",
  },
  "mustnt-vs-dont-have-to": {
    fa: "ممنوعیت یا اختیار؟",
    description: "تفاوت مهم mustn’t و don’t have to.",
    category: "ساختار جمله",
  },
  "gerund-infinitive": {
    fa: "مصدر و فرم ing",
    description: "کجا to و کجا ing به فعل وصل می‌شود؟",
    formula: "to + verb / verb-ing",
    category: "ساختار جمله",
  },
  "passive-voice": {
    fa: "مجهول",
    description: "وقتی توجه روی کار است و نه انجام‌دهنده.",
    category: "ساختار جمله",
  },
  "stative-verbs": {
    fa: "افعال حالتی",
    description: "تفاوت حالت و فعالیت را در جمله ببین.",
    category: "ساختار جمله",
  },
  articles: {
    fa: "حروف تعریف",
    description: "کاربرد a، an و the در مثال‌های کلاس.",
    category: "ساختار جمله",
  },
  "parts-of-speech": {
    fa: "اجزای کلام",
    description: "نقش واژه‌ها در ساختن یک جمله.",
    category: "پایه‌ها",
  },
  "so-such-too-enough": {
    fa: "شدت و مقدار",
    description: "مقایسهٔ so، such، too و enough.",
    category: "ساختار جمله",
  },
  "used-to": {
    fa: "عادت‌های گذشته",
    description: "از چیزهایی بگو که قبلاً انجام می‌دادی.",
    formula: "used to + base verb",
    category: "زمان‌ها",
  },
  "word-families": {
    fa: "خانوادهٔ واژه‌ها",
    description: "از یک واژه به اسم، فعل، صفت و قید برس.",
    category: "واژگان",
  },
  "phrasal-verbs": {
    fa: "فعل‌های عبارتی",
    description: "واژه‌هایی که کنار هم معنای تازه می‌سازند.",
    category: "واژگان",
  },
  "vocabulary-in-context": {
    fa: "واژگان در متن",
    description: "کلمه‌ها را در جمله و موقعیت یاد بگیر.",
    category: "واژگان",
  },
  writing: {
    fa: "کارگاه نوشتن",
    description: "متن‌های خودت، بازنویسی‌ها و دلیل اصلاح‌ها.",
    category: "مهارت‌ها",
  },
  questions: {
    fa: "سؤال‌سازی",
    description: "از مثال‌های کلاس، سؤال‌های درست بساز.",
    category: "ساختار جمله",
  },
  "would-like": {
    fa: "خواسته‌ها و آرزوها",
    description: "دربارهٔ علاقه و خواسته‌هایت صحبت کن.",
    category: "ساختار جمله",
  },
  permission: {
    fa: "اجازه",
    description: "درخواست اجازه و بیان مجاز بودن.",
    category: "ساختار جمله",
  },
  ability: {
    fa: "توانایی",
    description: "کاری که می‌توانی یا خواهی توانست انجام بدهی.",
    category: "ساختار جمله",
  },
  advice: {
    fa: "توصیه و پیشنهاد",
    description: "چگونه توصیه کنیم و پیشنهاد بدهیم؟",
    category: "ساختار جمله",
  },
  obligation: {
    fa: "الزام",
    description: "must و have to در مثال‌های واقعی.",
    category: "ساختار جمله",
  },
  prohibition: {
    fa: "ممنوعیت",
    description: "چیزی که اجازهٔ انجامش را نداریم.",
    category: "ساختار جمله",
  },
  "no-obligation": {
    fa: "نبود اجبار",
    description: "کاری که انجام‌دادنش ضروری نیست.",
    category: "ساختار جمله",
  },
  timetables: {
    fa: "برنامه‌های زمانی",
    description: "حال ساده برای حرکت قطار و زمان شروع کلاس.",
    category: "زمان‌ها",
  },
  will: {
    fa: "آینده با will",
    description: "تصمیم‌ها، پیشنهادها و پیش‌بینی‌ها.",
    category: "زمان‌ها",
  },
  "going-to": {
    fa: "آینده با going to",
    description: "قصد قبلی و پیش‌بینی با نشانه‌ها.",
    category: "زمان‌ها",
  },
  "life-experiences": {
    fa: "تجربه‌های زندگی",
    description: "از تجربه‌هایت با ever و never بگو.",
    category: "مهارت‌ها",
  },
  "unless-only-if": {
    fa: "Unless و only if",
    description: "شرط‌ها را از زاویه‌ای دیگر بیان کن.",
    category: "شرطی‌ها",
  },
  "possessive-plurals": {
    fa: "مالکیت جمع",
    description: "جای درست آپاستروف در اسم‌های جمع.",
    category: "ساختار جمله",
  },
  "sports-collocations": {
    fa: "ورزش و ترکیب واژه‌ها",
    description: "Do، play و go کنار نام ورزش‌ها.",
    category: "واژگان",
  },
  clauses: {
    fa: "جمله‌واره‌ها",
    description: "اجزای کوچک‌ترِ جمله‌های کامل.",
    category: "ساختار جمله",
  },
  "reported-speech": {
    fa: "نقل قول غیرمستقیم",
    description: "بازگفتن حرف‌های دیگران.",
    category: "ساختار جمله",
  },
};
export const boardNodes = [
  { key: "present-simple", x: 20, y: 165, rotate: -2 },
  { key: "past-simple", x: 290, y: 40, rotate: 1.5 },
  { key: "present-perfect", x: 290, y: 305, rotate: -1.5 },
  { key: "future-forms", x: 560, y: 165, rotate: 2 },
  { key: "relative-clauses", x: 830, y: 40, rotate: -1 },
  { key: "modals", x: 830, y: 305, rotate: 1.5 },
  { key: "second-conditional", x: 1100, y: 165, rotate: -2 },
];
// These are visual topic connections, not asserted prerequisites or content locks.
export const boardConnections = [
  [0, 1],
  [0, 2],
  [1, 3],
  [2, 3],
  [3, 4],
  [3, 5],
  [4, 6],
  [5, 6],
];
export const sessionTitles: Record<string, string> = {
  "session-jobs": "مشاغل و آرزوها",
  "session-future": "قرارهای آینده و سفر آخر هفته",
  "session-experiences-news": "تجربه‌های زندگی و خبر",
  "session-sports-habits": "ورزش و عادت‌های گذشته",
  "session-water-sports": "ورزش‌های آبی و غلبه بر ترس",
  "session-team-spirit": "روحیهٔ تیمی و سرگرمی‌ها",
  "session-modals": "اجازه، توصیه و الزام",
  "session-unit-8": "یونیت ۸؛ آماده، حرکت!",
  "session-original-a6ec72fa": "جزوهٔ پایه؛ جلسات A1 تا A8",
  "session-original-d63a3c02": "از خرید تا حرف‌زدن دربارهٔ هوا",
  "session-original-1920ed9d": "پیشرفت زبان و عبارت‌های روزمره",
  "session-original-77659a96": "گرامر تکمیلی و یونیت ۷",
  "session-original-22cf3704": "کار، رستوران و گرامر روزمره",
  "session-original-04d90228": "احساسات، انتظارها و نوشتن",
  "session-original-98593651": "دنیای کار و استخدام",
  "session-original-f631f914": "شرطی نوع صفر و اول",
  "session-original-0bf90c5f": "مرور شرطی‌ها و مکالمه",
  "session-original-ab3a1c6d": "درآمد، نیازها و خلاصه‌گویی",
  "session-original-1fc4fb80": "مرور یونیت ۸ و زمان‌های کامل",
};
