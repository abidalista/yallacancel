export function getStoredLocale(): "ar" | "en" {
  if (typeof window === "undefined") return "ar";
  return (localStorage.getItem("yc-locale") as "ar" | "en") || "ar";
}

export function setStoredLocale(locale: "ar" | "en") {
  if (typeof window !== "undefined") {
    localStorage.setItem("yc-locale", locale);
  }
}
