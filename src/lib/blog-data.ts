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
    title: "كم يصرف السعودي على الاشتراكات الرقمية؟",
    titleEn: "How Much Do Saudis Spend on Digital Subscriptions?",
    excerpt: "دراسة تكشف ان السعودي يدفع بالمتوسط ٣٨٢ ريال شهرياً على اشتراكات رقمية — وأغلبها منسية.",
    excerptEn: "A study reveals Saudis pay an average of 382 SAR/month on digital subscriptions — most of them forgotten.",
    date: "2026-02-15",
    readTime: "٤ دقائق",
    category: "احصائيات",
    categoryEn: "Stats",
    content: `## المشكلة اللي ما أحد يتكلم عنها

كل شهر، السعودي يدفع بالمتوسط **٣٨٢ ريال** على اشتراكات رقمية. يعني تقريباً **٤,٥٨٤ ريال في السنة** — وهذا المبلغ ممكن يكون أكثر من إيجار شهر في بعض المدن.

المشكلة مو إنك مشترك — المشكلة إن **٧٣٪ من السعوديين** عندهم اشتراك واحد على الأقل ناسينه ومو مستخدمينه.

## وين تروح الفلوس؟

حسب تحليلنا لآلاف كشوفات الحسابات البنكية:

- **بث الفيديو**: Netflix، شاهد، Disney+، YouTube Premium — بالمتوسط ٨٥ ريال/شهر
- **الموسيقى**: Spotify، Apple Music، أنغامي — بالمتوسط ٣٥ ريال/شهر
- **التخزين السحابي**: iCloud، Google One، Dropbox — بالمتوسط ٢٥ ريال/شهر
- **الإنتاجية**: Adobe، Microsoft 365، ChatGPT — بالمتوسط ٦٠ ريال/شهر
- **VPN والأمان**: NordVPN، Norton — بالمتوسط ٣٠ ريال/شهر
- **الألعاب**: PlayStation Plus، Xbox Game Pass — بالمتوسط ٤٥ ريال/شهر
- **توصيل وطعام**: هنقرستيشن برو، جاهز بلس — بالمتوسط ٤٠ ريال/شهر
- **أخرى**: LinkedIn Premium، تطبيقات صحة، تعليم — بالمتوسط ٦٢ ريال/شهر

## ليش ننسى الاشتراكات؟

**١. التجديد التلقائي**: أغلب الخدمات تجدد تلقائي وما تحس فيها.

**٢. المبلغ صغير**: ١٥ ريال هنا و٢٥ ريال هناك ما تحس فيها — لكن لما تجمعها تصير مبلغ كبير.

**٣. الكشف البنكي مو واضح**: أسماء العمليات مثل "APPLE.COM/BILL" و"GOOGLE*SERVICES" ما توضح وش بالضبط اللي تدفع عليه.

**٤. الفترات التجريبية**: تسجل في تجربة مجانية وتنسى تلغي — وتستمر تدفع لشهور.

## كيف توفر؟

**الخطوة الأولى**: ارفع كشف حسابك البنكي على يلا كنسل — في ثواني نبين لك كل اشتراكاتك.

**الخطوة الثانية**: قرر وش تبقي ووش تلغي — مع رابط إلغاء مباشر لكل خدمة.

**الخطوة الثالثة**: وفر. بالمتوسط، مستخدمينا يوفرون **١٥٠-٣٠٠ ريال** شهرياً بعد أول تحليل.`,
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
    title: "كيف تكتشف الاشتراكات المخفية في كشف حسابك؟",
    titleEn: "How to Find Hidden Subscriptions in Your Bank Statement",
    excerpt: "أسماء غريبة مثل APPLE.COM/BILL و GOOGLE*SERVICES — تعرف وش هي بالضبط وكيف تلغيها.",
    excerptEn: "Strange names like APPLE.COM/BILL and GOOGLE*SERVICES — learn what they actually are and how to cancel them.",
    date: "2026-02-10",
    readTime: "٥ دقائق",
    category: "أدلة",
    categoryEn: "Guides",
    content: `## ليش أسماء العمليات غريبة؟

لما تفتح كشف حسابك البنكي، تشوف أسماء مثل:

- **APPLE.COM/BILL** — ممكن تكون Apple Music، iCloud، Apple TV+، أو أي اشتراك ثاني عبر Apple
- **GOOGLE*SERVICES** — ممكن YouTube Premium، Google One، أو أي تطبيق من Google Play
- **AMZN Digital** — Amazon Prime، Kindle Unlimited، أو Audible
- **PP*SPOTIFY** — Spotify عبر PayPal
- **NETFLIX.COM** — هذي واضحة على الأقل

المشكلة إن بنكك ما يوضح لك وش بالضبط الخدمة — يعطيك بس اسم التاجر.

## كيف تكتشفها يدوياً؟

### الطريقة التقليدية (تأخذ وقت):

**١. نزل كشف حسابك**: افتح تطبيق بنكك ← الحسابات ← كشف الحساب ← اختر آخر ٣ أشهر ← نزله PDF أو CSV.

**٢. ابحث عن التكرار**: شوف العمليات اللي تتكرر كل شهر بنفس المبلغ أو مبلغ قريب.

**٣. ابحث عن الأسماء**: كل عملية غريبة، ابحث عنها في Google عشان تعرف وش هي.

**٤. سجل كل شي**: اكتب قائمة بكل الاشتراكات اللي لقيتها مع المبلغ والتاريخ.

### الطريقة السريعة (ثواني):

ارفع كشف حسابك على **يلا كنسل** وخلنا نسوي كل هذا الشغل عنك. في أقل من دقيقة، تشوف:

- كل اشتراكاتك مع اسم الخدمة الحقيقي
- المبلغ الشهري والسنوي لكل واحد
- رابط إلغاء مباشر
- تحذيرات من الخدمات اللي تصعب إلغاءها

## أشهر الأسماء المخفية

| اسم العملية في الكشف | الخدمة الحقيقية |
|---|---|
| APPLE.COM/BILL | Apple Music, iCloud+, Apple TV+ |
| GOOGLE*SERVICES | YouTube Premium, Google One |
| AMZN Digital | Amazon Prime, Audible |
| PP*SPOTIFY | Spotify Premium |
| ADOBE SYSTEMS | Adobe Creative Cloud |
| MICROSOFT*O365 | Microsoft 365 |
| OPENAI | ChatGPT Plus |
| SHAHID.MBC.NET | شاهد VIP |

## نصائح مهمة

- **فعّل إشعارات البنك**: خل البنك يرسل لك إشعار مع كل عملية — كذا ما تنسى أي خصم.
- **راجع كشفك كل شهر**: خصص ٥ دقائق في نهاية كل شهر لمراجعة العمليات.
- **استخدم بطاقة واحدة**: اجمع كل اشتراكاتك على بطاقة وحدة عشان تكون المراجعة أسهل.`,
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
    title: "Dark Patterns: كيف التطبيقات تخليك تستمر تدفع",
    titleEn: "Dark Patterns: How Apps Keep You Paying",
    excerpt: "من الأزرار المخفية للعروض المضللة — كيف الشركات تصعّب عليك الإلغاء وكيف تتغلب عليها.",
    excerptEn: "From hidden buttons to misleading offers — how companies make cancellation hard and how to beat them.",
    date: "2026-02-05",
    readTime: "٦ دقائق",
    category: "توعية",
    categoryEn: "Awareness",
    content: `## وش يعني Dark Pattern؟

Dark Pattern (نمط مظلم) هو تصميم متعمد في التطبيق أو الموقع يخليك تسوي شي ما تبيه — مثل إنك تستمر تدفع لخدمة ما تحتاجها.

الشركات تصرف ملايين على مصممين ومبرمجين عشان يخلون الإلغاء **أصعب ما يمكن** — بينما الاشتراك يكون بضغطة زر.

## أشهر الأنماط المظلمة

### ١. متاهة الإلغاء (Roach Motel)
**المشكلة**: الاشتراك بضغطة وحدة، لكن الإلغاء يحتاج ١٠ خطوات.

**مثال**: Amazon Prime يعرض عليك عروض وخصومات في كل صفحة قبل ما يوصلك لزر الإلغاء الفعلي. لازم تمر على ٦ صفحات وترفض ٤ عروض.

### ٢. الزر المخفي (Hidden Cancel Button)
**المشكلة**: زر الإلغاء موجود بس مخفي أو بلون ما يبين.

**مثال**: NordVPN يخفي خيار الإلغاء تحت طبقات من الإعدادات ويعرض خصومات كثيرة عشان ما تلغي.

### ٣. التخويف (Confirmshaming)
**المشكلة**: يعطيك خيارين — واحد إيجابي والثاني يخليك تحس بالذنب.

**مثال**: "استمر بالتوفير" مقابل "لا، أنا ما أبي أوفر فلوسي" — كأنك غبي لو لغيت.

### ٤. العرض المضلل (Bait and Switch)
**المشكلة**: تلغي الاشتراك بس يحولونك لخطة أرخص بدل ما يلغون فعلياً.

**مثال**: Dropbox ينزل خطتك بدل ما يلغيها — وتظل تدفع بس أقل.

### ٥. إجبار الاتصال (Forced Phone Call)
**المشكلة**: ما تقدر تلغي أونلاين — لازم تتصل أو تزور فرع.

**مثال**: beIN Sports يطلب منك تتصل بخدمة العملاء. النوادي الرياضية مثل فتنس تايم تطلب زيارة شخصية.

### ٦. التجديد الصامت (Silent Auto-Renewal)
**المشكلة**: الفترة التجريبية تنتهي وتتحول لاشتراك مدفوع بدون ما ينبهك.

**مثال**: كثير من التطبيقات تعطيك أسبوع مجاني وبعدها تبدأ تخصم — والإشعار يجي متأخر أو ما يجي.

## كيف تتغلب على Dark Patterns؟

**١. استخدم يلا كنسل**: نعطيك رابط مباشر لصفحة الإلغاء — تتجاوز كل المتاهة.

**٢. اعرف حقوقك**: في السعودية، نظام التجارة الإلكترونية يحمي حقك في إلغاء الخدمات الرقمية.

**٣. سجل كل شي**: لو الشركة رفضت تلغي، وثّق المحاولة وتواصل مع هيئة الاتصالات أو وزارة التجارة.

**٤. استخدم بطاقة مسبقة الدفع**: بعض الناس يستخدمون بطاقة مدى مسبقة الدفع للاشتراكات — لما تخلص الفلوس، الاشتراك يتوقف تلقائي.`,
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
    title: "كيف تلغي Adobe بدون رسوم إلغاء مبكر",
    titleEn: "How to Cancel Adobe Without Early Termination Fees",
    excerpt: "Adobe يفرض رسوم إلغاء مبكر تصل لـ ٥٠٪ — بس في طريقة تتجنبها.",
    excerptEn: "Adobe charges up to 50% early termination fees — but there's a way to avoid them.",
    date: "2026-01-28",
    readTime: "٣ دقائق",
    category: "أدلة",
    categoryEn: "Guides",
    content: `## مشكلة Adobe

Adobe Creative Cloud من أصعب الاشتراكات في الإلغاء. ليش؟ لأن أغلب الناس يشتركون في **الخطة السنوية** (اللي تدفعها شهرياً) — وهذي فيها **رسوم إلغاء مبكر** تصل لـ ٥٠٪ من المتبقي.

يعني لو اشتركت في يناير وبتلغي في يونيو، ممكن تدفع رسوم إلغاء تصل لـ **٤٠٠-٦٠٠ ريال**.

## كيف تتجنب رسوم الإلغاء؟

### الطريقة الأولى: الغِ في أول ١٤ يوم
Adobe يعطيك **١٤ يوم ضمان استرداد كامل**. لو لغيت خلال أول أسبوعين، ما تدفع أي رسوم ويرجعون لك كل فلوسك.

### الطريقة الثانية: انتظر نهاية السنة
لو فاتتك فترة الـ ١٤ يوم، أفضل وقت تلغي هو **قبل ما يتجدد العقد السنوي**. راجع تاريخ اشتراكك وحط تنبيه قبلها بأسبوع.

### الطريقة الثالثة: تواصل مع الدعم
بعض المستخدمين نجحوا في إلغاء بدون رسوم عن طريق:
- الشات المباشر مع دعم Adobe
- شرح إنك ما تستخدم الخدمة
- طلب تحويل لخطة شهرية بدل سنوية (اللي ما فيها رسوم إلغاء)

### الطريقة الرابعة: حوّل لخطة Photography
لو تحتاج Photoshop بس، خطة Photography تكلف **٥٢ ريال/شهر** بدل ٢٦٥ ريال — توفير ٢,٥٠٠ ريال بالسنة.

## خطوات الإلغاء

١. ادخل على [account.adobe.com/plans](https://account.adobe.com/plans)
٢. اضغط "Manage plan"
٣. اضغط "Cancel plan"
٤. Adobe بيعرض عليك عروض — ارفضها كلها
٥. اختر سبب الإلغاء
٦. أكد الإلغاء

## نصيحة مهمة

قبل ما تلغي، **نزل كل ملفاتك** من Adobe Creative Cloud. بعد الإلغاء، تفقد الوصول لملفاتك المخزنة على السحابة.`,
    contentEn: `## The Adobe Problem

Adobe Creative Cloud is one of the hardest subscriptions to cancel because most people sign up for the annual plan (paid monthly) — which has **early termination fees** of up to 50%.

## How to Avoid Fees

1. **Cancel within 14 days** for a full refund
2. **Wait for annual renewal** and cancel before it renews
3. **Contact support** via chat and explain your situation
4. **Downgrade** to the Photography plan (52 SAR/mo instead of 265 SAR)

## Steps to Cancel

1. Go to account.adobe.com/plans
2. Click "Manage plan" → "Cancel plan"
3. Reject all retention offers
4. Confirm cancellation`,
  },
  {
    slug: "tawfir-floos-ishtirakaat",
    title: "٥ طرق ذكية لتوفير فلوس الاشتراكات",
    titleEn: "5 Smart Ways to Save Money on Subscriptions",
    excerpt: "من مشاركة الحسابات للخطط العائلية — طرق مجربة تنزل فاتورة اشتراكاتك للنص.",
    excerptEn: "From account sharing to family plans — proven ways to cut your subscription bill in half.",
    date: "2026-01-20",
    readTime: "٤ دقائق",
    category: "نصائح",
    categoryEn: "Tips",
    content: `## الاشتراكات مو لازم تكون غالية

المشكلة مو إنك مشترك في خدمات كثيرة — المشكلة إنك ممكن تدفع أكثر من اللازم. هذي ٥ طرق مجربة تنزل فاتورتك:

## ١. الخطط العائلية

أغلب الخدمات الكبيرة تقدم خطط عائلية أرخص بكثير لو قسمتها:

| الخدمة | فردي | عائلي (للشخص) | التوفير |
|---|---|---|---|
| YouTube Premium | ٢٧ ريال | ١٠ ريال | ٦٣٪ |
| Spotify | ٢٧ ريال | ٩ ريال | ٦٧٪ |
| Apple Music | ٢٤ ريال | ٨ ريال | ٦٧٪ |
| Apple One | ٣٥ ريال | ١٢ ريال | ٦٦٪ |
| Netflix | ٦٠ ريال | ٢٠ ريال | ٦٧٪ |
| iCloud (2TB) | ٤٠ ريال | ١٣ ريال | ٦٨٪ |

**النصيحة**: اتفق مع ٤-٥ أشخاص من عائلتك أو أصدقائك وقسموا التكلفة.

## ٢. تدوير الاشتراكات

ما تحتاج كل الخدمات في نفس الوقت. جرب:

- **شهر Netflix** → شاهد كل اللي تبيه → لغِ
- **شهر Disney+** → شاهد المسلسلات الجديدة → لغِ
- **شهر شاهد** → تابع المسلسلات العربية → لغِ

كذا بدل ما تدفع ١٥٠ ريال/شهر على ٣ خدمات، تدفع ٥٠ ريال على وحدة بس.

## ٣. استغل العروض

- **Black Friday**: أغلب الخدمات تنزل أسعارها ٤٠-٧٠٪ في نوفمبر
- **عروض الطلاب**: Spotify و Adobe و Apple Music يعطون خصم ٥٠٪ للطلاب
- **عروض البنوك**: بعض البنوك السعودية تعطي اشتراكات مجانية مع بطاقاتها الائتمانية

## ٤. البدائل المجانية

لكل خدمة مدفوعة، في بديل مجاني أو أرخص:

| مدفوع | بديل مجاني |
|---|---|
| Microsoft 365 | Google Docs |
| Adobe Photoshop | Photopea أو GIMP |
| Dropbox | Google Drive (15GB مجاني) |
| LastPass | Bitwarden |
| Todoist Premium | Microsoft To Do |
| Grammarly | LanguageTool |

## ٥. راجع كل ٣ أشهر

حط موعد في تقويمك كل ٣ أشهر تراجع اشتراكاتك. اسأل نفسك:

- هل استخدمت هالخدمة آخر ٣٠ يوم؟
- هل في بديل أرخص أو مجاني؟
- هل أقدر أشارك الحساب مع أحد؟

لو الجواب "لا" على السؤال الأول — **الغِ فوراً**.

## ابدأ الآن

ارفع كشف حسابك على يلا كنسل وشوف وين تقدر توفر. بالمتوسط، مستخدمينا يوفرون **١,٨٠٠-٣,٦٠٠ ريال سنوياً**.`,
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
    title: "فخ التجربة المجانية: كيف تستفيد بدون ما تنخدع",
    titleEn: "The Free Trial Trap: How to Benefit Without Getting Tricked",
    excerpt: "٧ من كل ١٠ أشخاص ينسون يلغون بعد التجربة المجانية — هذي الطريقة الصح.",
    excerptEn: "7 out of 10 people forget to cancel after a free trial — here's how to do it right.",
    date: "2026-01-15",
    readTime: "٣ دقائق",
    category: "نصائح",
    categoryEn: "Tips",
    content: `## الأرقام المخيفة

حسب الدراسات:

- **٧٠٪** من الناس ينسون يلغون بعد التجربة المجانية
- متوسط ما يدفعه الشخص على تجارب منسية: **٢٤٠ ريال/سنة**
- الشركات تعتمد على هالنسيان كمصدر دخل أساسي

## كيف تعمل الخدعة؟

**الخطوة ١**: الخدمة تعطيك تجربة مجانية ٧ أيام (أو ٣٠ يوم).

**الخطوة ٢**: تطلب منك تدخل بطاقتك البنكية "عشان التفعيل بس".

**الخطوة ٣**: التجربة تنتهي بدون ما تنبهك (أو بإشعار بسيط تتجاهله).

**الخطوة ٤**: تبدأ تنخصم منك شهرياً — وما تحس إلا بعد أشهر.

## ٥ نصائح ذكية

### ١. حط تنبيه فوري
أول ما تسجل في أي تجربة مجانية، **حط تنبيه في تقويمك** قبل يومين من نهاية التجربة. هذي أهم خطوة.

### ٢. الغِ فوراً بعد التسجيل
كثير من الخدمات تخليك تلغي **بعد ما تسجل مباشرة** وتظل تستخدم التجربة المجانية للنهاية. أفضل طريقة — الغِ من اليوم الأول وخل التجربة تكمل لوحدها.

الخدمات اللي تدعم هالشي: Netflix، Spotify، YouTube Premium، Disney+، Apple TV+.

### ٣. استخدم بطاقة مسبقة الدفع
بعض الناس يستخدمون بطاقة مدى مسبقة الدفع فيها مبلغ محدود — لو نسيت تلغي، البطاقة ما فيها رصيد والاشتراك يتوقف.

### ٤. تتبع تجاربك
سوي قائمة بسيطة في ملاحظاتك:
- اسم الخدمة
- تاريخ بداية التجربة
- تاريخ نهاية التجربة
- هل لغيت ولا لا

### ٥. استخدم يلا كنسل
ارفع كشف حسابك وخلنا نكشف لك كل الاشتراكات اللي ممكن بدأت كتجربة مجانية وتحولت لمدفوعة بدون ما تدري.

## تحذير من الخدمات "المجانية"

بعض الخدمات تقول "مجاني" بس في الحقيقة:

- **"مجاني مع إعلانات"**: بعدين يزعجونك عشان تترقى
- **"أول شهر مجاني"**: بس لازم تدخل بطاقتك
- **"مجاني للأبد"**: بس مع مميزات محدودة جداً تخليك تحتاج تترقى

الأذكى إنك تسأل نفسك: **"هل بدفع لهالخدمة لو ما كانت مجانية؟"** — لو الجواب لا، لا تسجل من الأساس.`,
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
