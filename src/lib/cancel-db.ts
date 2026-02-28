// Cancel links database: URLs, difficulty ratings, and domains for logos
// Based on 200+ services commonly found in Saudi bank statements

export type CancelDifficulty = "easy" | "hard";

export interface CancelInfo {
  cancelUrl: string;
  difficulty: CancelDifficulty;
  domain: string;
  darkPattern?: string; // Warning about tricky cancellation
  guideSlug?: string; // Link to our cancel guide
}

const CANCEL_DB: Record<string, CancelInfo> = {
  // ── Streaming ──
  "Netflix": {
    cancelUrl: "https://www.netflix.com/cancelplan",
    difficulty: "easy",
    domain: "netflix.com",
    guideSlug: "cancel-netflix",
  },
  "Spotify": {
    cancelUrl: "https://www.spotify.com/account/subscription/",
    difficulty: "easy",
    domain: "spotify.com",
    guideSlug: "cancel-spotify",
  },
  "شاهد VIP": {
    cancelUrl: "https://shahid.mbc.net/en/my-account/subscription",
    difficulty: "hard",
    domain: "shahid.mbc.net",
    darkPattern: "يلزمك تلغي من الموقع مو من التطبيق",
    guideSlug: "cancel-shahid",
  },
  "Disney+": {
    cancelUrl: "https://www.disneyplus.com/account/subscription",
    difficulty: "easy",
    domain: "disneyplus.com",
    guideSlug: "cancel-disney-plus",
  },
  "YouTube Premium": {
    cancelUrl: "https://www.youtube.com/paid_memberships",
    difficulty: "easy",
    domain: "youtube.com",
    guideSlug: "cancel-youtube-premium",
  },
  "Apple TV+": {
    cancelUrl: "https://support.apple.com/en-us/HT202039",
    difficulty: "hard",
    domain: "apple.com",
    darkPattern: "لازم تلغي من إعدادات الجهاز مو من الموقع",
    guideSlug: "cancel-apple-tv-plus",
  },
  "Amazon Prime": {
    cancelUrl: "https://www.amazon.sa/gp/primecentral",
    difficulty: "hard",
    domain: "amazon.sa",
    darkPattern: "أمازون يعرض عليك عروض كثيرة عشان ما تلغي",
    guideSlug: "cancel-amazon-prime",
  },
  "Prime Video": {
    cancelUrl: "https://www.amazon.sa/gp/primecentral",
    difficulty: "hard",
    domain: "amazon.sa",
    darkPattern: "أمازون يعرض عليك عروض كثيرة عشان ما تلغي",
    guideSlug: "cancel-amazon-prime",
  },
  "Hulu": {
    cancelUrl: "https://secure.hulu.com/account",
    difficulty: "easy",
    domain: "hulu.com",
  },
  "Paramount+": {
    cancelUrl: "https://www.paramountplus.com/account/",
    difficulty: "easy",
    domain: "paramountplus.com",
    guideSlug: "cancel-paramount-plus",
  },
  "HBO": {
    cancelUrl: "https://www.max.com/account",
    difficulty: "easy",
    domain: "max.com",
    guideSlug: "cancel-max-hbo",
  },
  "Max (HBO)": {
    cancelUrl: "https://www.max.com/account",
    difficulty: "easy",
    domain: "max.com",
    guideSlug: "cancel-max-hbo",
  },
  "OSN+": {
    cancelUrl: "https://stream.osn.com/account",
    difficulty: "easy",
    domain: "osnplus.com",
    guideSlug: "cancel-osn-plus",
  },
  "Crunchyroll": {
    cancelUrl: "https://www.crunchyroll.com/account/subscription",
    difficulty: "easy",
    domain: "crunchyroll.com",
  },
  "beIN Sports": {
    cancelUrl: "https://www.bein.com/en/subscriptions/",
    difficulty: "hard",
    domain: "bein.com",
    darkPattern: "لازم تتصل بخدمة العملاء للإلغاء",
    guideSlug: "cancel-bein-connect",
  },
  "TIDAL": {
    cancelUrl: "https://tidal.com/settings/subscription",
    difficulty: "easy",
    domain: "tidal.com",
  },
  "Audible": {
    cancelUrl: "https://www.audible.com/account/cancelPlan",
    difficulty: "hard",
    domain: "audible.com",
    darkPattern: "أمازون يعرض عليك عروض كثيرة عشان ما تلغي",
  },

  // ── Apple / Google ──
  "Apple": {
    cancelUrl: "https://support.apple.com/en-us/HT202039",
    difficulty: "hard",
    domain: "apple.com",
    darkPattern: "لازم تلغي من إعدادات الجهاز مو من الموقع",
  },
  "Apple Subscriptions": {
    cancelUrl: "https://support.apple.com/en-us/HT202039",
    difficulty: "hard",
    domain: "apple.com",
    darkPattern: "لازم تلغي من إعدادات الجهاز مو من الموقع",
  },
  "Apple iTunes": {
    cancelUrl: "https://support.apple.com/en-us/HT202039",
    difficulty: "hard",
    domain: "apple.com",
    darkPattern: "لازم تلغي من إعدادات الجهاز مو من الموقع",
  },
  "iCloud+": {
    cancelUrl: "https://support.apple.com/en-us/HT207594",
    difficulty: "hard",
    domain: "icloud.com",
    darkPattern: "تنبيه: إلغاء iCloud يمكن يمسح ملفاتك",
    guideSlug: "cancel-icloud",
  },
  "Google Play": {
    cancelUrl: "https://play.google.com/store/account/subscriptions",
    difficulty: "easy",
    domain: "play.google.com",
  },
  "Google One": {
    cancelUrl: "https://one.google.com/settings",
    difficulty: "easy",
    domain: "one.google.com",
    guideSlug: "cancel-google-one",
  },

  // ── Productivity ──
  "Adobe Creative Cloud": {
    cancelUrl: "https://account.adobe.com/plans",
    difficulty: "hard",
    domain: "adobe.com",
    darkPattern: "Adobe يفرض رسوم إلغاء مبكر — تأكد من توقيت الإلغاء",
    guideSlug: "cancel-adobe",
  },
  "Adobe": {
    cancelUrl: "https://account.adobe.com/plans",
    difficulty: "hard",
    domain: "adobe.com",
    darkPattern: "Adobe يفرض رسوم إلغاء مبكر — تأكد من توقيت الإلغاء",
    guideSlug: "cancel-adobe",
  },
  "Microsoft 365": {
    cancelUrl: "https://account.microsoft.com/services/",
    difficulty: "easy",
    domain: "microsoft.com",
    guideSlug: "cancel-microsoft-365",
  },
  "Microsoft": {
    cancelUrl: "https://account.microsoft.com/services/",
    difficulty: "easy",
    domain: "microsoft.com",
    guideSlug: "cancel-microsoft-365",
  },
  "ChatGPT Plus": {
    cancelUrl: "https://chat.openai.com/#settings/subscription",
    difficulty: "easy",
    domain: "openai.com",
    guideSlug: "cancel-chatgpt",
  },
  "OpenAI": {
    cancelUrl: "https://chat.openai.com/#settings/subscription",
    difficulty: "easy",
    domain: "openai.com",
    guideSlug: "cancel-chatgpt",
  },
  "Notion": {
    cancelUrl: "https://www.notion.so/my-account",
    difficulty: "easy",
    domain: "notion.so",
    guideSlug: "cancel-notion",
  },
  "Figma": {
    cancelUrl: "https://www.figma.com/settings",
    difficulty: "easy",
    domain: "figma.com",
    guideSlug: "cancel-figma-pro",
  },
  "Canva Pro": {
    cancelUrl: "https://www.canva.com/settings/billing",
    difficulty: "easy",
    domain: "canva.com",
    guideSlug: "cancel-canva-pro",
  },
  "Grammarly": {
    cancelUrl: "https://account.grammarly.com/subscription",
    difficulty: "easy",
    domain: "grammarly.com",
    guideSlug: "cancel-grammarly",
  },
  "Dropbox": {
    cancelUrl: "https://www.dropbox.com/account/plan",
    difficulty: "hard",
    domain: "dropbox.com",
    darkPattern: "Dropbox ينزل خطتك بدل ما يلغيها مباشرة",
    guideSlug: "cancel-dropbox",
  },
  "Zoom": {
    cancelUrl: "https://zoom.us/account",
    difficulty: "easy",
    domain: "zoom.us",
    guideSlug: "cancel-zoom",
  },
  "Slack": {
    cancelUrl: "https://slack.com/intl/en-sa/pricing",
    difficulty: "easy",
    domain: "slack.com",
    guideSlug: "cancel-slack-pro",
  },
  "Todoist": {
    cancelUrl: "https://todoist.com/app/settings/subscription",
    difficulty: "easy",
    domain: "todoist.com",
  },
  "Evernote": {
    cancelUrl: "https://www.evernote.com/Settings.action",
    difficulty: "easy",
    domain: "evernote.com",
  },
  "GitHub Copilot": {
    cancelUrl: "https://github.com/settings/copilot",
    difficulty: "easy",
    domain: "github.com",
    guideSlug: "cancel-github-copilot",
  },

  // ── Gaming ──
  "PlayStation Plus": {
    cancelUrl: "https://store.playstation.com/en-sa/category/subscriptions",
    difficulty: "easy",
    domain: "playstation.com",
    guideSlug: "cancel-playstation-plus",
  },
  "Xbox Game Pass": {
    cancelUrl: "https://account.microsoft.com/services/",
    difficulty: "easy",
    domain: "xbox.com",
    guideSlug: "cancel-xbox-game-pass",
  },
  "Discord Nitro": {
    cancelUrl: "https://discord.com/settings/subscriptions",
    difficulty: "easy",
    domain: "discord.com",
  },
  "Discord": {
    cancelUrl: "https://discord.com/settings/subscriptions",
    difficulty: "easy",
    domain: "discord.com",
  },
  "Steam": {
    cancelUrl: "https://store.steampowered.com/account/",
    difficulty: "easy",
    domain: "store.steampowered.com",
  },
  "Twitch": {
    cancelUrl: "https://www.twitch.tv/subscriptions",
    difficulty: "easy",
    domain: "twitch.tv",
  },

  // ── VPN & Security ──
  "NordVPN": {
    cancelUrl: "https://my.nordaccount.com/dashboard/nordvpn/",
    difficulty: "hard",
    domain: "nordvpn.com",
    darkPattern: "NordVPN يخفي زر الإلغاء ويعرض خصومات كثيرة",
    guideSlug: "cancel-nordvpn",
  },
  "ExpressVPN": {
    cancelUrl: "https://www.expressvpn.com/subscriptions",
    difficulty: "hard",
    domain: "expressvpn.com",
    darkPattern: "لازم تتواصل مع الدعم عبر الشات",
    guideSlug: "cancel-expressvpn",
  },
  "Surfshark": {
    cancelUrl: "https://my.surfshark.com/account/subscription",
    difficulty: "easy",
    domain: "surfshark.com",
  },
  "1Password": {
    cancelUrl: "https://my.1password.com/settings/billing",
    difficulty: "easy",
    domain: "1password.com",
  },
  "LastPass": {
    cancelUrl: "https://lastpass.com/update_billing.php",
    difficulty: "easy",
    domain: "lastpass.com",
  },

  // ── Health & Lifestyle ──
  "Headspace": {
    cancelUrl: "https://www.headspace.com/settings/subscription",
    difficulty: "easy",
    domain: "headspace.com",
    guideSlug: "cancel-headspace",
  },
  "Calm": {
    cancelUrl: "https://www.calm.com/account",
    difficulty: "easy",
    domain: "calm.com",
    guideSlug: "cancel-calm",
  },
  "Duolingo Plus": {
    cancelUrl: "https://www.duolingo.com/settings/subscription",
    difficulty: "easy",
    domain: "duolingo.com",
    guideSlug: "cancel-duolingo-plus",
  },
  "فتنس تايم": {
    cancelUrl: "https://www.leejam.com/",
    difficulty: "hard",
    domain: "leejam.com",
    darkPattern: "لازم تزور الفرع شخصيا للإلغاء",
  },
  "لي جام": {
    cancelUrl: "https://www.leejam.com/",
    difficulty: "hard",
    domain: "leejam.com",
    darkPattern: "لازم تزور الفرع شخصيا للإلغاء",
  },
  "نادي رياضي": {
    cancelUrl: "",
    difficulty: "hard",
    domain: "",
    darkPattern: "أغلب النوادي تطلب زيارة شخصية للإلغاء",
  },

  // ── Social ──
  "LinkedIn Premium": {
    cancelUrl: "https://www.linkedin.com/mypreferences/d/manage-subscription",
    difficulty: "hard",
    domain: "linkedin.com",
    darkPattern: "LinkedIn يعرض عليك خطة أرخص بدل الإلغاء",
    guideSlug: "cancel-linkedin-premium",
  },
  "X Premium": {
    cancelUrl: "https://twitter.com/settings/manage_subscriptions",
    difficulty: "easy",
    domain: "x.com",
    guideSlug: "cancel-x-premium",
  },
  "Snapchat+": {
    cancelUrl: "https://accounts.snapchat.com/accounts/subscription",
    difficulty: "easy",
    domain: "snapchat.com",
    guideSlug: "cancel-snapchat-plus",
  },
  "Telegram Premium": {
    cancelUrl: "https://telegram.org/blog/premium",
    difficulty: "hard",
    domain: "telegram.org",
    darkPattern: "لازم تلغي من إعدادات متجر التطبيقات",
    guideSlug: "cancel-telegram-premium",
  },

  // ── Education ──
  "Coursera": {
    cancelUrl: "https://www.coursera.org/account/subscriptions",
    difficulty: "easy",
    domain: "coursera.com",
  },
  "Skillshare": {
    cancelUrl: "https://www.skillshare.com/settings/payments",
    difficulty: "hard",
    domain: "skillshare.com",
    darkPattern: "Skillshare يعرض شهر مجاني عشان ما تلغي",
  },
  "MasterClass": {
    cancelUrl: "https://www.masterclass.com/settings/subscriptions",
    difficulty: "easy",
    domain: "masterclass.com",
    guideSlug: "cancel-masterclass",
  },
  "Kindle Unlimited": {
    cancelUrl: "https://www.amazon.com/hz/mycd/myx#/home/settings/payment",
    difficulty: "easy",
    domain: "amazon.com",
  },

  // ── Saudi Services ──
  "STC": {
    cancelUrl: "https://www.stc.com.sa/personal/myaccount",
    difficulty: "easy",
    domain: "stc.com.sa",
  },
  "STC Play": {
    cancelUrl: "https://play.stc.com.sa/account",
    difficulty: "easy",
    domain: "stc.com.sa",
  },
  "STC TV": {
    cancelUrl: "https://tv.stc.com.sa/account",
    difficulty: "easy",
    domain: "stc.com.sa",
  },
  "أنغامي": {
    cancelUrl: "https://www.anghami.com/settings",
    difficulty: "easy",
    domain: "anghami.com",
  },
  "هنقرستيشن": {
    cancelUrl: "https://www.hungerstation.com/",
    difficulty: "easy",
    domain: "hungerstation.com",
    guideSlug: "cancel-hungerstation-pro",
  },
  "كريم": {
    cancelUrl: "https://app.careem.com/",
    difficulty: "easy",
    domain: "careem.com",
    guideSlug: "cancel-careem-plus",
  },
  "جاهز": {
    cancelUrl: "https://www.jahez.net/",
    difficulty: "easy",
    domain: "jahez.net",
    guideSlug: "cancel-jahez-plus",
  },
  "مرسول": {
    cancelUrl: "https://www.mrsool.co/",
    difficulty: "easy",
    domain: "mrsool.co",
  },
  "نعناع": {
    cancelUrl: "https://www.nana.sa/",
    difficulty: "easy",
    domain: "nana.sa",
    guideSlug: "cancel-nana-direct",
  },
  "تمارا": {
    cancelUrl: "https://www.tamara.co/",
    difficulty: "easy",
    domain: "tamara.co",
    guideSlug: "cancel-tamara",
  },
  "تابي": {
    cancelUrl: "https://tabby.ai/",
    difficulty: "easy",
    domain: "tabby.ai",
    guideSlug: "cancel-tabby",
  },
  "جرير": {
    cancelUrl: "https://www.jarir.com/",
    difficulty: "easy",
    domain: "jarir.com",
  },
  "نون": {
    cancelUrl: "https://www.noon.com/",
    difficulty: "easy",
    domain: "noon.com",
  },
  "Amazon": {
    cancelUrl: "https://www.amazon.sa/gp/primecentral",
    difficulty: "easy",
    domain: "amazon.sa",
  },
  "Deezer": {
    cancelUrl: "https://www.deezer.com/account/subscription",
    difficulty: "easy",
    domain: "deezer.com",
  },
  "Uber": {
    cancelUrl: "https://help.uber.com/riders/article/cancel-uber-one",
    difficulty: "easy",
    domain: "uber.com",
  },
};

export function getCancelInfo(serviceName: string): CancelInfo | null {
  return CANCEL_DB[serviceName] || null;
}

export function getCancelUrl(serviceName: string): string | null {
  const info = CANCEL_DB[serviceName];
  return info?.cancelUrl || null;
}

export function getDifficulty(serviceName: string): CancelDifficulty {
  const info = CANCEL_DB[serviceName];
  return info?.difficulty || "easy";
}

export function getDomain(serviceName: string): string {
  const info = CANCEL_DB[serviceName];
  return info?.domain || "";
}

export function getGuideSlug(serviceName: string): string | null {
  const info = CANCEL_DB[serviceName];
  return info?.guideSlug || null;
}
