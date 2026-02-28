"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowLeft } from "lucide-react";
import MerchantLogo from "@/components/MerchantLogo";

type Difficulty = "easy" | "hard";

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
  { name: "stc", nameAr: "stc", slug: "cancel-stc", domain: "stc.com.sa", difficulty: "easy", category: "سعدة" },
  { name: "Mobily", nameAr: "با", slug: "cancel-mobily", domain: "mobily.com.sa", difficulty: "easy", category: "سعدة" },
  { name: "Zain", nameAr: "ز", slug: "cancel-zain", domain: "sa.zain.com", difficulty: "easy", category: "سعدة" },
  { name: "Hungerstation Pro", nameAr: "رستش بر", slug: "cancel-hungerstation-pro", domain: "hungerstation.com", difficulty: "easy", category: "سعدة" },
  { name: "Jahez Plus", nameAr: "جاز بس", slug: "cancel-jahez-plus", domain: "jahez.net", difficulty: "easy", category: "سعدة" },
  { name: "Careem Plus", nameAr: "ر بس", slug: "cancel-careem-plus", domain: "careem.com", difficulty: "easy", category: "سعدة" },
  { name: "Noon VIP", nameAr: " VIP", slug: "cancel-noon-vip", domain: "noon.com", difficulty: "easy", category: "سعدة" },
  { name: "Tamara", nameAr: "تارا", slug: "cancel-tamara", domain: "tamara.co", difficulty: "easy", category: "سعدة" },
  { name: "Tabby", nameAr: "تاب", slug: "cancel-tabby", domain: "tabby.ai", difficulty: "easy", category: "سعدة" },
  { name: "Nana Direct", nameAr: "اا", slug: "cancel-nana-direct", domain: "nana.sa", difficulty: "easy", category: "سعدة" },
  { name: "stc pay", nameAr: "stc pay", slug: "cancel-stc-pay", domain: "stcpay.com.sa", difficulty: "easy", category: "سعدة" },
  { name: "Jawwy", nameAr: "ج", slug: "cancel-jawwy", domain: "jawwy.sa", difficulty: "easy", category: "سعدة" },
  { name: "Mrsool", nameAr: "رس", slug: "cancel-mrsool", domain: "mrsool.com", difficulty: "easy", category: "سعدة" },
  { name: "ToYou", nameAr: "ToYou", slug: "cancel-toyou", domain: "toyou.io", difficulty: "easy", category: "سعدة" },
  { name: "Wssel", nameAr: "ص", slug: "cancel-wssel", domain: "wssel.com", difficulty: "easy", category: "سعدة" },
  { name: "Extra Rewards", nameAr: "استرا", slug: "cancel-extra-rewards", domain: "extra.com", difficulty: "easy", category: "سعدة" },
  { name: "Salam Mobile", nameAr: "سا با", slug: "cancel-salam-mobile", domain: "salam.sa", difficulty: "easy", category: "سعدة" },
  { name: "Virgin Mobile SA", nameAr: "رج با", slug: "cancel-virgin-mobile-sa", domain: "virginmobile.sa", difficulty: "easy", category: "سعدة" },
  { name: "Riyadh Season", nameAr: "س اراض", slug: "cancel-riyadh-season", domain: "riyadhseason.sa", difficulty: "easy", category: "سعدة" },
  { name: "The Entertainer", nameAr: "The Entertainer", slug: "cancel-the-entertainer", domain: "theentertainerme.com", difficulty: "easy", category: "سعدة" },
  { name: "Yajny", nameAr: "ج", slug: "cancel-yajny", domain: "yajny.com", difficulty: "easy", category: "سعدة" },
  { name: "Floward", nameAr: "ارد", slug: "cancel-floward", domain: "floward.com", difficulty: "easy", category: "سعدة" },
  { name: "Golden Scent", nameAr: "د ست", slug: "cancel-golden-scent", domain: "goldenscent.com", difficulty: "easy", category: "سعدة" },
  { name: "Al Dawaa", nameAr: "اداء", slug: "cancel-al-dawaa-delivery", domain: "al-dawaa.com", difficulty: "easy", category: "سعدة" },
  { name: "Sehha App", nameAr: "صحة", slug: "cancel-sehha-app", domain: "sehha.sa", difficulty: "easy", category: "سعدة" },
  { name: "Alfursan", nameAr: "ارسا", slug: "cancel-saudi-airlines-alfursan", domain: "saudia.com", difficulty: "easy", category: "سعدة" },
  { name: "Lulu", nameAr: "", slug: "cancel-lulu-hypermarket", domain: "luluhypermarket.com", difficulty: "easy", category: "سعدة" },
  { name: "Deliveroo Plus", nameAr: "در بس", slug: "cancel-deliveroo-plus", domain: "deliveroo.com", difficulty: "easy", category: "سعدة" },
  { name: "Talabat Pro", nameAr: "طبات بر", slug: "cancel-talabat-pro", domain: "talabat.com", difficulty: "easy", category: "سعدة" },
  { name: "stc Play", nameAr: "stc Play", slug: "cancel-stc-play", domain: "stcplay.gg", difficulty: "easy", category: "سعدة" },
  { name: "Qatat", nameAr: "طات", slug: "cancel-qatat", domain: "qatat.com", difficulty: "easy", category: "سعدة" },
  // ── Video Streaming ──
  { name: "Netflix", nameAr: "Netflix", slug: "cancel-netflix", domain: "netflix.com", difficulty: "easy", category: "بث د" },
  { name: "Shahid", nameAr: "شاد", slug: "cancel-shahid", domain: "shahid.mbc.net", difficulty: "easy", category: "بث د" },
  { name: "Disney+", nameAr: "Disney+", slug: "cancel-disney-plus", domain: "disneyplus.com", difficulty: "easy", category: "بث د" },
  { name: "YouTube Premium", nameAr: "YouTube Premium", slug: "cancel-youtube-premium", domain: "youtube.com", difficulty: "easy", category: "بث د" },
  { name: "Apple TV+", nameAr: "Apple TV+", slug: "cancel-apple-tv-plus", domain: "apple.com", difficulty: "easy", category: "بث د" },
  { name: "Amazon Prime", nameAr: "Amazon Prime", slug: "cancel-amazon-prime", domain: "amazon.sa", difficulty: "easy", category: "بث د" },
  { name: "OSN+", nameAr: "OSN+", slug: "cancel-osn-plus", domain: "osnplus.com", difficulty: "easy", category: "بث د" },
  { name: "Max (HBO)", nameAr: "Max HBO", slug: "cancel-max-hbo", domain: "max.com", difficulty: "easy", category: "بث د" },
  { name: "beIN CONNECT", nameAr: "beIN", slug: "cancel-bein-connect", domain: "bein.com", difficulty: "hard", category: "بث د" },
  { name: "Paramount+", nameAr: "Paramount+", slug: "cancel-paramount-plus", domain: "paramountplus.com", difficulty: "easy", category: "بث د" },
  { name: "Hulu", nameAr: "Hulu", slug: "cancel-hulu", domain: "hulu.com", difficulty: "easy", category: "بث د" },
  { name: "Crunchyroll", nameAr: "Crunchyroll", slug: "cancel-crunchyroll", domain: "crunchyroll.com", difficulty: "easy", category: "بث د" },
  { name: "STARZ Play", nameAr: "STARZ Play", slug: "cancel-starz-play", domain: "starzplay.com", difficulty: "easy", category: "بث د" },
  { name: "TOD", nameAr: "TOD", slug: "cancel-tod", domain: "tod.tv", difficulty: "easy", category: "بث د" },
  { name: "Shahid Sports", nameAr: "شاد راضة", slug: "cancel-mbc-shahid-sports", domain: "shahid.mbc.net", difficulty: "easy", category: "بث د" },
  { name: "Discovery+", nameAr: "Discovery+", slug: "cancel-discovery-plus", domain: "discoveryplus.com", difficulty: "easy", category: "بث د" },
  { name: "Peacock", nameAr: "Peacock", slug: "cancel-peacock", domain: "peacocktv.com", difficulty: "easy", category: "بث د" },
  { name: "AMC+", nameAr: "AMC+", slug: "cancel-amc-plus", domain: "amcplus.com", difficulty: "easy", category: "بث د" },
  { name: "MGM+", nameAr: "MGM+", slug: "cancel-mgm-plus", domain: "mgmplus.com", difficulty: "easy", category: "بث د" },
  { name: "BritBox", nameAr: "BritBox", slug: "cancel-britbox", domain: "britbox.com", difficulty: "easy", category: "بث د" },
  { name: "Hayu", nameAr: "Hayu", slug: "cancel-hayu", domain: "hayu.com", difficulty: "easy", category: "بث د" },
  { name: "Acorn TV", nameAr: "Acorn TV", slug: "cancel-acorn-tv", domain: "acorn.tv", difficulty: "easy", category: "بث د" },
  { name: "MUBI", nameAr: "MUBI", slug: "cancel-mubi", domain: "mubi.com", difficulty: "easy", category: "بث د" },
  { name: "Viu", nameAr: "Viu", slug: "cancel-viu", domain: "viu.com", difficulty: "easy", category: "بث د" },
  { name: "WeTV", nameAr: "WeTV", slug: "cancel-wetv", domain: "wetv.vip", difficulty: "easy", category: "بث د" },
  { name: "Wavo", nameAr: "Wavo", slug: "cancel-wavo", domain: "wavo.com", difficulty: "easy", category: "بث د" },
  { name: "iCflix", nameAr: "iCflix", slug: "cancel-icflix", domain: "icflix.com", difficulty: "easy", category: "بث د" },
  { name: "Rotana+", nameAr: "رتاا+", slug: "cancel-rotana-plus", domain: "rotana.net", difficulty: "easy", category: "بث د" },
  { name: "Funimation", nameAr: "Funimation", slug: "cancel-funimation", domain: "funimation.com", difficulty: "easy", category: "بث د" },
  { name: "CuriosityStream", nameAr: "CuriosityStream", slug: "cancel-curiosity-stream", domain: "curiositystream.com", difficulty: "easy", category: "بث د" },
  // ── Music ──
  { name: "Spotify", nameAr: "Spotify", slug: "cancel-spotify", domain: "spotify.com", difficulty: "easy", category: "س" },
  { name: "Apple Music", nameAr: "Apple Music", slug: "cancel-apple-music", domain: "apple.com", difficulty: "easy", category: "س" },
  { name: "Anghami", nameAr: "أغا", slug: "cancel-anghami", domain: "anghami.com", difficulty: "easy", category: "س" },
  { name: "YouTube Music", nameAr: "YouTube Music", slug: "cancel-youtube-music", domain: "youtube.com", difficulty: "easy", category: "س" },
  { name: "Amazon Music", nameAr: "Amazon Music", slug: "cancel-amazon-music", domain: "amazon.com", difficulty: "easy", category: "س" },
  { name: "Tidal", nameAr: "Tidal", slug: "cancel-tidal", domain: "tidal.com", difficulty: "easy", category: "س" },
  { name: "Deezer", nameAr: "Deezer", slug: "cancel-deezer", domain: "deezer.com", difficulty: "easy", category: "س" },
  { name: "SoundCloud Go", nameAr: "SoundCloud Go", slug: "cancel-soundcloud-go", domain: "soundcloud.com", difficulty: "easy", category: "س" },
  { name: "Qobuz", nameAr: "Qobuz", slug: "cancel-qobuz", domain: "qobuz.com", difficulty: "easy", category: "س" },
  { name: "Pandora", nameAr: "Pandora", slug: "cancel-pandora", domain: "pandora.com", difficulty: "easy", category: "س" },
  { name: "Resso", nameAr: "Resso", slug: "cancel-resso", domain: "resso.com", difficulty: "easy", category: "س" },
  { name: "Audible", nameAr: "Audible", slug: "cancel-audible", domain: "audible.com", difficulty: "easy", category: "س" },
  // ── Productivity ──
  { name: "ChatGPT Plus", nameAr: "ChatGPT Plus", slug: "cancel-chatgpt", domain: "openai.com", difficulty: "easy", category: "إتاجة" },
  { name: "Claude Pro", nameAr: "Claude Pro", slug: "cancel-claude-pro", domain: "claude.ai", difficulty: "easy", category: "إتاجة" },
  { name: "Adobe", nameAr: "Adobe", slug: "cancel-adobe", domain: "adobe.com", difficulty: "hard", category: "إتاجة" },
  { name: "Adobe Photoshop", nameAr: "Adobe Photoshop", slug: "cancel-adobe-photoshop", domain: "adobe.com", difficulty: "hard", category: "إتاجة" },
  { name: "Adobe Illustrator", nameAr: "Adobe Illustrator", slug: "cancel-adobe-illustrator", domain: "adobe.com", difficulty: "hard", category: "إتاجة" },
  { name: "Adobe Lightroom", nameAr: "Adobe Lightroom", slug: "cancel-adobe-lightroom", domain: "adobe.com", difficulty: "hard", category: "إتاجة" },
  { name: "Adobe Express", nameAr: "Adobe Express", slug: "cancel-adobe-express", domain: "adobe.com", difficulty: "hard", category: "إتاجة" },
  { name: "Microsoft 365", nameAr: "Microsoft 365", slug: "cancel-microsoft-365", domain: "microsoft.com", difficulty: "easy", category: "إتاجة" },
  { name: "Microsoft Teams", nameAr: "Microsoft Teams", slug: "cancel-microsoft-teams", domain: "microsoft.com", difficulty: "easy", category: "إتاجة" },
  { name: "iCloud+", nameAr: "iCloud+", slug: "cancel-icloud", domain: "icloud.com", difficulty: "easy", category: "إتاجة" },
  { name: "Dropbox", nameAr: "Dropbox", slug: "cancel-dropbox", domain: "dropbox.com", difficulty: "easy", category: "إتاجة" },
  { name: "Notion", nameAr: "Notion", slug: "cancel-notion", domain: "notion.so", difficulty: "easy", category: "إتاجة" },
  { name: "Canva Pro", nameAr: "Canva Pro", slug: "cancel-canva-pro", domain: "canva.com", difficulty: "easy", category: "إتاجة" },
  { name: "Grammarly", nameAr: "Grammarly", slug: "cancel-grammarly", domain: "grammarly.com", difficulty: "easy", category: "إتاجة" },
  { name: "GitHub Copilot", nameAr: "GitHub Copilot", slug: "cancel-github-copilot", domain: "github.com", difficulty: "easy", category: "إتاجة" },
  { name: "Figma", nameAr: "Figma", slug: "cancel-figma-pro", domain: "figma.com", difficulty: "easy", category: "إتاجة" },
  { name: "Slack Pro", nameAr: "Slack Pro", slug: "cancel-slack-pro", domain: "slack.com", difficulty: "easy", category: "إتاجة" },
  { name: "Zoom", nameAr: "Zoom", slug: "cancel-zoom", domain: "zoom.us", difficulty: "easy", category: "إتاجة" },
  { name: "Google One", nameAr: "Google One", slug: "cancel-google-one", domain: "one.google.com", difficulty: "easy", category: "إتاجة" },
  { name: "Google Workspace", nameAr: "Google Workspace", slug: "cancel-google-workspace", domain: "workspace.google.com", difficulty: "easy", category: "إتاجة" },
  { name: "Google Play Pass", nameAr: "Google Play Pass", slug: "cancel-google-play-pass", domain: "play.google.com", difficulty: "easy", category: "إتاجة" },
  { name: "OneDrive", nameAr: "OneDrive", slug: "cancel-onedrive-standalone", domain: "onedrive.live.com", difficulty: "easy", category: "إتاجة" },
  { name: "Midjourney", nameAr: "Midjourney", slug: "cancel-midjourney", domain: "midjourney.com", difficulty: "easy", category: "إتاجة" },
  { name: "Jasper AI", nameAr: "Jasper AI", slug: "cancel-jasper-ai", domain: "jasper.ai", difficulty: "easy", category: "إتاجة" },
  { name: "Copy.ai", nameAr: "Copy.ai", slug: "cancel-copy-ai", domain: "copy.ai", difficulty: "easy", category: "إتاجة" },
  { name: "Perplexity Pro", nameAr: "Perplexity Pro", slug: "cancel-perplexity-pro", domain: "perplexity.ai", difficulty: "easy", category: "إتاجة" },
  { name: "Runway ML", nameAr: "Runway ML", slug: "cancel-runway-ml", domain: "runwayml.com", difficulty: "easy", category: "إتاجة" },
  { name: "Writesonic", nameAr: "Writesonic", slug: "cancel-writesonic", domain: "writesonic.com", difficulty: "easy", category: "إتاجة" },
  { name: "Framer", nameAr: "Framer", slug: "cancel-framer", domain: "framer.com", difficulty: "easy", category: "إتاجة" },
  { name: "Webflow", nameAr: "Webflow", slug: "cancel-webflow", domain: "webflow.com", difficulty: "easy", category: "إتاجة" },
  { name: "Squarespace", nameAr: "Squarespace", slug: "cancel-squarespace", domain: "squarespace.com", difficulty: "easy", category: "إتاجة" },
  { name: "Shopify", nameAr: "Shopify", slug: "cancel-shopify", domain: "shopify.com", difficulty: "easy", category: "إتاجة" },
  { name: "Sketch", nameAr: "Sketch", slug: "cancel-sketch", domain: "sketch.com", difficulty: "easy", category: "إتاجة" },
  { name: "InVision", nameAr: "InVision", slug: "cancel-invision", domain: "invisionapp.com", difficulty: "easy", category: "إتاجة" },
  { name: "Evernote", nameAr: "Evernote", slug: "cancel-evernote-premium", domain: "evernote.com", difficulty: "easy", category: "إتاجة" },
  { name: "Todoist", nameAr: "Todoist", slug: "cancel-todoist-premium", domain: "todoist.com", difficulty: "easy", category: "إتاجة" },
  { name: "Bear Pro", nameAr: "Bear Pro", slug: "cancel-bear-pro", domain: "bear.app", difficulty: "easy", category: "إتاجة" },
  { name: "Obsidian Sync", nameAr: "Obsidian Sync", slug: "cancel-obsidian-sync", domain: "obsidian.md", difficulty: "easy", category: "إتاجة" },
  { name: "Replit Pro", nameAr: "Replit Pro", slug: "cancel-replit-pro", domain: "replit.com", difficulty: "easy", category: "إتاجة" },
  { name: "Setapp", nameAr: "Setapp", slug: "cancel-setapp", domain: "setapp.com", difficulty: "easy", category: "إتاجة" },
  { name: "Parallels", nameAr: "Parallels", slug: "cancel-parallels", domain: "parallels.com", difficulty: "easy", category: "إتاجة" },
  { name: "Principle", nameAr: "Principle", slug: "cancel-principle-app", domain: "principleformac.com", difficulty: "easy", category: "إتاجة" },
  // ── Gaming ──
  { name: "Xbox Game Pass", nameAr: "Xbox Game Pass", slug: "cancel-xbox-game-pass", domain: "xbox.com", difficulty: "easy", category: "أعاب" },
  { name: "PlayStation+", nameAr: "PlayStation+", slug: "cancel-playstation-plus", domain: "playstation.com", difficulty: "easy", category: "أعاب" },
  { name: "Nintendo Switch Online", nameAr: "Nintendo Switch", slug: "cancel-nintendo-switch-online", domain: "nintendo.com", difficulty: "easy", category: "أعاب" },
  { name: "EA Play", nameAr: "EA Play", slug: "cancel-ea-play", domain: "ea.com", difficulty: "easy", category: "أعاب" },
  { name: "EA Play Pro", nameAr: "EA Play Pro", slug: "cancel-ea-play-pro", domain: "ea.com", difficulty: "easy", category: "أعاب" },
  { name: "Apple Arcade", nameAr: "Apple Arcade", slug: "cancel-apple-arcade", domain: "apple.com", difficulty: "easy", category: "أعاب" },
  { name: "Ubisoft+", nameAr: "Ubisoft+", slug: "cancel-ubisoft-plus", domain: "ubisoft.com", difficulty: "easy", category: "أعاب" },
  { name: "GeForce NOW", nameAr: "GeForce NOW", slug: "cancel-geforce-now", domain: "nvidia.com", difficulty: "easy", category: "أعاب" },
  { name: "Amazon Luna", nameAr: "Amazon Luna", slug: "cancel-amazon-luna", domain: "amazon.com", difficulty: "easy", category: "أعاب" },
  { name: "Humble Choice", nameAr: "Humble Choice", slug: "cancel-humble-choice", domain: "humblebundle.com", difficulty: "easy", category: "أعاب" },
  { name: "Discord Nitro", nameAr: "Discord Nitro", slug: "cancel-discord-nitro", domain: "discord.com", difficulty: "easy", category: "أعاب" },
  { name: "Prime Gaming", nameAr: "Prime Gaming", slug: "cancel-amazon-prime-gaming", domain: "amazon.com", difficulty: "easy", category: "أعاب" },
  // ── VPN & Security ──
  { name: "NordVPN", nameAr: "NordVPN", slug: "cancel-nordvpn", domain: "nordvpn.com", difficulty: "hard", category: "VPN أا" },
  { name: "ExpressVPN", nameAr: "ExpressVPN", slug: "cancel-expressvpn", domain: "expressvpn.com", difficulty: "hard", category: "VPN أا" },
  { name: "Surfshark", nameAr: "Surfshark", slug: "cancel-surfshark", domain: "surfshark.com", difficulty: "hard", category: "VPN أا" },
  { name: "CyberGhost", nameAr: "CyberGhost", slug: "cancel-cyberghost", domain: "cyberghostvpn.com", difficulty: "hard", category: "VPN أا" },
  { name: "ProtonVPN", nameAr: "ProtonVPN", slug: "cancel-protonvpn", domain: "protonvpn.com", difficulty: "easy", category: "VPN أا" },
  { name: "PIA", nameAr: "PIA", slug: "cancel-private-internet-access", domain: "privateinternetaccess.com", difficulty: "hard", category: "VPN أا" },
  { name: "Mullvad", nameAr: "Mullvad", slug: "cancel-mullvad", domain: "mullvad.net", difficulty: "easy", category: "VPN أا" },
  { name: "1Password", nameAr: "1Password", slug: "cancel-1password", domain: "1password.com", difficulty: "easy", category: "VPN أا" },
  { name: "LastPass", nameAr: "LastPass", slug: "cancel-lastpass", domain: "lastpass.com", difficulty: "hard", category: "VPN أا" },
  { name: "Dashlane", nameAr: "Dashlane", slug: "cancel-dashlane", domain: "dashlane.com", difficulty: "easy", category: "VPN أا" },
  { name: "Bitwarden", nameAr: "Bitwarden", slug: "cancel-bitwarden-premium", domain: "bitwarden.com", difficulty: "easy", category: "VPN أا" },
  { name: "Norton 360", nameAr: "Norton 360", slug: "cancel-norton-360", domain: "norton.com", difficulty: "hard", category: "VPN أا" },
  { name: "McAfee", nameAr: "McAfee", slug: "cancel-mcafee", domain: "mcafee.com", difficulty: "hard", category: "VPN أا" },
  { name: "Kaspersky", nameAr: "Kaspersky", slug: "cancel-kaspersky", domain: "kaspersky.com", difficulty: "hard", category: "VPN أا" },
  { name: "ProtonMail", nameAr: "ProtonMail", slug: "cancel-protonmail", domain: "proton.me", difficulty: "easy", category: "VPN أا" },
  // ── Health ──
  { name: "Headspace", nameAr: "Headspace", slug: "cancel-headspace", domain: "headspace.com", difficulty: "easy", category: "صحة" },
  { name: "Calm", nameAr: "Calm", slug: "cancel-calm", domain: "calm.com", difficulty: "easy", category: "صحة" },
  { name: "Noom", nameAr: "Noom", slug: "cancel-noom", domain: "noom.com", difficulty: "hard", category: "صحة" },
  { name: "Fitbit Premium", nameAr: "Fitbit Premium", slug: "cancel-fitbit-premium", domain: "fitbit.com", difficulty: "easy", category: "صحة" },
  { name: "MyFitnessPal", nameAr: "MyFitnessPal", slug: "cancel-myfitnesspal", domain: "myfitnesspal.com", difficulty: "easy", category: "صحة" },
  { name: "Strava", nameAr: "Strava", slug: "cancel-strava", domain: "strava.com", difficulty: "easy", category: "صحة" },
  { name: "Peloton", nameAr: "Peloton", slug: "cancel-peloton", domain: "onepeloton.com", difficulty: "easy", category: "صحة" },
  { name: "Whoop", nameAr: "Whoop", slug: "cancel-whoop", domain: "whoop.com", difficulty: "hard", category: "صحة" },
  { name: "Flo", nameAr: "Flo", slug: "cancel-flo-premium", domain: "flo.health", difficulty: "easy", category: "صحة" },
  { name: "Nike Training", nameAr: "Nike Training", slug: "cancel-nike-training-club", domain: "nike.com", difficulty: "easy", category: "صحة" },
  // ── Social ──
  { name: "LinkedIn Premium", nameAr: "LinkedIn Premium", slug: "cancel-linkedin-premium", domain: "linkedin.com", difficulty: "easy", category: "تاص" },
  { name: "LinkedIn Learning", nameAr: "LinkedIn Learning", slug: "cancel-linkedin-learning", domain: "linkedin.com", difficulty: "easy", category: "تاص" },
  { name: "X Premium", nameAr: "X Premium", slug: "cancel-x-premium", domain: "x.com", difficulty: "easy", category: "تاص" },
  { name: "Snapchat+", nameAr: "Snapchat+", slug: "cancel-snapchat-plus", domain: "snapchat.com", difficulty: "easy", category: "تاص" },
  { name: "Telegram Premium", nameAr: "Telegram Premium", slug: "cancel-telegram-premium", domain: "telegram.org", difficulty: "easy", category: "تاص" },
  { name: "WhatsApp Business", nameAr: "WhatsApp Business", slug: "cancel-whatsapp-business", domain: "whatsapp.com", difficulty: "easy", category: "تاص" },
  { name: "Tinder Gold", nameAr: "Tinder Gold", slug: "cancel-tinder-gold", domain: "tinder.com", difficulty: "easy", category: "تاص" },
  { name: "Bumble Premium", nameAr: "Bumble Premium", slug: "cancel-bumble-premium", domain: "bumble.com", difficulty: "easy", category: "تاص" },
  { name: "Hinge+", nameAr: "Hinge+", slug: "cancel-hinge-plus", domain: "hinge.co", difficulty: "easy", category: "تاص" },
  { name: "Match.com", nameAr: "Match.com", slug: "cancel-match-com", domain: "match.com", difficulty: "hard", category: "تاص" },
  // ── Education ──
  { name: "Duolingo+", nameAr: "Duolingo+", slug: "cancel-duolingo-plus", domain: "duolingo.com", difficulty: "easy", category: "تع" },
  { name: "MasterClass", nameAr: "MasterClass", slug: "cancel-masterclass", domain: "masterclass.com", difficulty: "easy", category: "تع" },
  { name: "Skillshare", nameAr: "Skillshare", slug: "cancel-skillshare", domain: "skillshare.com", difficulty: "easy", category: "تع" },
  { name: "Coursera Plus", nameAr: "Coursera Plus", slug: "cancel-coursera-plus", domain: "coursera.org", difficulty: "easy", category: "تع" },
  { name: "Codecademy Pro", nameAr: "Codecademy Pro", slug: "cancel-codecademy-pro", domain: "codecademy.com", difficulty: "easy", category: "تع" },
  { name: "DataCamp", nameAr: "DataCamp", slug: "cancel-datacamp", domain: "datacamp.com", difficulty: "easy", category: "تع" },
  { name: "Udemy Business", nameAr: "Udemy Business", slug: "cancel-udemy-business", domain: "udemy.com", difficulty: "easy", category: "تع" },
  { name: "Brilliant", nameAr: "Brilliant", slug: "cancel-brilliant", domain: "brilliant.org", difficulty: "easy", category: "تع" },
  { name: "Blinkist", nameAr: "Blinkist", slug: "cancel-blinkist", domain: "blinkist.com", difficulty: "easy", category: "تع" },
  // ── News ──
  { name: "Medium", nameAr: "Medium", slug: "cancel-medium-membership", domain: "medium.com", difficulty: "easy", category: "أخبار" },
  { name: "NY Times", nameAr: "NY Times", slug: "cancel-nytimes", domain: "nytimes.com", difficulty: "hard", category: "أخبار" },
  { name: "Bloomberg", nameAr: "Bloomberg", slug: "cancel-bloomberg", domain: "bloomberg.com", difficulty: "hard", category: "أخبار" },
  { name: "Financial Times", nameAr: "Financial Times", slug: "cancel-financial-times", domain: "ft.com", difficulty: "hard", category: "أخبار" },
  { name: "Washington Post", nameAr: "Washington Post", slug: "cancel-washington-post", domain: "washingtonpost.com", difficulty: "hard", category: "أخبار" },
  { name: "WSJ", nameAr: "WSJ", slug: "cancel-wsj", domain: "wsj.com", difficulty: "hard", category: "أخبار" },
  { name: "Al Arabiya Premium", nameAr: "اعربة بر", slug: "cancel-al-arabiya-premium", domain: "alarabiya.net", difficulty: "easy", category: "أخبار" },
  // ── Shopping ──
  { name: "Costco", nameAr: "Costco", slug: "cancel-costco", domain: "costco.com", difficulty: "easy", category: "تس" },
  { name: "Sam's Club", nameAr: "Sam's Club", slug: "cancel-sams-club", domain: "samsclub.com", difficulty: "easy", category: "تس" },
  { name: "Walmart+", nameAr: "Walmart+", slug: "cancel-walmart-plus", domain: "walmart.com", difficulty: "easy", category: "تس" },
  { name: "Instacart+", nameAr: "Instacart+", slug: "cancel-instacart-plus", domain: "instacart.com", difficulty: "easy", category: "تس" },
  { name: "DoorDash", nameAr: "DoorDash", slug: "cancel-doordash-dashpass", domain: "doordash.com", difficulty: "easy", category: "تس" },
  { name: "Grubhub+", nameAr: "Grubhub+", slug: "cancel-grubhub-plus", domain: "grubhub.com", difficulty: "easy", category: "تس" },
  { name: "Uber One", nameAr: "Uber One", slug: "cancel-uber-one", domain: "uber.com", difficulty: "easy", category: "تس" },
  { name: "Uber Pass", nameAr: "Uber Pass", slug: "cancel-uber-pass", domain: "uber.com", difficulty: "easy", category: "تس" },
  { name: "Lyft Pink", nameAr: "Lyft Pink", slug: "cancel-lyft-pink", domain: "lyft.com", difficulty: "easy", category: "تس" },
  { name: "Bolt Plus", nameAr: "Bolt Plus", slug: "cancel-bolt-plus", domain: "bolt.eu", difficulty: "easy", category: "تس" },
  // ── Marketing ──
  { name: "Semrush", nameAr: "Semrush", slug: "cancel-semrush", domain: "semrush.com", difficulty: "hard", category: "أعا" },
  { name: "Ahrefs", nameAr: "Ahrefs", slug: "cancel-ahrefs", domain: "ahrefs.com", difficulty: "easy", category: "أعا" },
  { name: "Mailchimp", nameAr: "Mailchimp", slug: "cancel-mailchimp", domain: "mailchimp.com", difficulty: "easy", category: "أعا" },
  { name: "Buffer", nameAr: "Buffer", slug: "cancel-buffer", domain: "buffer.com", difficulty: "easy", category: "أعا" },
  { name: "Hootsuite", nameAr: "Hootsuite", slug: "cancel-hootsuite", domain: "hootsuite.com", difficulty: "easy", category: "أعا" },
  { name: "Zapier", nameAr: "Zapier", slug: "cancel-zapier", domain: "zapier.com", difficulty: "easy", category: "أعا" },
  { name: "IFTTT Pro", nameAr: "IFTTT Pro", slug: "cancel-ifttt-pro", domain: "ifttt.com", difficulty: "easy", category: "أعا" },
  { name: "Webex", nameAr: "Webex", slug: "cancel-webex", domain: "webex.com", difficulty: "easy", category: "أعا" },
  // ── Cloud Storage ──
  { name: "pCloud", nameAr: "pCloud", slug: "cancel-pcloud", domain: "pcloud.com", difficulty: "easy", category: "أعا" },
  { name: "Box", nameAr: "Box", slug: "cancel-box-cloud", domain: "box.com", difficulty: "easy", category: "أعا" },
  { name: "MEGA Pro", nameAr: "MEGA Pro", slug: "cancel-mega-pro", domain: "mega.io", difficulty: "easy", category: "أعا" },
  { name: "Zee5", nameAr: "Zee5", slug: "cancel-zee5", domain: "zee5.com", difficulty: "easy", category: "بث د" },
];

