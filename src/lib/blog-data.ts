export interface BlogPost {
  slug: string;
  title: string;
  titleEn: string;
  excerpt: string;
  excerptEn: string;
  date: string;
  readTime: string;
  category: string;
  categoryEn: string;
  content: string; // markdown-ish content in Saudi Arabic
  contentEn: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "kam-yisrif-sudi-ishtirakaat",
    title: " صر اسعد ع ااشتراات ارة؟",
    titleEn: "How Much Do Saudis Spend on Digital Subscriptions?",
    excerpt: "دراسة تش ا اسعد دع باتسط  را شرا ع اشتراات رة — أغبا سة.",
    excerptEn: "A study reveals Saudis pay an average of 382 SAR/month on digital subscriptions — most of them forgotten.",
    date: "2026-02-15",
    readTime: " دائ",
    category: "احصائات",
    categoryEn: "Stats",
    content: `## اشة ا ا أحد ت عا

 شر اسعد دع باتسط ** را** ع اشتراات رة. ع تربا **, را  اسة** — ذا ابغ   أثر  إجار شر  بعض اد.

اشة  إ شتر — اشة إ **  اسعد** عد اشترا احد ع اأ اس  ستخد.

##  ترح اس؟

حسب تحا آا شات احسابات ابة:

- **بث اد**: Netflix شاد Disney+ YouTube Premium — باتسط  را/شر
- **اس**: Spotify Apple Music أغا — باتسط  را/شر
- **اتخز اسحاب**: iCloud Google One Dropbox — باتسط  را/شر
- **اإتاجة**: Adobe Microsoft 365 ChatGPT — باتسط  را/شر
- **VPN اأا**: NordVPN Norton — باتسط  را/شر
- **اأعاب**: PlayStation Plus Xbox Game Pass — باتسط  را/شر
- **تص طعا**: رستش بر جاز بس — باتسط  را/شر
- **أخر**: LinkedIn Premium تطبات صحة تع — باتسط  را/شر

## ش س ااشتراات؟

**. اتجدد اتائ**: أغب اخدات تجدد تائ ا تحس ا.

**. ابغ صغر**:  را ا  را ا ا تحس ا —  ا تجعا تصر بغ بر.

**. اش اب  اضح**: أساء اعات ث "APPLE.COM/BILL" "GOOGLE*SERVICES" ا تضح ش باضبط ا تدع ع.

**. اترات اتجربة**: تسج  تجربة جاة تس تغ — تستر تدع شر.

##  تر؟

**اخطة اأ**: ارع ش حساب اب ع ا س —  ثا ب   اشتراات.

**اخطة اثاة**: رر ش تب ش تغ — ع رابط إغاء باشر  خدة.

**اخطة اثاثة**: ر. باتسط ستخدا ر **- را** شرا بعد أ تح.`,
    contentEn: `## The Problem No One Talks About

Every month, the average Saudi pays **382 SAR** on digital subscriptions. That's roughly **4,584 SAR per year** — more than a month's rent in some cities.

The problem isn't subscribing — it's that **73% of Saudis** have at least one subscription they've forgotten about and aren't using.

## Where Does the Money Go?

Based on our analysis of thousands of bank statements:

- **Video streaming**: Netflix, Shahid, Disney+, YouTube Premium — avg 85 SAR/mo
- **Music**: Spotify, Apple Music, Anghami — avg 35 SAR/mo
- **Cloud storage**: iCloud, Google One, Dropbox — avg 25 SAR/mo
- **Productivity**: Adobe, Microsoft 365, ChatGPT — avg 60 SAR/mo
- **VPN & Security**: NordVPN, Norton — avg 30 SAR/mo
- **Gaming**: PlayStation Plus, Xbox Game Pass — avg 45 SAR/mo
- **Delivery & Food**: Hungerstation Pro, Jahez Plus — avg 40 SAR/mo
- **Other**: LinkedIn Premium, health apps, education — avg 62 SAR/mo

## How to Save

**Step 1**: Upload your bank statement to Yalla Cancel — we'll show you every subscription in seconds.

**Step 2**: Decide what to keep and what to cancel — with a direct cancel link for each service.

**Step 3**: Save. On average, our users save **150-300 SAR** per month after their first scan.`,
  },
  {
    slug: "kif-talgi-ishtirakaat-mukhfiya",
    title: " تتش ااشتراات اخة  ش حساب؟",
    titleEn: "How to Find Hidden Subscriptions in Your Bank Statement",
    excerpt: "أساء غربة ث APPLE.COM/BILL  GOOGLE*SERVICES — تعر ش  باضبط  تغا.",
    excerptEn: "Strange names like APPLE.COM/BILL and GOOGLE*SERVICES — learn what they actually are and how to cancel them.",
    date: "2026-02-10",
    readTime: " دائ",
    category: "أدة",
    categoryEn: "Guides",
    content: `## ش أساء اعات غربة؟

ا تتح ش حساب اب تش أساء ث:

- **APPLE.COM/BILL** —  ت Apple Music iCloud Apple TV+ أ أ اشترا ثا عبر Apple
- **GOOGLE*SERVICES** —  YouTube Premium Google One أ أ تطب  Google Play
- **AMZN Digital** — Amazon Prime Kindle Unlimited أ Audible
- **PP*SPOTIFY** — Spotify عبر PayPal
- **NETFLIX.COM** — ذ اضحة ع اأ

اشة إ ب ا ضح  ش باضبط اخدة — عط بس اس اتاجر.

##  تتشا دا؟

### اطرة اتدة (تأخذ ت):

**. ز ش حساب**: اتح تطب ب  احسابات  ش احساب  اختر آخر  أشر  ز PDF أ CSV.

**. ابحث ع اترار**: ش اعات ا تترر  شر بس ابغ أ بغ رب.

**. ابحث ع اأساء**:  عة غربة ابحث عا  Google عشا تعر ش .

**. سج  ش**: اتب ائة ب ااشتراات ا تا ع ابغ اتارخ.

### اطرة اسرعة (ثا):

ارع ش حساب ع **ا س** خا س  ذا اشغ ع.  أ  دة تش:

-  اشتراات ع اس اخدة اح
- ابغ اشر اس  احد
- رابط إغاء باشر
- تحذرات  اخدات ا تصعب إغاءا

## أشر اأساء اخة

| اس اعة  اش | اخدة احة |
|---|---|
| APPLE.COM/BILL | Apple Music, iCloud+, Apple TV+ |
| GOOGLE*SERVICES | YouTube Premium, Google One |
| AMZN Digital | Amazon Prime, Audible |
| PP*SPOTIFY | Spotify Premium |
| ADOBE SYSTEMS | Adobe Creative Cloud |
| MICROSOFT*O365 | Microsoft 365 |
| OPENAI | ChatGPT Plus |
| SHAHID.MBC.NET | شاد VIP |

## صائح ة

- **ع إشعارات اب**: خ اب رس  إشعار ع  عة — ذا ا تس أ خص.
- **راجع ش  شر**: خصص  دائ  اة  شر راجعة اعات.
- **استخد بطاة احدة**: اجع  اشتراات ع بطاة حدة عشا ت اراجعة أس.`,
    contentEn: `## Why Are Transaction Names So Cryptic?

When you open your bank statement, you see names like APPLE.COM/BILL, GOOGLE*SERVICES, AMZN Digital — but what are they exactly?

Banks only show the merchant name, not the specific service. So one Apple charge could be Apple Music, iCloud, Apple TV+, or any app subscription.

## Common Hidden Subscription Names

| Statement Name | Actual Service |
|---|---|
| APPLE.COM/BILL | Apple Music, iCloud+, Apple TV+ |
| GOOGLE*SERVICES | YouTube Premium, Google One |
| AMZN Digital | Amazon Prime, Audible |
| PP*SPOTIFY | Spotify Premium |
| ADOBE SYSTEMS | Adobe Creative Cloud |
| MICROSOFT*O365 | Microsoft 365 |

## The Quick Way

Upload your statement to **Yalla Cancel** and we'll decode every transaction in seconds — with cancel links for each one.`,
  },
  {
    slug: "dark-patterns-tatbikat",
    title: "Dark Patterns:  اتطبات تخ تستر تدع",
    titleEn: "Dark Patterns: How Apps Keep You Paying",
    excerpt: " اأزرار اخة عرض اضة —  اشرات تصعب ع اإغاء  تتغب عا.",
    excerptEn: "From hidden buttons to misleading offers — how companies make cancellation hard and how to beat them.",
    date: "2026-02-05",
    readTime: " دائ",
    category: "تعة",
    categoryEn: "Awareness",
    content: `## ش ع Dark Pattern؟

Dark Pattern (ط ظ)  تص تعد  اتطب أ اع خ تس ش ا تب — ث إ تستر تدع خدة ا تحتاجا.

اشرات تصر ا ع ص برج عشا خ اإغاء **أصعب ا ** — با ااشترا  بضغطة زر.

## أشر اأاط اظة

### . تاة اإغاء (Roach Motel)
**اشة**: ااشترا بضغطة حدة  اإغاء حتاج  خطات.

**ثا**: Amazon Prime عرض ع عرض خصات   صحة ب ا ص زر اإغاء اع. از تر ع  صحات ترض  عرض.

### . ازر اخ (Hidden Cancel Button)
**اشة**: زر اإغاء جد بس خ أ ب ا ب.

**ثا**: NordVPN خ خار اإغاء تحت طبات  اإعدادات عرض خصات ثرة عشا ا تغ.

### . اتخ (Confirmshaming)
**اشة**: عط خار — احد إجاب اثا خ تحس باذب.

**ثا**: "استر باتر" اب "ا أا ا أب أر س" — أ غب  غت.

### . اعرض اض (Bait and Switch)
**اشة**: تغ ااشترا بس ح خطة أرخص بد ا غ عا.

**ثا**: Dropbox ز خطت بد ا غا — تظ تدع بس أ.

### . إجبار ااتصا (Forced Phone Call)
**اشة**: ا تدر تغ أا — از تتص أ تزر رع.

**ثا**: beIN Sports طب  تتص بخدة اعاء. ااد اراضة ث تس تا تطب زارة شخصة.

### . اتجدد اصات (Silent Auto-Renewal)
**اشة**: اترة اتجربة تت تتح اشترا دع بد ا ب.

**ثا**: ثر  اتطبات تعط أسبع جا بعدا تبدأ تخص — اإشعار ج تأخر أ ا ج.

##  تتغب ع Dark Patterns؟

**. استخد ا س**: عط رابط باشر صحة اإغاء — تتجاز  اتاة.

**. اعر ح**:  اسعدة ظا اتجارة اإترة ح ح  إغاء اخدات ارة.

**. سج  ش**:  اشرة رضت تغ ث احاة تاص ع ئة ااتصاات أ زارة اتجارة.

**. استخد بطاة سبة ادع**: بعض ااس ستخد بطاة د سبة ادع اشتراات — ا تخص اس ااشترا ت تائ.`,
    contentEn: `## What Are Dark Patterns?

Dark patterns are design tricks that make you do things you didn't intend — like continuing to pay for a service you don't need.

Companies spend millions making cancellation as hard as possible while subscription is just one click.

## Common Dark Patterns

### 1. The Roach Motel
One click to subscribe, 10 steps to cancel. Amazon Prime makes you go through 6 pages and decline 4 offers before you can actually cancel.

### 2. Hidden Cancel Button
The cancel option exists but is buried under layers of settings. NordVPN hides it behind multiple screens.

### 3. Confirmshaming
Two choices: "Keep saving!" vs "No, I don't want to save money" — making you feel stupid for cancelling.

### 4. Forced Phone Call
Some services like beIN Sports require you to call customer service. Gyms in Saudi often require an in-person visit.

## How to Beat Dark Patterns

Use **Yalla Cancel** — we give you a direct link to the actual cancel page, bypassing all the maze.`,
  },
  {
    slug: "guide-ilghaa-adobe",
    title: " تغ Adobe بد رس إغاء بر",
    titleEn: "How to Cancel Adobe Without Early Termination Fees",
    excerpt: "Adobe رض رس إغاء بر تص   — بس  طرة تتجبا.",
    excerptEn: "Adobe charges up to 50% early termination fees — but there's a way to avoid them.",
    date: "2026-01-28",
    readTime: " دائ",
    category: "أدة",
    categoryEn: "Guides",
    content: `## شة Adobe

Adobe Creative Cloud  أصعب ااشتراات  اإغاء. ش؟ أ أغب ااس شتر  **اخطة اسة** (ا تدعا شرا) — ذ ا **رس إغاء بر** تص    اتب.

ع  اشترت  ار بتغ    تدع رس إغاء تص  **- را**.

##  تتجب رس اإغاء؟

### اطرة اأ: اغ  أ  
Adobe عط **  ضا استرداد ا**.  غت خا أ أسبع ا تدع أ رس رجع   س.

### اطرة اثاة: اتظر اة اسة
 اتت ترة ا   أض ت تغ  **ب ا تجدد اعد اس**. راجع تارخ اشترا حط تب با بأسبع.

### اطرة اثاثة: تاص ع ادع
بعض استخد جحا  إغاء بد رس ع طر:
- اشات اباشر ع دع Adobe
- شرح إ ا تستخد اخدة
- طب تح خطة شرة بد سة (ا ا ا رس إغاء)

### اطرة ارابعة: ح خطة Photography
 تحتاج Photoshop بس خطة Photography ت ** را/شر** بد  را — تر , را باسة.

## خطات اإغاء

. ادخ ع [account.adobe.com/plans](https://account.adobe.com/plans)
. اضغط "Manage plan"
. اضغط "Cancel plan"
. Adobe بعرض ع عرض — ارضا ا
. اختر سبب اإغاء
. أد اإغاء

## صحة ة

ب ا تغ **ز  ات**  Adobe Creative Cloud. بعد اإغاء تد اص ات اخزة ع اسحابة.`,
    contentEn: `## The Adobe Problem

Adobe Creative Cloud is one of the hardest subscriptions to cancel because most people sign up for the annual plan (paid monthly) — which has **early termination fees** of up to 50%.

## How to Avoid Fees

1. **Cancel within 14 days** for a full refund
2. **Wait for annual renewal** and cancel before it renews
3. **Contact support** via chat and explain your situation
4. **Downgrade** to the Photography plan (52 SAR/mo instead of 265 SAR)

## Steps to Cancel

1. Go to account.adobe.com/plans
2. Click "Manage plan"  "Cancel plan"
3. Reject all retention offers
4. Confirm cancellation`,
  },
  {
    slug: "tawfir-floos-ishtirakaat",
    title: " طر ذة تر س ااشتراات",
    titleEn: "5 Smart Ways to Save Money on Subscriptions",
    excerpt: " شارة احسابات خطط اعائة — طر جربة تز اترة اشتراات ص.",
    excerptEn: "From account sharing to family plans — proven ways to cut your subscription bill in half.",
    date: "2026-01-20",
    readTime: " دائ",
    category: "صائح",
    categoryEn: "Tips",
    content: `## ااشتراات  از ت غاة

اشة  إ شتر  خدات ثرة — اشة إ  تدع أثر  ااز. ذ  طر جربة تز اترت:

## . اخطط اعائة

أغب اخدات ابرة تد خطط عائة أرخص بثر  ستا:

| اخدة | رد | عائ (شخص) | اتر |
|---|---|---|---|
| YouTube Premium |  را |  را |  |
| Spotify |  را |  را |  |
| Apple Music |  را |  را |  |
| Apple One |  را |  را |  |
| Netflix |  را |  را |  |
| iCloud (2TB) |  را |  را |  |

**اصحة**: ات ع - أشخاص  عائت أ أصدائ سا اتة.

## . تدر ااشتراات

ا تحتاج  اخدات  س ات. جرب:

- **شر Netflix**  شاد  ا تب  غ
- **شر Disney+**  شاد اسسات اجددة  غ
- **شر شاد**  تابع اسسات اعربة  غ

ذا بد ا تدع  را/شر ع  خدات تدع  را ع حدة بس.

## . استغ اعرض

- **Black Friday**: أغب اخدات تز أسعارا -  بر
- **عرض اطاب**: Spotify  Adobe  Apple Music عط خص  طاب
- **عرض اب**: بعض اب اسعدة تعط اشتراات جاة ع بطااتا اائتاة

## . ابدائ اجاة

 خدة دعة  بد جا أ أرخص:

| دع | بد جا |
|---|---|
| Microsoft 365 | Google Docs |
| Adobe Photoshop | Photopea أ GIMP |
| Dropbox | Google Drive (15GB جا) |
| LastPass | Bitwarden |
| Todoist Premium | Microsoft To Do |
| Grammarly | LanguageTool |

## . راجع   أشر

حط عد  ت   أشر تراجع اشتراات. اسأ س:

-  استخدت اخدة آخر  ؟
-   بد أرخص أ جا؟
-  أدر أشار احساب ع أحد؟

 اجاب "ا" ع اسؤا اأ — **اغ را**.

## ابدأ اآ

ارع ش حساب ع ا س ش  تدر تر. باتسط ستخدا ر **,-, را سا**.`,
    contentEn: `## Subscriptions Don't Have to Be Expensive

The problem isn't having many subscriptions — it's paying more than you need to.

## 1. Family Plans
Most services offer family plans that cost 60-70% less per person when split.

## 2. Subscription Rotation
Don't subscribe to everything at once. Rotate: one month Netflix, next month Disney+, etc.

## 3. Take Advantage of Deals
Black Friday, student discounts, and bank credit card offers can save you 40-70%.

## 4. Free Alternatives
Google Docs instead of Microsoft 365, Bitwarden instead of LastPass, Google Drive instead of Dropbox.

## 5. Review Every 3 Months
Set a calendar reminder. If you haven't used a service in 30 days — cancel it.`,
  },
  {
    slug: "trial-trap-tajriba-majaniya",
    title: "خ اتجربة اجاة:  تستد بد ا تخدع",
    titleEn: "The Free Trial Trap: How to Benefit Without Getting Tricked",
    excerpt: "    أشخاص س غ بعد اتجربة اجاة — ذ اطرة اصح.",
    excerptEn: "7 out of 10 people forget to cancel after a free trial — here's how to do it right.",
    date: "2026-01-15",
    readTime: " دائ",
    category: "صائح",
    categoryEn: "Tips",
    content: `## اأرا اخة

حسب ادراسات:

- ****  ااس س غ بعد اتجربة اجاة
- تسط ا دع اشخص ع تجارب سة: ** را/سة**
- اشرات تعتد ع اسا صدر دخ أساس

##  تع اخدعة؟

**اخطة **: اخدة تعط تجربة جاة  أا (أ  ).

**اخطة **: تطب  تدخ بطات ابة "عشا اتع بس".

**اخطة **: اتجربة تت بد ا تب (أ بإشعار بسط تتجا).

**اخطة **: تبدأ تخص  شرا — ا تحس إا بعد أشر.

##  صائح ذة

### . حط تب ر
أ ا تسج  أ تجربة جاة **حط تب  ت** ب   اة اتجربة. ذ أ خطة.

### . اغ را بعد اتسج
ثر  اخدات تخ تغ **بعد ا تسج باشرة** تظ تستخد اتجربة اجاة اة. أض طرة — اغ  ا اأ خ اتجربة ت حدا.

اخدات ا تدع اش: Netflix Spotify YouTube Premium Disney+ Apple TV+.

### . استخد بطاة سبة ادع
بعض ااس ستخد بطاة د سبة ادع ا بغ حدد —  ست تغ ابطاة ا ا رصد ااشترا ت.

### . تتبع تجارب
س ائة بسطة  احظات:
- اس اخدة
- تارخ بداة اتجربة
- تارخ اة اتجربة
-  غت ا ا

### . استخد ا س
ارع ش حساب خا ش   ااشتراات ا  بدأت تجربة جاة تحت دعة بد ا تدر.

## تحذر  اخدات "اجاة"

بعض اخدات ت "جا" بس  احة:

- **"جا ع إعاات"**: بعد زعج عشا تتر
- **"أ شر جا"**: بس از تدخ بطات
- **"جا أبد"**: بس ع زات حددة جدا تخ تحتاج تتر

اأذ إ تسأ س: **" بدع اخدة  ا ات جاة؟"** —  اجاب ا ا تسج  اأساس.`,
    contentEn: `## The Scary Numbers

- **70%** of people forget to cancel after free trials
- Average cost of forgotten trials: **240 SAR/year**
- Companies rely on this forgetfulness as a core revenue source

## 5 Smart Tips

1. **Set a reminder immediately** — 2 days before the trial ends
2. **Cancel right after signing up** — most services let you keep the trial even after cancelling
3. **Use a prepaid card** with limited balance
4. **Track your trials** in a simple note
5. **Use Yalla Cancel** to find subscriptions that started as free trials`,
  },
];

export function getBlogPost(slug: string): BlogPost | null {
  return BLOG_POSTS.find((p) => p.slug === slug) || null;
}
