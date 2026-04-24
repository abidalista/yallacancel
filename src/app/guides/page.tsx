"use client";

import { useState, useMemo } from "react";

const LOGO = (domain: string) =>
  `https://logo.clearbit.com/${domain}`;
const FAV = (domain: string) =>
  `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

type Difficulty = "easy" | "medium" | "hard";

interface Guide {
  name: string;
  nameAr: string;
  slug: string;
  domain: string;
  difficulty: Difficulty;
  category: string;
}

const ALL_GUIDES: Guide[] = [
  // ── Saudi Services ──
  { name: "stc", nameAr: "stc", slug: "cancel-stc", domain: "stc.com.sa", difficulty: "medium", category: "سعودية" },
  { name: "Mobily", nameAr: "موبايلي", slug: "cancel-mobily", domain: "mobily.com.sa", difficulty: "medium", category: "سعودية" },
  { name: "Zain", nameAr: "زين", slug: "cancel-zain", domain: "sa.zain.com", difficulty: "medium", category: "سعودية" },
  { name: "Hungerstation Pro", nameAr: "هنقرستيشن برو", slug: "cancel-hungerstation-pro", domain: "hungerstation.com", difficulty: "easy", category: "سعودية" },
  { name: "Jahez Plus", nameAr: "جاهز بلس", slug: "cancel-jahez-plus", domain: "jahez.net", difficulty: "easy", category: "سعودية" },
  { name: "Careem Plus", nameAr: "كريم بلس", slug: "cancel-careem-plus", domain: "careem.com", difficulty: "easy", category: "سعودية" },
  { name: "Noon VIP", nameAr: "نون VIP", slug: "cancel-noon-vip", domain: "noon.com", difficulty: "easy", category: "سعودية" },
  { name: "Tamara", nameAr: "تمارا", slug: "cancel-tamara", domain: "tamara.co", difficulty: "easy", category: "سعودية" },
  { name: "Tabby", nameAr: "تابي", slug: "cancel-tabby", domain: "tabby.ai", difficulty: "easy", category: "سعودية" },
  { name: "Nana Direct", nameAr: "نانا", slug: "cancel-nana-direct", domain: "nana.sa", difficulty: "easy", category: "سعودية" },
  { name: "stc pay", nameAr: "stc pay", slug: "cancel-stc-pay", domain: "stcpay.com.sa", difficulty: "medium", category: "سعودية" },
  { name: "Jawwy", nameAr: "جوّي", slug: "cancel-jawwy", domain: "jawwy.sa", difficulty: "easy", category: "سعودية" },
  { name: "Mrsool", nameAr: "مرسول", slug: "cancel-mrsool", domain: "mrsool.com", difficulty: "easy", category: "سعودية" },
  { name: "ToYou", nameAr: "ToYou", slug: "cancel-toyou", domain: "toyou.io", difficulty: "easy", category: "سعودية" },
  { name: "Wssel", nameAr: "وصّل", slug: "cancel-wssel", domain: "wssel.com", difficulty: "easy", category: "سعودية" },
  { name: "Extra Rewards", nameAr: "اكسترا", slug: "cancel-extra-rewards", domain: "extra.com", difficulty: "easy", category: "سعودية" },
  { name: "Salam Mobile", nameAr: "سلام موبايل", slug: "cancel-salam-mobile", domain: "salam.sa", difficulty: "medium", category: "سعودية" },
  { name: "Virgin Mobile SA", nameAr: "فيرجن موبايل", slug: "cancel-virgin-mobile-sa", domain: "virginmobile.sa", difficulty: "medium", category: "سعودية" },
  { name: "Riyadh Season", nameAr: "موسم الرياض", slug: "cancel-riyadh-season", domain: "riyadhseason.sa", difficulty: "easy", category: "سعودية" },
  { name: "The Entertainer", nameAr: "The Entertainer", slug: "cancel-the-entertainer", domain: "theentertainerme.com", difficulty: "medium", category: "سعودية" },
  { name: "Yajny", nameAr: "يجني", slug: "cancel-yajny", domain: "yajny.com", difficulty: "easy", category: "سعودية" },
  { name: "Floward", nameAr: "فلاورد", slug: "cancel-floward", domain: "floward.com", difficulty: "easy", category: "سعودية" },
  { name: "Golden Scent", nameAr: "قولدن سنت", slug: "cancel-golden-scent", domain: "goldenscent.com", difficulty: "easy", category: "سعودية" },
  { name: "Al Dawaa", nameAr: "الدواء", slug: "cancel-al-dawaa-delivery", domain: "al-dawaa.com", difficulty: "easy", category: "سعودية" },
  { name: "Sehha App", nameAr: "صحة", slug: "cancel-sehha-app", domain: "sehha.sa", difficulty: "easy", category: "سعودية" },
  { name: "Alfursan", nameAr: "الفرسان", slug: "cancel-saudi-airlines-alfursan", domain: "saudia.com", difficulty: "medium", category: "سعودية" },
  { name: "Lulu", nameAr: "لولو", slug: "cancel-lulu-hypermarket", domain: "luluhypermarket.com", difficulty: "easy", category: "سعودية" },
  { name: "Deliveroo Plus", nameAr: "ديليفرو بلس", slug: "cancel-deliveroo-plus", domain: "deliveroo.com", difficulty: "easy", category: "سعودية" },
  { name: "Talabat Pro", nameAr: "طلبات برو", slug: "cancel-talabat-pro", domain: "talabat.com", difficulty: "easy", category: "سعودية" },
  { name: "stc Play", nameAr: "stc Play", slug: "cancel-stc-play", domain: "stcplay.gg", difficulty: "easy", category: "سعودية" },
  { name: "Qatat", nameAr: "قطات", slug: "cancel-qatat", domain: "qatat.com", difficulty: "easy", category: "سعودية" },
  // ── Video Streaming ──
  { name: "Netflix", nameAr: "Netflix", slug: "cancel-netflix", domain: "netflix.com", difficulty: "easy", category: "بث فيديو" },
  { name: "Shahid", nameAr: "شاهد", slug: "cancel-shahid", domain: "shahid.mbc.net", difficulty: "easy", category: "بث فيديو" },
  { name: "Disney+", nameAr: "Disney+", slug: "cancel-disney-plus", domain: "disneyplus.com", difficulty: "easy", category: "بث فيديو" },
  { name: "YouTube Premium", nameAr: "YouTube Premium", slug: "cancel-youtube-premium", domain: "youtube.com", difficulty: "easy", category: "بث فيديو" },
  { name: "Apple TV+", nameAr: "Apple TV+", slug: "cancel-apple-tv-plus", domain: "apple.com", difficulty: "easy", category: "بث فيديو" },
  { name: "Amazon Prime", nameAr: "Amazon Prime", slug: "cancel-amazon-prime", domain: "amazon.sa", difficulty: "easy", category: "بث فيديو" },
  { name: "OSN+", nameAr: "OSN+", slug: "cancel-osn-plus", domain: "osnplus.com", difficulty: "medium", category: "بث فيديو" },
  { name: "Max (HBO)", nameAr: "Max HBO", slug: "cancel-max-hbo", domain: "max.com", difficulty: "easy", category: "بث فيديو" },
  { name: "beIN CONNECT", nameAr: "beIN", slug: "cancel-bein-connect", domain: "bein.com", difficulty: "hard", category: "بث فيديو" },
  { name: "Paramount+", nameAr: "Paramount+", slug: "cancel-paramount-plus", domain: "paramountplus.com", difficulty: "easy", category: "بث فيديو" },
  { name: "Hulu", nameAr: "Hulu", slug: "cancel-hulu", domain: "hulu.com", difficulty: "easy", category: "بث فيديو" },
  { name: "Crunchyroll", nameAr: "Crunchyroll", slug: "cancel-crunchyroll", domain: "crunchyroll.com", difficulty: "easy", category: "بث فيديو" },
  { name: "STARZ Play", nameAr: "STARZ Play", slug: "cancel-starz-play", domain: "starzplay.com", difficulty: "medium", category: "بث فيديو" },
  { name: "TOD", nameAr: "TOD", slug: "cancel-tod", domain: "tod.tv", difficulty: "medium", category: "بث فيديو" },
  { name: "Shahid Sports", nameAr: "شاهد رياضة", slug: "cancel-mbc-shahid-sports", domain: "shahid.mbc.net", difficulty: "medium", category: "بث فيديو" },
  { name: "Discovery+", nameAr: "Discovery+", slug: "cancel-discovery-plus", domain: "discoveryplus.com", difficulty: "easy", category: "بث فيديو" },
  { name: "Peacock", nameAr: "Peacock", slug: "cancel-peacock", domain: "peacocktv.com", difficulty: "easy", category: "بث فيديو" },
  { name: "AMC+", nameAr: "AMC+", slug: "cancel-amc-plus", domain: "amcplus.com", difficulty: "easy", category: "بث فيديو" },
  { name: "MGM+", nameAr: "MGM+", slug: "cancel-mgm-plus", domain: "mgmplus.com", difficulty: "easy", category: "بث فيديو" },
  { name: "BritBox", nameAr: "BritBox", slug: "cancel-britbox", domain: "britbox.com", difficulty: "easy", category: "بث فيديو" },
  { name: "Hayu", nameAr: "Hayu", slug: "cancel-hayu", domain: "hayu.com", difficulty: "easy", category: "بث فيديو" },
  { name: "Acorn TV", nameAr: "Acorn TV", slug: "cancel-acorn-tv", domain: "acorn.tv", difficulty: "easy", category: "بث فيديو" },
  { name: "MUBI", nameAr: "MUBI", slug: "cancel-mubi", domain: "mubi.com", difficulty: "easy", category: "بث فيديو" },
  { name: "Viu", nameAr: "Viu", slug: "cancel-viu", domain: "viu.com", difficulty: "easy", category: "بث فيديو" },
  { name: "WeTV", nameAr: "WeTV", slug: "cancel-wetv", domain: "wetv.vip", difficulty: "easy", category: "بث فيديو" },
  { name: "Wavo", nameAr: "Wavo", slug: "cancel-wavo", domain: "wavo.com", difficulty: "easy", category: "بث فيديو" },
  { name: "iCflix", nameAr: "iCflix", slug: "cancel-icflix", domain: "icflix.com", difficulty: "easy", category: "بث فيديو" },
  { name: "Rotana+", nameAr: "روتانا+", slug: "cancel-rotana-plus", domain: "rotana.net", difficulty: "easy", category: "بث فيديو" },
  { name: "Funimation", nameAr: "Funimation", slug: "cancel-funimation", domain: "funimation.com", difficulty: "easy", category: "بث فيديو" },
  { name: "CuriosityStream", nameAr: "CuriosityStream", slug: "cancel-curiosity-stream", domain: "curiositystream.com", difficulty: "easy", category: "بث فيديو" },
  // ── Music ──
  { name: "Spotify", nameAr: "Spotify", slug: "cancel-spotify", domain: "spotify.com", difficulty: "easy", category: "موسيقى" },
  { name: "Apple Music", nameAr: "Apple Music", slug: "cancel-apple-music", domain: "apple.com", difficulty: "easy", category: "موسيقى" },
  { name: "Anghami", nameAr: "أنغامي", slug: "cancel-anghami", domain: "anghami.com", difficulty: "easy", category: "موسيقى" },
  { name: "YouTube Music", nameAr: "YouTube Music", slug: "cancel-youtube-music", domain: "youtube.com", difficulty: "easy", category: "موسيقى" },
  { name: "Amazon Music", nameAr: "Amazon Music", slug: "cancel-amazon-music", domain: "amazon.com", difficulty: "easy", category: "موسيقى" },
  { name: "Tidal", nameAr: "Tidal", slug: "cancel-tidal", domain: "tidal.com", difficulty: "easy", category: "موسيقى" },
  { name: "Deezer", nameAr: "Deezer", slug: "cancel-deezer", domain: "deezer.com", difficulty: "easy", category: "موسيقى" },
  { name: "SoundCloud Go", nameAr: "SoundCloud Go", slug: "cancel-soundcloud-go", domain: "soundcloud.com", difficulty: "easy", category: "موسيقى" },
  { name: "Qobuz", nameAr: "Qobuz", slug: "cancel-qobuz", domain: "qobuz.com", difficulty: "easy", category: "موسيقى" },
  { name: "Pandora", nameAr: "Pandora", slug: "cancel-pandora", domain: "pandora.com", difficulty: "easy", category: "موسيقى" },
  { name: "Resso", nameAr: "Resso", slug: "cancel-resso", domain: "resso.com", difficulty: "easy", category: "موسيقى" },
  { name: "Audible", nameAr: "Audible", slug: "cancel-audible", domain: "audible.com", difficulty: "easy", category: "موسيقى" },
  // ── Productivity ──
  { name: "ChatGPT Plus", nameAr: "ChatGPT Plus", slug: "cancel-chatgpt", domain: "openai.com", difficulty: "easy", category: "إنتاجية" },
  { name: "Claude Pro", nameAr: "Claude Pro", slug: "cancel-claude-pro", domain: "claude.ai", difficulty: "easy", category: "إنتاجية" },
  { name: "Adobe", nameAr: "Adobe", slug: "cancel-adobe", domain: "adobe.com", difficulty: "hard", category: "إنتاجية" },
  { name: "Adobe Photoshop", nameAr: "Adobe Photoshop", slug: "cancel-adobe-photoshop", domain: "adobe.com", difficulty: "hard", category: "إنتاجية" },
  { name: "Adobe Illustrator", nameAr: "Adobe Illustrator", slug: "cancel-adobe-illustrator", domain: "adobe.com", difficulty: "hard", category: "إنتاجية" },
  { name: "Adobe Lightroom", nameAr: "Adobe Lightroom", slug: "cancel-adobe-lightroom", domain: "adobe.com", difficulty: "hard", category: "إنتاجية" },
  { name: "Adobe Express", nameAr: "Adobe Express", slug: "cancel-adobe-express", domain: "adobe.com", difficulty: "hard", category: "إنتاجية" },
  { name: "Microsoft 365", nameAr: "Microsoft 365", slug: "cancel-microsoft-365", domain: "microsoft.com", difficulty: "medium", category: "إنتاجية" },
  { name: "Microsoft Teams", nameAr: "Microsoft Teams", slug: "cancel-microsoft-teams", domain: "microsoft.com", difficulty: "medium", category: "إنتاجية" },
  { name: "iCloud+", nameAr: "iCloud+", slug: "cancel-icloud", domain: "icloud.com", difficulty: "easy", category: "إنتاجية" },
  { name: "Dropbox", nameAr: "Dropbox", slug: "cancel-dropbox", domain: "dropbox.com", difficulty: "easy", category: "إنتاجية" },
  { name: "Notion", nameAr: "Notion", slug: "cancel-notion", domain: "notion.so", difficulty: "easy", category: "إنتاجية" },
  { name: "Canva Pro", nameAr: "Canva Pro", slug: "cancel-canva-pro", domain: "canva.com", difficulty: "easy", category: "إنتاجية" },
  { name: "Grammarly", nameAr: "Grammarly", slug: "cancel-grammarly", domain: "grammarly.com", difficulty: "easy", category: "إنتاجية" },
  { name: "GitHub Copilot", nameAr: "GitHub Copilot", slug: "cancel-github-copilot", domain: "github.com", difficulty: "easy", category: "إنتاجية" },
  { name: "Figma", nameAr: "Figma", slug: "cancel-figma-pro", domain: "figma.com", difficulty: "easy", category: "إنتاجية" },
  { name: "Slack Pro", nameAr: "Slack Pro", slug: "cancel-slack-pro", domain: "slack.com", difficulty: "easy", category: "إنتاجية" },
  { name: "Zoom", nameAr: "Zoom", slug: "cancel-zoom", domain: "zoom.us", difficulty: "easy", category: "إنتاجية" },
  { name: "Google One", nameAr: "Google One", slug: "cancel-google-one", domain: "one.google.com", difficulty: "easy", category: "إنتاجية" },
  { name: "Google Workspace", nameAr: "Google Workspace", slug: "cancel-google-workspace", domain: "workspace.google.com", difficulty: "medium", category: "إنتاجية" },
  { name: "Google Play Pass", nameAr: "Google Play Pass", slug: "cancel-google-play-pass", domain: "play.google.com", difficulty: "easy", category: "إنتاجية" },
  { name: "OneDrive", nameAr: "OneDrive", slug: "cancel-onedrive-standalone", domain: "onedrive.live.com", difficulty: "medium", category: "إنتاجية" },
  { name: "Midjourney", nameAr: "Midjourney", slug: "cancel-midjourney", domain: "midjourney.com", difficulty: "easy", category: "إنتاجية" },
  { name: "Jasper AI", nameAr: "Jasper AI", slug: "cancel-jasper-ai", domain: "jasper.ai", difficulty: "easy", category: "إنتاجية" },
  { name: "Copy.ai", nameAr: "Copy.ai", slug: "cancel-copy-ai", domain: "copy.ai", difficulty: "easy", category: "إنتاجية" },
  { name: "Perplexity Pro", nameAr: "Perplexity Pro", slug: "cancel-perplexity-pro", domain: "perplexity.ai", difficulty: "easy", category: "إنتاجية" },
  { name: "Runway ML", nameAr: "Runway ML", slug: "cancel-runway-ml", domain: "runwayml.com", difficulty: "easy", category: "إنتاجية" },
  { name: "Writesonic", nameAr: "Writesonic", slug: "cancel-writesonic", domain: "writesonic.com", difficulty: "easy", category: "إنتاجية" },
  { name: "Framer", nameAr: "Framer", slug: "cancel-framer", domain: "framer.com", difficulty: "easy", category: "إنتاجية" },
  { name: "Webflow", nameAr: "Webflow", slug: "cancel-webflow", domain: "webflow.com", difficulty: "medium", category: "إنتاجية" },
  { name: "Squarespace", nameAr: "Squarespace", slug: "cancel-squarespace", domain: "squarespace.com", difficulty: "medium", category: "إنتاجية" },
  { name: "Shopify", nameAr: "Shopify", slug: "cancel-shopify", domain: "shopify.com", difficulty: "medium", category: "إنتاجية" },
  { name: "Sketch", nameAr: "Sketch", slug: "cancel-sketch", domain: "sketch.com", difficulty: "easy", category: "إنتاجية" },
  { name: "InVision", nameAr: "InVision", slug: "cancel-invision", domain: "invisionapp.com", difficulty: "easy", category: "إنتاجية" },
  { name: "Evernote", nameAr: "Evernote", slug: "cancel-evernote-premium", domain: "evernote.com", difficulty: "easy", category: "إنتاجية" },
  { name: "Todoist", nameAr: "Todoist", slug: "cancel-todoist-premium", domain: "todoist.com", difficulty: "easy", category: "إنتاجية" },
  { name: "Bear Pro", nameAr: "Bear Pro", slug: "cancel-bear-pro", domain: "bear.app", difficulty: "easy", category: "إنتاجية" },
  { name: "Obsidian Sync", nameAr: "Obsidian Sync", slug: "cancel-obsidian-sync", domain: "obsidian.md", difficulty: "easy", category: "إنتاجية" },
  { name: "Replit Pro", nameAr: "Replit Pro", slug: "cancel-replit-pro", domain: "replit.com", difficulty: "easy", category: "إنتاجية" },
  { name: "Setapp", nameAr: "Setapp", slug: "cancel-setapp", domain: "setapp.com", difficulty: "easy", category: "إنتاجية" },
  { name: "Parallels", nameAr: "Parallels", slug: "cancel-parallels", domain: "parallels.com", difficulty: "medium", category: "إنتاجية" },
  { name: "Principle", nameAr: "Principle", slug: "cancel-principle-app", domain: "principleformac.com", difficulty: "easy", category: "إنتاجية" },
  // ── Gaming ──
  { name: "Xbox Game Pass", nameAr: "Xbox Game Pass", slug: "cancel-xbox-game-pass", domain: "xbox.com", difficulty: "easy", category: "ألعاب" },
  { name: "PlayStation+", nameAr: "PlayStation+", slug: "cancel-playstation-plus", domain: "playstation.com", difficulty: "medium", category: "ألعاب" },
  { name: "Nintendo Switch Online", nameAr: "Nintendo Switch", slug: "cancel-nintendo-switch-online", domain: "nintendo.com", difficulty: "medium", category: "ألعاب" },
  { name: "EA Play", nameAr: "EA Play", slug: "cancel-ea-play", domain: "ea.com", difficulty: "easy", category: "ألعاب" },
  { name: "EA Play Pro", nameAr: "EA Play Pro", slug: "cancel-ea-play-pro", domain: "ea.com", difficulty: "easy", category: "ألعاب" },
  { name: "Apple Arcade", nameAr: "Apple Arcade", slug: "cancel-apple-arcade", domain: "apple.com", difficulty: "easy", category: "ألعاب" },
  { name: "Ubisoft+", nameAr: "Ubisoft+", slug: "cancel-ubisoft-plus", domain: "ubisoft.com", difficulty: "medium", category: "ألعاب" },
  { name: "GeForce NOW", nameAr: "GeForce NOW", slug: "cancel-geforce-now", domain: "nvidia.com", difficulty: "easy", category: "ألعاب" },
  { name: "Amazon Luna", nameAr: "Amazon Luna", slug: "cancel-amazon-luna", domain: "amazon.com", difficulty: "easy", category: "ألعاب" },
  { name: "Humble Choice", nameAr: "Humble Choice", slug: "cancel-humble-choice", domain: "humblebundle.com", difficulty: "easy", category: "ألعاب" },
  { name: "Discord Nitro", nameAr: "Discord Nitro", slug: "cancel-discord-nitro", domain: "discord.com", difficulty: "easy", category: "ألعاب" },
  { name: "Prime Gaming", nameAr: "Prime Gaming", slug: "cancel-amazon-prime-gaming", domain: "amazon.com", difficulty: "easy", category: "ألعاب" },
  // ── VPN & Security ──
  { name: "NordVPN", nameAr: "NordVPN", slug: "cancel-nordvpn", domain: "nordvpn.com", difficulty: "medium", category: "VPN وأمان" },
  { name: "ExpressVPN", nameAr: "ExpressVPN", slug: "cancel-expressvpn", domain: "expressvpn.com", difficulty: "medium", category: "VPN وأمان" },
  { name: "Surfshark", nameAr: "Surfshark", slug: "cancel-surfshark", domain: "surfshark.com", difficulty: "medium", category: "VPN وأمان" },
  { name: "CyberGhost", nameAr: "CyberGhost", slug: "cancel-cyberghost", domain: "cyberghostvpn.com", difficulty: "medium", category: "VPN وأمان" },
  { name: "ProtonVPN", nameAr: "ProtonVPN", slug: "cancel-protonvpn", domain: "protonvpn.com", difficulty: "easy", category: "VPN وأمان" },
  { name: "PIA", nameAr: "PIA", slug: "cancel-private-internet-access", domain: "privateinternetaccess.com", difficulty: "medium", category: "VPN وأمان" },
  { name: "Mullvad", nameAr: "Mullvad", slug: "cancel-mullvad", domain: "mullvad.net", difficulty: "easy", category: "VPN وأمان" },
  { name: "1Password", nameAr: "1Password", slug: "cancel-1password", domain: "1password.com", difficulty: "easy", category: "VPN وأمان" },
  { name: "LastPass", nameAr: "LastPass", slug: "cancel-lastpass", domain: "lastpass.com", difficulty: "medium", category: "VPN وأمان" },
  { name: "Dashlane", nameAr: "Dashlane", slug: "cancel-dashlane", domain: "dashlane.com", difficulty: "easy", category: "VPN وأمان" },
  { name: "Bitwarden", nameAr: "Bitwarden", slug: "cancel-bitwarden-premium", domain: "bitwarden.com", difficulty: "easy", category: "VPN وأمان" },
  { name: "Norton 360", nameAr: "Norton 360", slug: "cancel-norton-360", domain: "norton.com", difficulty: "hard", category: "VPN وأمان" },
  { name: "McAfee", nameAr: "McAfee", slug: "cancel-mcafee", domain: "mcafee.com", difficulty: "hard", category: "VPN وأمان" },
  { name: "Kaspersky", nameAr: "Kaspersky", slug: "cancel-kaspersky", domain: "kaspersky.com", difficulty: "medium", category: "VPN وأمان" },
  { name: "ProtonMail", nameAr: "ProtonMail", slug: "cancel-protonmail", domain: "proton.me", difficulty: "easy", category: "VPN وأمان" },
  // ── Health ──
  { name: "Headspace", nameAr: "Headspace", slug: "cancel-headspace", domain: "headspace.com", difficulty: "easy", category: "صحة" },
  { name: "Calm", nameAr: "Calm", slug: "cancel-calm", domain: "calm.com", difficulty: "easy", category: "صحة" },
  { name: "Noom", nameAr: "Noom", slug: "cancel-noom", domain: "noom.com", difficulty: "hard", category: "صحة" },
  { name: "Fitbit Premium", nameAr: "Fitbit Premium", slug: "cancel-fitbit-premium", domain: "fitbit.com", difficulty: "easy", category: "صحة" },
  { name: "MyFitnessPal", nameAr: "MyFitnessPal", slug: "cancel-myfitnesspal", domain: "myfitnesspal.com", difficulty: "easy", category: "صحة" },
  { name: "Strava", nameAr: "Strava", slug: "cancel-strava", domain: "strava.com", difficulty: "easy", category: "صحة" },
  { name: "Peloton", nameAr: "Peloton", slug: "cancel-peloton", domain: "onepeloton.com", difficulty: "medium", category: "صحة" },
  { name: "Whoop", nameAr: "Whoop", slug: "cancel-whoop", domain: "whoop.com", difficulty: "hard", category: "صحة" },
  { name: "Flo", nameAr: "Flo", slug: "cancel-flo-premium", domain: "flo.health", difficulty: "easy", category: "صحة" },
  { name: "Nike Training", nameAr: "Nike Training", slug: "cancel-nike-training-club", domain: "nike.com", difficulty: "easy", category: "صحة" },
  // ── Social ──
  { name: "LinkedIn Premium", nameAr: "LinkedIn Premium", slug: "cancel-linkedin-premium", domain: "linkedin.com", difficulty: "easy", category: "تواصل" },
  { name: "LinkedIn Learning", nameAr: "LinkedIn Learning", slug: "cancel-linkedin-learning", domain: "linkedin.com", difficulty: "easy", category: "تواصل" },
  { name: "X Premium", nameAr: "X Premium", slug: "cancel-x-premium", domain: "x.com", difficulty: "easy", category: "تواصل" },
  { name: "Snapchat+", nameAr: "Snapchat+", slug: "cancel-snapchat-plus", domain: "snapchat.com", difficulty: "easy", category: "تواصل" },
  { name: "Telegram Premium", nameAr: "Telegram Premium", slug: "cancel-telegram-premium", domain: "telegram.org", difficulty: "easy", category: "تواصل" },
  { name: "WhatsApp Business", nameAr: "WhatsApp Business", slug: "cancel-whatsapp-business", domain: "whatsapp.com", difficulty: "easy", category: "تواصل" },
  { name: "Tinder Gold", nameAr: "Tinder Gold", slug: "cancel-tinder-gold", domain: "tinder.com", difficulty: "medium", category: "تواصل" },
  { name: "Bumble Premium", nameAr: "Bumble Premium", slug: "cancel-bumble-premium", domain: "bumble.com", difficulty: "easy", category: "تواصل" },
  { name: "Hinge+", nameAr: "Hinge+", slug: "cancel-hinge-plus", domain: "hinge.co", difficulty: "easy", category: "تواصل" },
  { name: "Match.com", nameAr: "Match.com", slug: "cancel-match-com", domain: "match.com", difficulty: "hard", category: "تواصل" },
  // ── Education ──
  { name: "Duolingo+", nameAr: "Duolingo+", slug: "cancel-duolingo-plus", domain: "duolingo.com", difficulty: "easy", category: "تعليم" },
  { name: "MasterClass", nameAr: "MasterClass", slug: "cancel-masterclass", domain: "masterclass.com", difficulty: "easy", category: "تعليم" },
  { name: "Skillshare", nameAr: "Skillshare", slug: "cancel-skillshare", domain: "skillshare.com", difficulty: "easy", category: "تعليم" },
  { name: "Coursera Plus", nameAr: "Coursera Plus", slug: "cancel-coursera-plus", domain: "coursera.org", difficulty: "easy", category: "تعليم" },
  { name: "Codecademy Pro", nameAr: "Codecademy Pro", slug: "cancel-codecademy-pro", domain: "codecademy.com", difficulty: "easy", category: "تعليم" },
  { name: "DataCamp", nameAr: "DataCamp", slug: "cancel-datacamp", domain: "datacamp.com", difficulty: "easy", category: "تعليم" },
  { name: "Udemy Business", nameAr: "Udemy Business", slug: "cancel-udemy-business", domain: "udemy.com", difficulty: "easy", category: "تعليم" },
  { name: "Brilliant", nameAr: "Brilliant", slug: "cancel-brilliant", domain: "brilliant.org", difficulty: "easy", category: "تعليم" },
  { name: "Blinkist", nameAr: "Blinkist", slug: "cancel-blinkist", domain: "blinkist.com", difficulty: "easy", category: "تعليم" },
  // ── News ──
  { name: "Medium", nameAr: "Medium", slug: "cancel-medium-membership", domain: "medium.com", difficulty: "easy", category: "أخبار" },
  { name: "NY Times", nameAr: "NY Times", slug: "cancel-nytimes", domain: "nytimes.com", difficulty: "hard", category: "أخبار" },
  { name: "Bloomberg", nameAr: "Bloomberg", slug: "cancel-bloomberg", domain: "bloomberg.com", difficulty: "medium", category: "أخبار" },
  { name: "Financial Times", nameAr: "Financial Times", slug: "cancel-financial-times", domain: "ft.com", difficulty: "hard", category: "أخبار" },
  { name: "Washington Post", nameAr: "Washington Post", slug: "cancel-washington-post", domain: "washingtonpost.com", difficulty: "medium", category: "أخبار" },
  { name: "WSJ", nameAr: "WSJ", slug: "cancel-wsj", domain: "wsj.com", difficulty: "hard", category: "أخبار" },
  { name: "Al Arabiya Premium", nameAr: "العربية بريميوم", slug: "cancel-al-arabiya-premium", domain: "alarabiya.net", difficulty: "easy", category: "أخبار" },
  // ── Shopping ──
  { name: "Costco", nameAr: "Costco", slug: "cancel-costco", domain: "costco.com", difficulty: "medium", category: "تسوق" },
  { name: "Sam's Club", nameAr: "Sam's Club", slug: "cancel-sams-club", domain: "samsclub.com", difficulty: "easy", category: "تسوق" },
  { name: "Walmart+", nameAr: "Walmart+", slug: "cancel-walmart-plus", domain: "walmart.com", difficulty: "easy", category: "تسوق" },
  { name: "Instacart+", nameAr: "Instacart+", slug: "cancel-instacart-plus", domain: "instacart.com", difficulty: "easy", category: "تسوق" },
  { name: "DoorDash", nameAr: "DoorDash", slug: "cancel-doordash-dashpass", domain: "doordash.com", difficulty: "easy", category: "تسوق" },
  { name: "Grubhub+", nameAr: "Grubhub+", slug: "cancel-grubhub-plus", domain: "grubhub.com", difficulty: "easy", category: "تسوق" },
  { name: "Uber One", nameAr: "Uber One", slug: "cancel-uber-one", domain: "uber.com", difficulty: "easy", category: "تسوق" },
  { name: "Uber Pass", nameAr: "Uber Pass", slug: "cancel-uber-pass", domain: "uber.com", difficulty: "easy", category: "تسوق" },
  { name: "Lyft Pink", nameAr: "Lyft Pink", slug: "cancel-lyft-pink", domain: "lyft.com", difficulty: "easy", category: "تسوق" },
  { name: "Bolt Plus", nameAr: "Bolt Plus", slug: "cancel-bolt-plus", domain: "bolt.eu", difficulty: "easy", category: "تسوق" },
  // ── Marketing ──
  { name: "Semrush", nameAr: "Semrush", slug: "cancel-semrush", domain: "semrush.com", difficulty: "hard", category: "أعمال" },
  { name: "Ahrefs", nameAr: "Ahrefs", slug: "cancel-ahrefs", domain: "ahrefs.com", difficulty: "easy", category: "أعمال" },
  { name: "Mailchimp", nameAr: "Mailchimp", slug: "cancel-mailchimp", domain: "mailchimp.com", difficulty: "easy", category: "أعمال" },
  { name: "Buffer", nameAr: "Buffer", slug: "cancel-buffer", domain: "buffer.com", difficulty: "easy", category: "أعمال" },
  { name: "Hootsuite", nameAr: "Hootsuite", slug: "cancel-hootsuite", domain: "hootsuite.com", difficulty: "medium", category: "أعمال" },
  { name: "Zapier", nameAr: "Zapier", slug: "cancel-zapier", domain: "zapier.com", difficulty: "easy", category: "أعمال" },
  { name: "IFTTT Pro", nameAr: "IFTTT Pro", slug: "cancel-ifttt-pro", domain: "ifttt.com", difficulty: "easy", category: "أعمال" },
  { name: "Webex", nameAr: "Webex", slug: "cancel-webex", domain: "webex.com", difficulty: "medium", category: "أعمال" },
  // ── Cloud Storage ──
  { name: "pCloud", nameAr: "pCloud", slug: "cancel-pcloud", domain: "pcloud.com", difficulty: "easy", category: "أعمال" },
  { name: "Box", nameAr: "Box", slug: "cancel-box-cloud", domain: "box.com", difficulty: "easy", category: "أعمال" },
  { name: "MEGA Pro", nameAr: "MEGA Pro", slug: "cancel-mega-pro", domain: "mega.io", difficulty: "easy", category: "أعمال" },
  { name: "Zee5", nameAr: "Zee5", slug: "cancel-zee5", domain: "zee5.com", difficulty: "easy", category: "بث فيديو" },
];

const CATEGORIES = [...new Set(ALL_GUIDES.map((g) => g.category))];

const DIFFICULTY_LABELS: Record<Difficulty, { ar: string; color: string; bg: string }> = {
  easy: { ar: "سهل", color: "#065F46", bg: "#ECFDF5" },
  medium: { ar: "متوسط", color: "#92400E", bg: "#FFFBEB" },
  hard: { ar: "صعب", color: "#B91C1C", bg: "#FEF2F2" },
};

export default function GuidesPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = ALL_GUIDES;
    if (activeCategory) list = list.filter((g) => g.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (g) => g.name.toLowerCase().includes(q) || g.nameAr.includes(q)
      );
    }
    return list;
  }, [search, activeCategory]);

  const countByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cat of CATEGORIES) {
      let list = ALL_GUIDES.filter((g) => g.category === cat);
      if (search.trim()) {
        const q = search.toLowerCase();
        list = list.filter((g) => g.name.toLowerCase().includes(q) || g.nameAr.includes(q));
      }
      counts[cat] = list.length;
    }
    return counts;
  }, [search]);

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
          <a href="/" className="no-underline" style={{ direction: "ltr", unicodeBidi: "bidi-override" }}>
            <span className="nav-logo nav-logo-light text-xl">yalla<span className="accent">cancel</span></span>
          </a>
          <a
            href="/"
            className="inline-flex items-center gap-2 bg-[var(--color-primary)] text-white px-5 py-2 rounded-xl font-bold text-sm no-underline transition-all hover:-translate-y-0.5"
          >
            حلل كشفك مجاناً
          </a>
        </div>
      </header>

      {/* Hero + Search */}
      <section
        className="px-6 py-14 text-center"
        style={{ background: "linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #312E81 100%)" }}
      >
        <div className="max-w-[600px] mx-auto">
          <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-3">
            أدلة إلغاء الاشتراكات
          </h1>
          <p className="text-base text-white/55 leading-relaxed mb-8">
            {ALL_GUIDES.length}+ دليل خطوة بخطوة — ابحث عن الخدمة اللي تبغى تلغيها
          </p>
          {/* Search bar */}
          <div className="relative max-w-[480px] mx-auto">
            <svg className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" width="20" height="20" fill="none" viewBox="0 0 24 24">
              <path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث... Netflix, شاهد, Adobe..."
              className="w-full pr-12 pl-5 py-4 rounded-2xl border-2 border-white/10 bg-white/5 text-white placeholder-white/35 text-base font-semibold outline-none transition-all focus:border-[var(--color-primary)] focus:bg-white/10"
            />
          </div>
        </div>
      </section>

      {/* Category filters + Results */}
      <div className="max-w-[1200px] mx-auto px-6 py-10">
        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              !activeCategory
                ? "bg-[var(--color-dark)] text-white"
                : "bg-white border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]"
            }`}
          >
            الكل ({search.trim() ? filtered.length : ALL_GUIDES.length})
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeCategory === cat
                  ? "bg-[var(--color-dark)] text-white"
                  : "bg-white border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]"
              }`}
            >
              {cat} ({countByCategory[cat] || 0})
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="text-sm text-[var(--color-text-muted)] mb-5">
          {filtered.length === 0
            ? "ما لقينا نتائج — جرب كلمة ثانية"
            : `${filtered.length} دليل إلغاء`}
        </p>

        {/* Guide cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((g) => {
            const diff = DIFFICULTY_LABELS[g.difficulty];
            return (
              <a
                key={g.slug}
                href={`/${g.slug}.html`}
                className="flex items-center gap-3 bg-white border border-[var(--color-border)] rounded-2xl px-5 py-4 transition-all hover:border-[var(--color-primary)] hover:-translate-y-0.5 hover:shadow-md no-underline"
              >
                <img
                  src={LOGO(g.domain)}
                  alt=""
                  className="w-8 h-8 rounded-lg flex-shrink-0 object-contain"
                  loading="lazy"
                  onError={(e) => {
                    const img = e.currentTarget;
                    if (!img.dataset.fallback) {
                      img.dataset.fallback = "1";
                      img.src = FAV(g.domain);
                    }
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-[var(--color-text-primary)] truncate">
                    {g.nameAr}
                  </div>
                  <div className="text-xs text-[var(--color-text-muted)]">
                    كيف ألغي {g.name}
                  </div>
                </div>
                <span
                  className="text-[10px] font-bold px-2 py-1 rounded-lg flex-shrink-0"
                  style={{ background: diff.bg, color: diff.color }}
                >
                  {diff.ar}
                </span>
              </a>
            );
          })}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-lg font-bold text-[var(--color-text-secondary)] mb-3">ما لقينا الخدمة</p>
            <p className="text-sm text-[var(--color-text-muted)] mb-6">ارفع كشف حسابك ونكتشف اشتراكاتك تلقائياً</p>
            <a
              href="/"
              className="inline-flex items-center gap-2 bg-[var(--color-primary)] text-white px-8 py-3.5 rounded-xl font-bold text-sm no-underline transition-all hover:-translate-y-0.5"
            >
              ارفع كشفك مجاناً
            </a>
          </div>
        )}
      </div>

      {/* CTA */}
      <section className="py-14 px-8 text-center" style={{ background: "var(--color-primary)" }}>
        <div className="max-w-[600px] mx-auto">
          <h2 className="text-2xl font-black text-white mb-3">مو لاقي الخدمة؟</h2>
          <p className="text-base text-white/85 mb-6">ارفع كشف حسابك ونكتشف كل اشتراكاتك تلقائياً مع روابط الإلغاء.</p>
          <a
            href="/"
            className="inline-flex items-center gap-2.5 bg-white text-[var(--color-primary-dark)] px-10 py-4 rounded-xl font-black text-base no-underline transition-all hover:-translate-y-0.5"
            style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}
          >
            ارفع كشفك مجاناً
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 text-center" style={{ background: "var(--color-dark)" }}>
        <a href="/" className="no-underline" style={{ direction: "ltr", unicodeBidi: "bidi-override" }}>
          <span className="nav-logo nav-logo-light text-lg justify-center">yalla<span className="accent">cancel</span></span>
        </a>
        <p className="text-xs text-white/30 mt-3">&copy; ٢٠٢٦ Yalla Cancel</p>
      </footer>
    </div>
  );
}