const CATEGORIES = [...new Set(ALL_GUIDES.map((g) => g.category))];

const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; color: string; bg: string; dot: string }> = {
  easy: { label: "س", color: "#065F46", bg: "#D1FAE5", dot: "#10B981" },
  hard: { label: "صعب", color: "#991B1B", bg: "#FEE2E2", dot: "#EF4444" },
};

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.04 } } },
  item: { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } },
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
    <div dir="rtl" style={{ background: "#EDF5F3", minHeight: "100vh", fontFamily: "'Noto Sans Arabic', 'Plus Jakarta Sans', sans-serif" }}>

      {/* ── Nav ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(237,245,243,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid #C9E0DA",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
            <ArrowLeft size={16} color="#1A3A35" strokeWidth={2.5} style={{ transform: "scaleX(-1)" }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#4A6862" }}>ارئسة</span>
          </a>
          <a href="/" style={{ textDecoration: "none" }}>
            <span className="nav-logo" style={{ color: "#1A3A35" }}>
              yallacancel
            </span>
          </a>
          <a
            href="/"
            style={{
              background: "#1A3A35", color: "#fff",
              padding: "8px 18px", borderRadius: 999,
              fontWeight: 700, fontSize: 13,
              textDecoration: "none",
              transition: "background 0.15s",
            }}
          >
            ح ش
          </a>
        </div>
      </header>

      {/* ── Hero ── */}
      <section style={{ padding: "72px 24px 56px", textAlign: "center" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "#C5DDD9", borderRadius: 999,
            padding: "5px 14px", marginBottom: 20,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00A651", display: "inline-block" }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#1A3A35" }}>حدث </span>
          </div>

          <h1 style={{
            fontSize: "clamp(2.4rem, 6vw, 3.75rem)",
            fontWeight: 900, lineHeight: 1.15,
            color: "#1A3A35", margin: "0 0 16px",
            letterSpacing: "-1px",
          }}>
            أدة إغاء<br />ااشتراات
          </h1>
          <p style={{ fontSize: 17, color: "#4A6862", marginBottom: 36, lineHeight: 1.7 }}>
            {ALL_GUIDES.length} د خطة بخطة —  خدة باعرب
          </p>

          {/* Search */}
          <div style={{ position: "relative", maxWidth: 500, margin: "0 auto" }}>
            <Search
              size={18} color="#8AADA8" strokeWidth={2}
              style={{ position: "absolute", right: 18, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث... Netflix شاد Adobe..."
              style={{
                width: "100%", paddingRight: 48, paddingLeft: 20,
                paddingTop: 15, paddingBottom: 15,
                borderRadius: 16, border: "2px solid #C5DDD9",
                background: "#fff", fontSize: 15, fontWeight: 600,
                color: "#1A3A35", outline: "none",
                boxShadow: "0 4px 20px rgba(0,166,81,0.06)",
                transition: "border-color 0.15s, box-shadow 0.15s",
                fontFamily: "inherit",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#00A651";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,166,81,0.12)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#C5DDD9";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,166,81,0.06)";
              }}
            />
          </div>
        </div>
      </section>

      {/* ── Main content ── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 80px" }}>

        {/* Category pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 32 }}>
          <button
            onClick={() => setActiveCategory(null)}
            style={{
              padding: "8px 18px", borderRadius: 999, fontSize: 13, fontWeight: 700,
              cursor: "pointer", border: "none", transition: "all 0.15s",
              background: !activeCategory ? "#1A3A35" : "#fff",
              color: !activeCategory ? "#fff" : "#4A6862",
              boxShadow: !activeCategory ? "0 2px 12px rgba(26,58,53,0.18)" : "0 1px 4px rgba(0,0,0,0.06)",
            }}
          >
            ا · {search.trim() ? filtered.length : ALL_GUIDES.length}
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              style={{
                padding: "8px 18px", borderRadius: 999, fontSize: 13, fontWeight: 700,
                cursor: "pointer", border: "none", transition: "all 0.15s",
                background: activeCategory === cat ? "#1A3A35" : "#fff",
                color: activeCategory === cat ? "#fff" : "#4A6862",
                boxShadow: activeCategory === cat ? "0 2px 12px rgba(26,58,53,0.18)" : "0 1px 4px rgba(0,0,0,0.06)",
              }}
            >
              {cat} · {countByCategory[cat] || 0}
            </button>
          ))}
        </div>

        {/* Result count */}
        {search.trim() && (
          <p style={{ fontSize: 13, color: "#8AADA8", marginBottom: 20, fontWeight: 600 }}>
            {filtered.length === 0 ? "ا  تائج" : `${filtered.length} تجة`}
          </p>
        )}

        {/* Grid */}
        <AnimatePresence mode="wait">
          {filtered.length > 0 ? (
            <motion.div
              key={`${search}-${activeCategory}`}
              variants={stagger.container}
              initial="hidden"
              animate="show"
              style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}
            >
              {filtered.map((g) => {
                const diff = DIFFICULTY_CONFIG[g.difficulty];
                return (
                  <motion.a
                    key={g.slug}
                    variants={stagger.item}
                    href={`/${g.slug}.html`}
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      background: "#fff", borderRadius: 20,
                      padding: "14px 18px",
                      border: "1.5px solid #E5EFED",
                      textDecoration: "none",
                      transition: "border-color 0.15s, box-shadow 0.15s, transform 0.15s",
                      cursor: "pointer",
                    }}
                    whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,166,81,0.1)", borderColor: "#00A651" }}
                  >
                    <MerchantLogo name={g.nameAr || g.name} domain={g.domain} size={36} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#1A3A35", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {g.nameAr}
                      </div>
                      <div style={{ fontSize: 12, color: "#8AADA8", marginTop: 1 }}>
                         أغ {g.name}
                      </div>
                    </div>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      fontSize: 11, fontWeight: 700,
                      padding: "3px 9px", borderRadius: 999,
                      background: diff.bg, color: diff.color,
                      flexShrink: 0,
                    }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: diff.dot, display: "inline-block" }} />
                      {diff.label}
                    </span>
                  </motion.a>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ textAlign: "center", padding: "80px 24px" }}
            >
              <div style={{
                width: 64, height: 64, borderRadius: 20,
                background: "#E5EFED", margin: "0 auto 20px",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Search size={28} color="#8AADA8" />
              </div>
              <p style={{ fontSize: 18, fontWeight: 800, color: "#1A3A35", marginBottom: 8 }}>ا ا اخدة</p>
              <p style={{ fontSize: 14, color: "#8AADA8", marginBottom: 28 }}>ارع ش حساب تش اشتراات تائا</p>
              <a href="/" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "#1A3A35", color: "#fff",
                padding: "12px 28px", borderRadius: 999,
                fontWeight: 700, fontSize: 14, textDecoration: "none",
              }}>
                ارع ش جاا
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── CTA section ── */}
      <section style={{
        background: "#1A3A35",
        padding: "72px 24px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Subtle dot grid */}
        <div aria-hidden style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          pointerEvents: "none",
        }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 540, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)", fontWeight: 900, color: "#fff", marginBottom: 14, letterSpacing: "-0.5px" }}>
             ا اخدة؟
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.65)", marginBottom: 36, lineHeight: 1.7 }}>
            ارع ش حساب تش  اشتراات اخة تائا — ع رابط اإغاء.
          </p>
          <a href="/" style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            background: "#00A651", color: "#fff",
            padding: "15px 36px", borderRadius: 999,
            fontWeight: 800, fontSize: 15, textDecoration: "none",
            boxShadow: "0 4px 20px rgba(0,166,81,0.35)",
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,166,81,0.45)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,166,81,0.35)";
            }}
          >
            ارع ش جاا
          </a>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 14 }}>ا برد إتر · ا تسج ·  جا</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: "#112920", padding: "28px 24px", textAlign: "center" }}>
        <a href="/" style={{ textDecoration: "none" }}>
          <span className="nav-logo" style={{ color: "rgba(255,255,255,0.45)", justifyContent: "center" }}>
            yallacancel
          </span>
        </a>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 8 }}>&copy;  Yalla Cancel</p>
      </footer>
    </div>
  );
}
