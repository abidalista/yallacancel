const LOCAL_BY_DOMAIN: Record<string, string> = {
  "netflix.com": "/logos/netflix.png",
  "shahid.mbc.net": "/logos/shahid.png",
  "spotify.com": "/logos/spotify.png",
  "youtube.com": "/logos/youtube.png",
  "disneyplus.com": "/logos/disney.png",
  "adobe.com": "/logos/adobe.png",
  "openai.com": "/logos/chatgpt.png",
  "apple.com": "/logos/apple.png",
  "amazon.sa": "/logos/amazon.png",
  "amazon.com": "/logos/amazon.png",
  "icloud.com": "/logos/icloud.png",
  "stc.com.sa": "/logos/stc.png",
  "hungerstation.com": "/logos/hungerstation.png",
  "microsoft.com": "/logos/microsoft.png",
  "google.com": "/logos/google.png",
  "talabat.com": "/logos/talabat.png",
  "careem.com": "/logos/careem.png",
  "uber.com": "/logos/uber.png",
  "noon.com": "/logos/noon.png",
  "jahez.com": "/logos/jahez.png",
  "mrsool.com": "/logos/mrsool.png",
  "tiktok.com": "/logos/tiktok.png",
  "snapchat.com": "/logos/snapchat.png",
  "telegram.org": "/logos/telegram.png",
  "calm.com": "/logos/calm.png",
  "alrajhibank.com.sa": "/logos/alrajhi.png",
  "alahli.com": "/logos/alahli.png",
  "riyadbank.com": "/logos/riyadbank.png",
  "bankalbilad.com": "/logos/albilad.png",
  "alinma.com": "/logos/alinma.png",
  "sabb.com": "/logos/sabb.png",
  "alfransi.com.sa": "/logos/alfransi.png",
  "anb.com.sa": "/logos/anb.png",
  "stcpay.com.sa": "/logos/stcpay.png",
  "anghami.com": "/logos/spotify.png",
  "playstation.com": "/logos/microsoft.png",
  "osn.com": "/logos/shahid.png",
};

export const faviconUrl = (domain: string) =>
  `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

export const duckduckgoIconUrl = (domain: string) =>
  `https://icons.duckduckgo.com/ip3/${domain}.ico`;

/** @deprecated Prefer logoSources() or BrandLogo */
export const logoUrl = (domain: string) =>
  LOCAL_BY_DOMAIN[domain] ?? faviconUrl(domain);

/** Ordered fallback chain: local asset → Google favicon → DuckDuckGo */
export function logoSources(domain: string): string[] {
  const local = LOCAL_BY_DOMAIN[domain];
  const sources = local
    ? [local, faviconUrl(domain), duckduckgoIconUrl(domain)]
    : [faviconUrl(domain), duckduckgoIconUrl(domain)];
  return [...new Set(sources)];
}

export function logoInitial(domain: string, name?: string): string {
  const label = name?.trim() || domain.split(".")[0] || "?";
  return label.charAt(0).toUpperCase();
}
