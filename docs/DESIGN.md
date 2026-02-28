# Design System — Yalla Cancel

Design reference: Surfe.com (`docs/reference/surfe/`)

---

## Color Palette

```css
/* Backgrounds */
--bg-page:      #EDF5F3   /* Light mint — main page background */
--bg-card:      #FFFFFF   /* Pure white — cards */
--bg-dark:      #1A3A35   /* Dark teal-navy — CTA sections, footer */
--bg-pink:      #FCEEF0   /* Blush pink — accent sections */
--bg-subtle:    #F5FAF8   /* Off-white mint — secondary sections */

/* Text */
--text-primary:   #1A3A35  /* Dark teal-navy */
--text-secondary: #4A6862  /* Muted teal */
--text-muted:     #8AADA8  /* Light muted */
--text-on-dark:   #FFFFFF

/* Brand */
--green:        #00A651   /* Yalla Cancel green — kept from original */
--green-hover:  #00C060
--green-bg:     #E8F7EE

/* UI */
--border:       #E5EFED
--border-focus: #00A651
```

---

## Typography

- **Headings**: Plus Jakarta Sans, weight 800–900, tight leading
- **Body**: Plus Jakarta Sans / Inter, weight 400–500
- **Arabic**: Noto Sans Arabic, weight 400–700
- **Scale** (approximate):
  - Hero h1: `text-5xl` to `text-7xl`, `font-black`
  - Section h2: `text-3xl` to `text-4xl`, `font-bold`
  - Card title: `text-xl`, `font-bold`
  - Body: `text-base` / `text-sm`
  - Caption/muted: `text-xs` to `text-sm`, muted color

---

## Spacing & Layout

- Max content width: `1200px`, centered, `px-6`
- Section vertical padding: `py-24` (desktop), `py-16` (mobile)
- Card padding: `p-6` to `p-8`
- Gap between cards: `gap-6`
- Grid: mostly 3-column on desktop, 1-column on mobile

---

## Components

### Cards
```
bg-white
rounded-3xl          (24px radius)
border border-[#E5EFED]
shadow-sm            (0 4px 20px rgba(0,0,0,0.06))
p-6 to p-8
```
Hover: `shadow-md` transition

### Buttons

**Primary (dark)**
```
bg-[#1A3A35] text-white
rounded-full
px-6 py-3 font-bold
hover:bg-[#0F2A26]
```

**Primary (green)**
```
bg-[#00A651] text-white
rounded-full
px-6 py-3 font-bold
hover:bg-[#00C060]
```

**Secondary / Ghost**
```
border border-[#1A3A35] text-[#1A3A35]
rounded-full
px-6 py-3 font-semibold
hover:bg-[#1A3A35] hover:text-white
```

### Navigation
- Sticky, `bg-white/80 backdrop-blur`
- Logo left, links center, CTAs right
- Minimal — no mega menus
- Mobile: hamburger

### Feature Icons
- Colored square with rounded corners (`rounded-2xl`), 48×48
- Icon inside in white or dark

### Trust / Social Proof Section
- Dark background (`#1A3A35`)
- White text
- Certification badges (ISO, GDPR) + G2 awards + large stat number
- Illustration/mascot alongside

### Pricing Cards
- White card, `rounded-3xl`
- "Most popular" badge: blue outline border + label at top
- Strikethrough original price in muted
- Dark CTA button full-width
- Colored gem icons for credit tiers
- Feature list with checkmarks

---

## Illustrations & Mascots
- Line-art style characters (like Surfe's surfer/team illustrations)
- Used in: hero, CTA sections, empty states
- Colors: match section background, accent in brand green or pink
- **Do not use stock photos**

---

## Animations (Framer Motion)
- Page sections: `fadeInUp` on scroll (`initial: {opacity:0, y:20}`, `animate: {opacity:1, y:0}`)
- Cards: stagger children with `0.1s` delay
- Buttons: `whileHover: {scale: 1.02}`, `whileTap: {scale: 0.98}`
- Modal: `scale` from `0.95` to `1` with opacity

---

## RTL (Arabic)
- All new components must work in both `dir="ltr"` and `dir="rtl"`
- Use `rtl:space-x-reverse` where needed
- Icons that indicate direction (arrows) should flip in RTL

---

## What to avoid
- No pure white page backgrounds (use `#EDF5F3`)
- No gradients on backgrounds or hero sections
- No purple or indigo (old color scheme — being replaced)
- No drop shadows heavier than `0 8px 30px rgba(0,0,0,0.08)`
- No serif fonts
- No stock photography
