import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "أدلة إلغاء الاشتراكات — ٢٠١ دليل | Yalla Cancel",
  description:
    "أدلة خطوة بخطوة لإلغاء أشهر الاشتراكات في السعودية والعالم. Netflix, Spotify, Adobe, stc والمزيد.",
};

const FAV = (domain: string) =>
  `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

interface Guide {
  name: string;
  nameAr: string;
  slug: string;
  domain: string;
}

const CATEGORIES: { title: string; guides: Guide[] }[] = [
  {
    title: "خدمات سعودية",
    guides: [
      { name: "stc", nameAr: "stc", slug: "cancel-stc", domain: "stc.com.sa" },
      { name: "Mobily", nameAr: "موبايلي", slug: "cancel-mobily", domain: "mobily.com.sa" },
      { name: "Zain", nameAr: "زين", slug: "cancel-zain", domain: "sa.zain.com" },
      { name: "Hungerstation Pro", nameAr: "هنقرستيشن برو", slug: "cancel-hungerstation-pro", domain: "hungerstation.com" },
      { name: "Jahez Plus", nameAr: "جاهز بلس", slug: "cancel-jahez-plus", domain: "jahez.net" },
      { name: "Careem Plus", nameAr: "كريم بلس", slug: "cancel-careem-plus", domain: "careem.com" },
      { name: "Noon VIP", nameAr: "نون VIP", slug: "cancel-noon-vip", domain: "noon.com" },
      { name: "Tamara", nameAr: "تمارا", slug: "cancel-tamara", domain: "tamara.co" },
      { name: "Tabby", nameAr: "تابي", slug: "cancel-tabby", domain: "tabby.ai" },
      { name: "Nana Direct", nameAr: "نانا", slug: "cancel-nana-direct", domain: "nana.sa" },
      { name: "stc pay", nameAr: "stc pay", slug: "cancel-stc-pay", domain: "stcpay.com.sa" },
      { name: "Jawwy", nameAr: "جوّي", slug: "cancel-jawwy", domain: "jawwy.sa" },
      { name: "Mrsool", nameAr: "مرسول", slug: "cancel-mrsool", domain: "mrsool.com" },
      { name: "ToYou", nameAr: "ToYou", slug: "cancel-toyou", domain: "toyou.io" },
      { name: "Wssel", nameAr: "وصّل", slug: "cancel-wssel", domain: "wssel.com" },
      { name: "Extra Rewards", nameAr: "اكسترا", slug: "cancel-extra-rewards", domain: "extra.com" },
      { name: "Salam Mobile", nameAr: "سلام موبايل", slug: "cancel-salam-mobile", domain: "salam.sa" },
      { name: "Virgin Mobile SA", nameAr: "فيرجن موبايل", slug: "cancel-virgin-mobile-sa", domain: "virginmobile.sa" },
      { name: "Riyadh Season", nameAr: "موسم الرياض", slug: "cancel-riyadh-season", domain: "riyadhseason.sa" },
      { name: "The Entertainer", nameAr: "The Entertainer", slug: "cancel-the-entertainer", domain: "theentertainerme.com" },
      { name: "Yajny", nameAr: "يجني", slug: "cancel-yajny", domain: "yajny.com" },
      { name: "Floward", nameAr: "فلاورد", slug: "cancel-floward", domain: "floward.com" },
      { name: "Golden Scent", nameAr: "قولدن سنت", slug: "cancel-golden-scent", domain: "goldenscent.com" },
      { name: "Al Dawaa Delivery", nameAr: "الدواء", slug: "cancel-al-dawaa-delivery", domain: "al-dawaa.com" },
      { name: "Sehha App", nameAr: "صحة", slug: "cancel-sehha-app", domain: "sehha.sa" },
      { name: "Saudi Airlines Alfursan", nameAr: "الفرسان", slug: "cancel-saudi-airlines-alfursan", domain: "saudia.com" },
      { name: "Lulu Hypermarket", nameAr: "لولو", slug: "cancel-lulu-hypermarket", domain: "luluhypermarket.com" },
      { name: "Deliveroo Plus", nameAr: "ديليفرو بلس", slug: "cancel-deliveroo-plus", domain: "deliveroo.com" },
      { name: "Talabat Pro", nameAr: "طلبات برو", slug: "cancel-talabat-pro", domain: "talabat.com" },
      { name: "stc Play", nameAr: "stc Play", slug: "cancel-stc-play", domain: "stcplay.gg" },
      { name: "Qatat", nameAr: "قطات", slug: "cancel-qatat", domain: "qatat.com" },
    ],
  },
  {
    title: "بث الفيديو",
    guides: [
      { name: "Netflix", nameAr: "Netflix", slug: "cancel-netflix", domain: "netflix.com" },
      { name: "Shahid", nameAr: "شاهد", slug: "cancel-shahid", domain: "shahid.mbc.net" },
      { name: "Disney+", nameAr: "Disney+", slug: "cancel-disney-plus", domain: "disneyplus.com" },
      { name: "YouTube Premium", nameAr: "YouTube Premium", slug: "cancel-youtube-premium", domain: "youtube.com" },
      { name: "Apple TV+", nameAr: "Apple TV+", slug: "cancel-apple-tv-plus", domain: "apple.com" },
      { name: "Amazon Prime Video", nameAr: "Amazon Prime", slug: "cancel-amazon-prime", domain: "amazon.sa" },
      { name: "OSN+", nameAr: "OSN+", slug: "cancel-osn-plus", domain: "osnplus.com" },
      { name: "Max (HBO)", nameAr: "Max HBO", slug: "cancel-max-hbo", domain: "max.com" },
      { name: "beIN CONNECT", nameAr: "beIN", slug: "cancel-bein-connect", domain: "bein.com" },
      { name: "Paramount+", nameAr: "Paramount+", slug: "cancel-paramount-plus", domain: "paramountplus.com" },
      { name: "Hulu", nameAr: "Hulu", slug: "cancel-hulu", domain: "hulu.com" },
      { name: "Crunchyroll", nameAr: "Crunchyroll", slug: "cancel-crunchyroll", domain: "crunchyroll.com" },
      { name: "STARZ Play", nameAr: "STARZ Play", slug: "cancel-starz-play", domain: "starzplay.com" },
      { name: "TOD", nameAr: "TOD", slug: "cancel-tod", domain: "tod.tv" },
      { name: "Shahid Sports", nameAr: "شاهد رياضة", slug: "cancel-mbc-shahid-sports", domain: "shahid.mbc.net" },
      { name: "Discovery+", nameAr: "Discovery+", slug: "cancel-discovery-plus", domain: "discoveryplus.com" },
      { name: "Peacock", nameAr: "Peacock", slug: "cancel-peacock", domain: "peacocktv.com" },
      { name: "AMC+", nameAr: "AMC+", slug: "cancel-amc-plus", domain: "amcplus.com" },
      { name: "MGM+", nameAr: "MGM+", slug: "cancel-mgm-plus", domain: "mgmplus.com" },
      { name: "BritBox", nameAr: "BritBox", slug: "cancel-britbox", domain: "britbox.com" },
      { name: "Hayu", nameAr: "Hayu", slug: "cancel-hayu", domain: "hayu.com" },
      { name: "Acorn TV", nameAr: "Acorn TV", slug: "cancel-acorn-tv", domain: "acorn.tv" },
      { name: "MUBI", nameAr: "MUBI", slug: "cancel-mubi", domain: "mubi.com" },
      { name: "Viu", nameAr: "Viu", slug: "cancel-viu", domain: "viu.com" },
      { name: "WeTV", nameAr: "WeTV", slug: "cancel-wetv", domain: "wetv.vip" },
      { name: "Wavo", nameAr: "Wavo", slug: "cancel-wavo", domain: "wavo.com" },
      { name: "iCflix", nameAr: "iCflix", slug: "cancel-icflix", domain: "icflix.com" },
      { name: "Rotana+", nameAr: "روتانا+", slug: "cancel-rotana-plus", domain: "rotana.net" },
      { name: "Funimation", nameAr: "Funimation", slug: "cancel-funimation", domain: "funimation.com" },
      { name: "CuriosityStream", nameAr: "CuriosityStream", slug: "cancel-curiosity-stream", domain: "curiositystream.com" },
    ],
  },
  {
    title: "بث الموسيقى",
    guides: [
      { name: "Spotify", nameAr: "Spotify", slug: "cancel-spotify", domain: "spotify.com" },
      { name: "Apple Music", nameAr: "Apple Music", slug: "cancel-apple-music", domain: "apple.com" },
      { name: "Anghami", nameAr: "أنغامي", slug: "cancel-anghami", domain: "anghami.com" },
      { name: "YouTube Music", nameAr: "YouTube Music", slug: "cancel-youtube-music", domain: "youtube.com" },
      { name: "Amazon Music", nameAr: "Amazon Music", slug: "cancel-amazon-music", domain: "amazon.com" },
      { name: "Tidal", nameAr: "Tidal", slug: "cancel-tidal", domain: "tidal.com" },
      { name: "Deezer", nameAr: "Deezer", slug: "cancel-deezer", domain: "deezer.com" },
      { name: "SoundCloud Go", nameAr: "SoundCloud Go", slug: "cancel-soundcloud-go", domain: "soundcloud.com" },
      { name: "Qobuz", nameAr: "Qobuz", slug: "cancel-qobuz", domain: "qobuz.com" },
      { name: "Pandora", nameAr: "Pandora", slug: "cancel-pandora", domain: "pandora.com" },
      { name: "Resso", nameAr: "Resso", slug: "cancel-resso", domain: "resso.com" },
      { name: "Audible", nameAr: "Audible", slug: "cancel-audible", domain: "audible.com" },
    ],
  },
  {
    title: "إنتاجية وتقنية",
    guides: [
      { name: "ChatGPT Plus", nameAr: "ChatGPT Plus", slug: "cancel-chatgpt", domain: "openai.com" },
      { name: "Claude Pro", nameAr: "Claude Pro", slug: "cancel-claude-pro", domain: "claude.ai" },
      { name: "Adobe", nameAr: "Adobe", slug: "cancel-adobe", domain: "adobe.com" },
      { name: "Adobe Photoshop", nameAr: "Adobe Photoshop", slug: "cancel-adobe-photoshop", domain: "adobe.com" },
      { name: "Adobe Illustrator", nameAr: "Adobe Illustrator", slug: "cancel-adobe-illustrator", domain: "adobe.com" },
      { name: "Adobe Lightroom", nameAr: "Adobe Lightroom", slug: "cancel-adobe-lightroom", domain: "adobe.com" },
      { name: "Adobe Express", nameAr: "Adobe Express", slug: "cancel-adobe-express", domain: "adobe.com" },
      { name: "Microsoft 365", nameAr: "Microsoft 365", slug: "cancel-microsoft-365", domain: "microsoft.com" },
      { name: "Microsoft Teams", nameAr: "Microsoft Teams", slug: "cancel-microsoft-teams", domain: "microsoft.com" },
      { name: "iCloud+", nameAr: "iCloud+", slug: "cancel-icloud", domain: "icloud.com" },
      { name: "Dropbox", nameAr: "Dropbox", slug: "cancel-dropbox", domain: "dropbox.com" },
      { name: "Notion", nameAr: "Notion", slug: "cancel-notion", domain: "notion.so" },
      { name: "Canva Pro", nameAr: "Canva Pro", slug: "cancel-canva-pro", domain: "canva.com" },
      { name: "Grammarly", nameAr: "Grammarly", slug: "cancel-grammarly", domain: "grammarly.com" },
      { name: "GitHub Copilot", nameAr: "GitHub Copilot", slug: "cancel-github-copilot", domain: "github.com" },
      { name: "Figma", nameAr: "Figma", slug: "cancel-figma-pro", domain: "figma.com" },
      { name: "Slack Pro", nameAr: "Slack Pro", slug: "cancel-slack-pro", domain: "slack.com" },
      { name: "Zoom", nameAr: "Zoom", slug: "cancel-zoom", domain: "zoom.us" },
      { name: "Google One", nameAr: "Google One", slug: "cancel-google-one", domain: "one.google.com" },
      { name: "Google Workspace", nameAr: "Google Workspace", slug: "cancel-google-workspace", domain: "workspace.google.com" },
      { name: "Google Play Pass", nameAr: "Google Play Pass", slug: "cancel-google-play-pass", domain: "play.google.com" },
      { name: "OneDrive", nameAr: "OneDrive", slug: "cancel-onedrive-standalone", domain: "onedrive.live.com" },
      { name: "Midjourney", nameAr: "Midjourney", slug: "cancel-midjourney", domain: "midjourney.com" },
      { name: "Jasper AI", nameAr: "Jasper AI", slug: "cancel-jasper-ai", domain: "jasper.ai" },
      { name: "Copy.ai", nameAr: "Copy.ai", slug: "cancel-copy-ai", domain: "copy.ai" },
      { name: "Perplexity Pro", nameAr: "Perplexity Pro", slug: "cancel-perplexity-pro", domain: "perplexity.ai" },
      { name: "Runway ML", nameAr: "Runway ML", slug: "cancel-runway-ml", domain: "runwayml.com" },
      { name: "Writesonic", nameAr: "Writesonic", slug: "cancel-writesonic", domain: "writesonic.com" },
      { name: "Framer", nameAr: "Framer", slug: "cancel-framer", domain: "framer.com" },
      { name: "Webflow", nameAr: "Webflow", slug: "cancel-webflow", domain: "webflow.com" },
      { name: "Squarespace", nameAr: "Squarespace", slug: "cancel-squarespace", domain: "squarespace.com" },
      { name: "Shopify", nameAr: "Shopify", slug: "cancel-shopify", domain: "shopify.com" },
      { name: "Sketch", nameAr: "Sketch", slug: "cancel-sketch", domain: "sketch.com" },
      { name: "InVision", nameAr: "InVision", slug: "cancel-invision", domain: "invisionapp.com" },
      { name: "Evernote", nameAr: "Evernote", slug: "cancel-evernote-premium", domain: "evernote.com" },
      { name: "Todoist", nameAr: "Todoist", slug: "cancel-todoist-premium", domain: "todoist.com" },
      { name: "Bear Pro", nameAr: "Bear Pro", slug: "cancel-bear-pro", domain: "bear.app" },
      { name: "Obsidian Sync", nameAr: "Obsidian Sync", slug: "cancel-obsidian-sync", domain: "obsidian.md" },
      { name: "Replit Pro", nameAr: "Replit Pro", slug: "cancel-replit-pro", domain: "replit.com" },
      { name: "Setapp", nameAr: "Setapp", slug: "cancel-setapp", domain: "setapp.com" },
      { name: "Parallels", nameAr: "Parallels", slug: "cancel-parallels", domain: "parallels.com" },
      { name: "Principle App", nameAr: "Principle", slug: "cancel-principle-app", domain: "principleformac.com" },
    ],
  },
  {
    title: "ألعاب",
    guides: [
      { name: "Xbox Game Pass", nameAr: "Xbox Game Pass", slug: "cancel-xbox-game-pass", domain: "xbox.com" },
      { name: "PlayStation Plus", nameAr: "PlayStation+", slug: "cancel-playstation-plus", domain: "playstation.com" },
      { name: "Nintendo Switch Online", nameAr: "Nintendo Switch Online", slug: "cancel-nintendo-switch-online", domain: "nintendo.com" },
      { name: "EA Play", nameAr: "EA Play", slug: "cancel-ea-play", domain: "ea.com" },
      { name: "EA Play Pro", nameAr: "EA Play Pro", slug: "cancel-ea-play-pro", domain: "ea.com" },
      { name: "Apple Arcade", nameAr: "Apple Arcade", slug: "cancel-apple-arcade", domain: "apple.com" },
      { name: "Ubisoft+", nameAr: "Ubisoft+", slug: "cancel-ubisoft-plus", domain: "ubisoft.com" },
      { name: "GeForce NOW", nameAr: "GeForce NOW", slug: "cancel-geforce-now", domain: "nvidia.com" },
      { name: "Amazon Luna", nameAr: "Amazon Luna", slug: "cancel-amazon-luna", domain: "amazon.com" },
      { name: "Humble Choice", nameAr: "Humble Choice", slug: "cancel-humble-choice", domain: "humblebundle.com" },
      { name: "Discord Nitro", nameAr: "Discord Nitro", slug: "cancel-discord-nitro", domain: "discord.com" },
      { name: "Amazon Prime Gaming", nameAr: "Prime Gaming", slug: "cancel-amazon-prime-gaming", domain: "amazon.com" },
    ],
  },
  {
    title: "VPN وأمان",
    guides: [
      { name: "NordVPN", nameAr: "NordVPN", slug: "cancel-nordvpn", domain: "nordvpn.com" },
      { name: "ExpressVPN", nameAr: "ExpressVPN", slug: "cancel-expressvpn", domain: "expressvpn.com" },
      { name: "Surfshark", nameAr: "Surfshark", slug: "cancel-surfshark", domain: "surfshark.com" },
      { name: "CyberGhost", nameAr: "CyberGhost", slug: "cancel-cyberghost", domain: "cyberghostvpn.com" },
      { name: "ProtonVPN", nameAr: "ProtonVPN", slug: "cancel-protonvpn", domain: "protonvpn.com" },
      { name: "Private Internet Access", nameAr: "PIA", slug: "cancel-private-internet-access", domain: "privateinternetaccess.com" },
      { name: "Mullvad", nameAr: "Mullvad", slug: "cancel-mullvad", domain: "mullvad.net" },
      { name: "1Password", nameAr: "1Password", slug: "cancel-1password", domain: "1password.com" },
      { name: "LastPass", nameAr: "LastPass", slug: "cancel-lastpass", domain: "lastpass.com" },
      { name: "Dashlane", nameAr: "Dashlane", slug: "cancel-dashlane", domain: "dashlane.com" },
      { name: "Bitwarden", nameAr: "Bitwarden", slug: "cancel-bitwarden-premium", domain: "bitwarden.com" },
      { name: "Norton 360", nameAr: "Norton 360", slug: "cancel-norton-360", domain: "norton.com" },
      { name: "McAfee", nameAr: "McAfee", slug: "cancel-mcafee", domain: "mcafee.com" },
      { name: "Kaspersky", nameAr: "Kaspersky", slug: "cancel-kaspersky", domain: "kaspersky.com" },
      { name: "ProtonMail", nameAr: "ProtonMail", slug: "cancel-protonmail", domain: "proton.me" },
    ],
  },
  {
    title: "صحة ولياقة",
    guides: [
      { name: "Headspace", nameAr: "Headspace", slug: "cancel-headspace", domain: "headspace.com" },
      { name: "Calm", nameAr: "Calm", slug: "cancel-calm", domain: "calm.com" },
      { name: "Noom", nameAr: "Noom", slug: "cancel-noom", domain: "noom.com" },
      { name: "Fitbit Premium", nameAr: "Fitbit Premium", slug: "cancel-fitbit-premium", domain: "fitbit.com" },
      { name: "MyFitnessPal", nameAr: "MyFitnessPal", slug: "cancel-myfitnesspal", domain: "myfitnesspal.com" },
      { name: "Strava", nameAr: "Strava", slug: "cancel-strava", domain: "strava.com" },
      { name: "Peloton", nameAr: "Peloton", slug: "cancel-peloton", domain: "onepeloton.com" },
      { name: "Whoop", nameAr: "Whoop", slug: "cancel-whoop", domain: "whoop.com" },
      { name: "Flo Premium", nameAr: "Flo", slug: "cancel-flo-premium", domain: "flo.health" },
      { name: "Nike Training Club", nameAr: "Nike Training", slug: "cancel-nike-training-club", domain: "nike.com" },
    ],
  },
  {
    title: "تواصل اجتماعي",
    guides: [
      { name: "LinkedIn Premium", nameAr: "LinkedIn Premium", slug: "cancel-linkedin-premium", domain: "linkedin.com" },
      { name: "LinkedIn Learning", nameAr: "LinkedIn Learning", slug: "cancel-linkedin-learning", domain: "linkedin.com" },
      { name: "X Premium", nameAr: "X Premium", slug: "cancel-x-premium", domain: "x.com" },
      { name: "Snapchat+", nameAr: "Snapchat+", slug: "cancel-snapchat-plus", domain: "snapchat.com" },
      { name: "Telegram Premium", nameAr: "Telegram Premium", slug: "cancel-telegram-premium", domain: "telegram.org" },
      { name: "WhatsApp Business", nameAr: "WhatsApp Business", slug: "cancel-whatsapp-business", domain: "whatsapp.com" },
      { name: "Tinder Gold", nameAr: "Tinder Gold", slug: "cancel-tinder-gold", domain: "tinder.com" },
      { name: "Bumble Premium", nameAr: "Bumble Premium", slug: "cancel-bumble-premium", domain: "bumble.com" },
      { name: "Hinge+", nameAr: "Hinge+", slug: "cancel-hinge-plus", domain: "hinge.co" },
      { name: "Match.com", nameAr: "Match.com", slug: "cancel-match-com", domain: "match.com" },
    ],
  },
  {
    title: "تعلم وتعليم",
    guides: [
      { name: "Duolingo Plus", nameAr: "Duolingo+", slug: "cancel-duolingo-plus", domain: "duolingo.com" },
      { name: "MasterClass", nameAr: "MasterClass", slug: "cancel-masterclass", domain: "masterclass.com" },
      { name: "Skillshare", nameAr: "Skillshare", slug: "cancel-skillshare", domain: "skillshare.com" },
      { name: "Coursera Plus", nameAr: "Coursera Plus", slug: "cancel-coursera-plus", domain: "coursera.org" },
      { name: "Codecademy Pro", nameAr: "Codecademy Pro", slug: "cancel-codecademy-pro", domain: "codecademy.com" },
      { name: "DataCamp", nameAr: "DataCamp", slug: "cancel-datacamp", domain: "datacamp.com" },
      { name: "Udemy Business", nameAr: "Udemy Business", slug: "cancel-udemy-business", domain: "udemy.com" },
      { name: "Brilliant", nameAr: "Brilliant", slug: "cancel-brilliant", domain: "brilliant.org" },
      { name: "Blinkist", nameAr: "Blinkist", slug: "cancel-blinkist", domain: "blinkist.com" },
    ],
  },
  {
    title: "أخبار وقراءة",
    guides: [
      { name: "Medium", nameAr: "Medium", slug: "cancel-medium-membership", domain: "medium.com" },
      { name: "NY Times", nameAr: "NY Times", slug: "cancel-nytimes", domain: "nytimes.com" },
      { name: "Bloomberg", nameAr: "Bloomberg", slug: "cancel-bloomberg", domain: "bloomberg.com" },
      { name: "Financial Times", nameAr: "Financial Times", slug: "cancel-financial-times", domain: "ft.com" },
      { name: "Washington Post", nameAr: "Washington Post", slug: "cancel-washington-post", domain: "washingtonpost.com" },
      { name: "WSJ", nameAr: "WSJ", slug: "cancel-wsj", domain: "wsj.com" },
      { name: "Al Arabiya Premium", nameAr: "العربية بريميوم", slug: "cancel-al-arabiya-premium", domain: "alarabiya.net" },
    ],
  },
  {
    title: "تسوق وتوصيل",
    guides: [
      { name: "Costco", nameAr: "Costco", slug: "cancel-costco", domain: "costco.com" },
      { name: "Sam's Club", nameAr: "Sam's Club", slug: "cancel-sams-club", domain: "samsclub.com" },
      { name: "Walmart+", nameAr: "Walmart+", slug: "cancel-walmart-plus", domain: "walmart.com" },
      { name: "Instacart+", nameAr: "Instacart+", slug: "cancel-instacart-plus", domain: "instacart.com" },
      { name: "DoorDash DashPass", nameAr: "DoorDash", slug: "cancel-doordash-dashpass", domain: "doordash.com" },
      { name: "Grubhub+", nameAr: "Grubhub+", slug: "cancel-grubhub-plus", domain: "grubhub.com" },
      { name: "Uber One", nameAr: "Uber One", slug: "cancel-uber-one", domain: "uber.com" },
      { name: "Uber Pass", nameAr: "Uber Pass", slug: "cancel-uber-pass", domain: "uber.com" },
      { name: "Lyft Pink", nameAr: "Lyft Pink", slug: "cancel-lyft-pink", domain: "lyft.com" },
      { name: "Bolt Plus", nameAr: "Bolt Plus", slug: "cancel-bolt-plus", domain: "bolt.eu" },
    ],
  },
  {
    title: "تسويق وأعمال",
    guides: [
      { name: "Semrush", nameAr: "Semrush", slug: "cancel-semrush", domain: "semrush.com" },
      { name: "Ahrefs", nameAr: "Ahrefs", slug: "cancel-ahrefs", domain: "ahrefs.com" },
      { name: "Mailchimp", nameAr: "Mailchimp", slug: "cancel-mailchimp", domain: "mailchimp.com" },
      { name: "Buffer", nameAr: "Buffer", slug: "cancel-buffer", domain: "buffer.com" },
      { name: "Hootsuite", nameAr: "Hootsuite", slug: "cancel-hootsuite", domain: "hootsuite.com" },
      { name: "Zapier", nameAr: "Zapier", slug: "cancel-zapier", domain: "zapier.com" },
      { name: "IFTTT Pro", nameAr: "IFTTT Pro", slug: "cancel-ifttt-pro", domain: "ifttt.com" },
      { name: "Webex", nameAr: "Webex", slug: "cancel-webex", domain: "webex.com" },
    ],
  },
  {
    title: "تخزين سحابي",
    guides: [
      { name: "pCloud", nameAr: "pCloud", slug: "cancel-pcloud", domain: "pcloud.com" },
      { name: "Box Cloud", nameAr: "Box", slug: "cancel-box-cloud", domain: "box.com" },
      { name: "MEGA Pro", nameAr: "MEGA Pro", slug: "cancel-mega-pro", domain: "mega.io" },
    ],
  },
  {
    title: "أخرى",
    guides: [
      { name: "Zee5", nameAr: "Zee5", slug: "cancel-zee5", domain: "zee5.com" },
    ],
  },
];

export default function GuidesPage() {
  const totalGuides = CATEGORIES.reduce((sum, cat) => sum + cat.guides.length, 0);

  return (
    <div className="min-h-screen" style={{ background: "var(--color-surface)" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-50 px-6 py-4"
        style={{
          background: "rgba(15,23,42,0.92)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
        }}
      >
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <a
            href="/"
            className="no-underline"
            style={{ direction: "ltr", unicodeBidi: "bidi-override" }}
          >
            <span className="nav-logo text-xl">
              yalla<span className="accent">cancel</span>
            </span>
          </a>
          <a
            href="/"
            className="text-sm font-bold text-white/60 hover:text-white transition-colors no-underline"
          >
            حلل كشفك مجاناً
          </a>
        </div>
      </header>

      {/* Hero */}
      <section
        className="px-6 py-16 text-center"
        style={{
          background: "linear-gradient(135deg, #0F172A 0%, #1a2744 50%, #0d2618 100%)",
        }}
      >
        <div className="max-w-[700px] mx-auto">
          <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-4">
            أدلة إلغاء الاشتراكات
          </h1>
          <p className="text-base text-white/55 leading-relaxed mb-6">
            {totalGuides}+ دليل خطوة بخطوة لإلغاء أشهر الاشتراكات — اختر الخدمة اللي تبغى تلغيها ونوريك الطريقة.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 bg-[var(--color-primary)] text-white px-8 py-3.5 rounded-xl font-bold text-sm no-underline transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            أو ارفع كشفك ونكتشف لك اشتراكاتك
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </a>
        </div>
      </section>

      {/* Guide Categories */}
      <div className="max-w-[1200px] mx-auto px-6 py-16">
        {CATEGORIES.map((cat) => (
          <div key={cat.title} className="mb-14">
            <h2 className="text-lg font-black text-[var(--color-dark)] mb-5 flex items-center gap-3">
              <span className="w-1.5 h-7 bg-[var(--color-primary)] rounded-full inline-block" />
              {cat.title}
              <span className="text-sm font-semibold text-[var(--color-text-muted)]">({cat.guides.length})</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
              {cat.guides.map((g) => (
                <a
                  key={g.slug}
                  href={`/${g.slug}.html`}
                  className="flex items-center gap-2.5 bg-white border border-[var(--color-border)] rounded-xl px-4 py-3 transition-all hover:border-[var(--color-primary)] hover:-translate-y-0.5 hover:shadow-md text-sm font-semibold no-underline text-[var(--color-text-primary)]"
                >
                  <img
                    src={FAV(g.domain)}
                    alt=""
                    className="w-5 h-5 rounded flex-shrink-0"
                    loading="lazy"
                  />
                  <span className="truncate">{g.nameAr}</span>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <section className="py-16 px-8 text-center" style={{ background: "var(--color-primary)" }}>
        <div className="max-w-[600px] mx-auto">
          <h2 className="text-2xl font-black text-white mb-3">
            مو لاقي الخدمة اللي تبغاها؟
          </h2>
          <p className="text-base text-white/85 mb-6">
            ارفع كشف حسابك ونكتشف كل اشتراكاتك تلقائياً مع روابط الإلغاء.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2.5 bg-white text-[var(--color-primary-dark)] px-10 py-4 rounded-xl font-black text-base no-underline transition-all hover:-translate-y-0.5"
            style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}
          >
            ارفع كشفك مجاناً
          </a>
        </div>
      </section>

      {/* Mini footer */}
      <footer className="py-8 px-6 text-center" style={{ background: "var(--color-dark)" }}>
        <a href="/" className="no-underline" style={{ direction: "ltr", unicodeBidi: "bidi-override" }}>
          <span className="nav-logo text-lg">yalla<span className="accent">cancel</span></span>
        </a>
        <p className="text-xs text-white/30 mt-3">&copy; ٢٠٢٦ Yalla Cancel</p>
      </footer>
    </div>
  );
}
