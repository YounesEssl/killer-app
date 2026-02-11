# KILLER Design System v2.0 — Green + White

## Overview
- **Theme**: White-first, Green-accented (Emerald 500 as primary)
- **Typography**: Sora (Headings/Display), Inter (Body)
- **Corner Radius**: 2rem (32px) for cards/sections, 1rem (16px) for buttons/inputs
- **Shadows**: Soft emerald-tinted shadows for active states
- **Interactivity**: Spring-based micro-interactions, scale down on tap
- **Iconography**: Lucide-React exclusively (NO emojis anywhere)
- **Mobile-first**: 100% touch-optimized, generous spacing

---

## Color Palette

### Primary Green (Emerald)
```
--color-brand-50:  #f0fdf4   (lightest backgrounds, hover states)
--color-brand-100: #dcfce7   (light backgrounds, badges)
--color-brand-200: #bbf7d0   (borders, dividers)
--color-brand-300: #86efac   (decorative)
--color-brand-400: #4ade80   (secondary buttons, highlights)
--color-brand-500: #10b981   (PRIMARY — buttons, CTAs, active states)
--color-brand-600: #059669   (hover states for primary)
--color-brand-700: #047857   (pressed states)
--color-brand-800: #065f46   (dark text on light green)
--color-brand-900: #064e3b   (headings on white)
--color-brand-950: #022c22   (darkest, sparingly used)
```

### Neutrals (White + Slate)
```
White:       #ffffff   (primary background)
Slate-50:    #f8fafc   (secondary background, input bg)
Slate-100:   #f1f5f9   (borders, dividers, badge bg)
Slate-200:   #e2e8f0   (stronger borders)
Slate-300:   #cbd5e1   (disabled states)
Slate-400:   #94a3b8   (placeholder text, secondary icons)
Slate-500:   #64748b   (body text secondary)
Slate-600:   #475569   (body text)
Slate-700:   #334155   (strong body text, labels)
Slate-900:   #0f172a   (headings, primary text)
```

### Semantic
```
Danger:   bg-rose-50 text-rose-600 border-rose-100 (elimination, errors)
Success:  Uses brand green
Warning:  bg-amber-50 text-amber-700
```

### Shadows
```css
--shadow-brand:    0 10px 15px -3px rgba(16, 185, 129, 0.1), 0 4px 6px -4px rgba(16, 185, 129, 0.1);
--shadow-brand-lg: 0 20px 25px -5px rgba(16, 185, 129, 0.15), 0 8px 10px -6px rgba(16, 185, 129, 0.1);
```

---

## Typography

### Fonts
- **Display/Headings**: `Sora` — font-display, geometric, playful but pro
- **Body**: `Inter` — font-sans, legendary readability
- **Mono**: `JetBrains Mono` — font-mono, for codes and numbers

### Scale
```
H1: font-display text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900
H2: font-display text-3xl md:text-4xl font-bold tracking-tight text-slate-900
H3: font-display text-xl md:text-2xl font-bold text-slate-900
H4: font-display text-lg font-bold text-slate-900

Body Large:  text-xl text-slate-700 font-medium leading-relaxed
Body:        text-base text-slate-600 leading-relaxed
Body Small:  text-sm text-slate-500
Caption:     text-xs text-slate-400

Label:       text-sm font-semibold text-slate-700
Overline:    text-xs font-bold text-emerald-500 tracking-widest uppercase
```

---

## Spacing & Layout

### Mobile-First Container
```
max-w-lg mx-auto px-5    (mobile default)
md:max-w-2xl md:px-8     (tablet)
lg:max-w-5xl lg:px-6     (desktop)
```

### Section Spacing
```
Page padding:    py-8 px-5
Section gap:     space-y-8
Card gap:        gap-4 md:gap-6
Inner padding:   p-5 md:p-6
```

### Touch Targets
```
Minimum:  min-h-[48px] min-w-[48px]
Buttons:  py-3.5 px-6 (comfortable tap)
Nav items: p-3
```

---

## Components

### Buttons
```tsx
// Primary (main CTAs)
className="bg-emerald-500 text-white font-bold px-6 py-3.5 rounded-2xl shadow-brand
           hover:bg-emerald-600 active:bg-emerald-700 transition-all"
// + whileTap={{ scale: 0.96 }} with SPRING_SNAPPY

// Secondary (outline)
className="bg-white border-2 border-emerald-500 text-emerald-600 font-bold px-6 py-3.5 rounded-2xl
           hover:bg-emerald-50 transition-all"

// Ghost
className="text-slate-500 font-bold px-6 py-3.5 rounded-2xl hover:bg-slate-50 transition-all"

// Danger
className="bg-rose-50 text-rose-600 border border-rose-100 font-bold px-6 py-3.5 rounded-2xl
           hover:bg-rose-100 transition-all"
```

### Cards
```tsx
// Standard Card
className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5
           hover:shadow-md hover:-translate-y-0.5 transition-all"

// Highlighted Card (with green accent)
className="bg-white rounded-3xl border-2 border-emerald-200 shadow-brand p-5"

// Green Card (inverted)
className="bg-emerald-500 rounded-3xl text-white shadow-brand-lg p-5"
```

### Inputs
```tsx
// Standard Input
className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50
           focus:border-emerald-500 focus:bg-white focus:outline-none
           text-slate-900 placeholder:text-slate-400 transition-all"

// With label
<label className="text-sm font-semibold text-slate-700 ml-1">Label</label>

// Error state
className="... border-rose-300 focus:border-rose-500"
<span className="text-xs text-rose-500 ml-1 mt-1">Error message</span>
```

### Badges
```tsx
// Neutral
className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-widest"

// Green
className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-widest"

// Live (with pulse dot)
className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-widest
           inline-flex items-center gap-1.5"
// + <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />

// Danger
className="bg-rose-50 text-rose-600 px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-widest"
```

### Bottom Navigation (Mobile)
```tsx
// Container
className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm z-50
           bg-white/90 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-3xl p-2
           flex justify-around items-center"

// Active tab
className="p-3 rounded-2xl bg-emerald-500 text-white shadow-brand transition-all"

// Inactive tab
className="p-3 rounded-2xl text-slate-400 hover:bg-slate-50 transition-all"
```

### Bottom Sheet / Modal
```tsx
// Overlay
className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"

// Sheet
className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl
           max-h-[85vh] overflow-auto pb-safe"

// Drag handle
className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-3 mb-4"

// Header
className="px-5 py-4 border-b border-slate-100 flex items-center justify-between"
```

---

## Animations (Framer Motion)

### Spring Configs
```tsx
const SPRING_SNAPPY = { type: "spring", stiffness: 400, damping: 30 };
const SPRING_BOUNCY = { type: "spring", stiffness: 300, damping: 15 };
const SPRING_GENTLE = { type: "spring", stiffness: 200, damping: 20 };
```

### Transitions
```tsx
const EASE_OUT = { ease: [0.22, 1, 0.36, 1], duration: 0.5 };
const EASE_OUT_SLOW = { ease: [0.22, 1, 0.36, 1], duration: 0.7 };
```

### Page Transitions
```tsx
const PAGE_VARIANTS = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { ease: [0.22, 1, 0.36, 1], duration: 0.5 } },
  exit: { opacity: 0, y: -8, transition: { ease: [0.22, 1, 0.36, 1], duration: 0.3 } },
};
```

### Stagger Children
```tsx
const STAGGER_CONTAINER = {
  animate: { transition: { staggerChildren: 0.06 } },
};
const STAGGER_ITEM = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { ease: [0.22, 1, 0.36, 1], duration: 0.4 } },
};
```

### Micro-Interactions
```tsx
// Button tap
whileTap={{ scale: 0.96 }} transition={SPRING_SNAPPY}

// Card hover
whileHover={{ y: -2, shadow: "0 20px 25px -5px rgba(16, 185, 129, 0.15)" }}

// Icon hover (in interactive contexts)
whileHover={{ scale: 1.1, rotate: 5 }} transition={SPRING_BOUNCY}

// Live pulse indicator
animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
transition={{ duration: 2, repeat: Infinity }}
```

### Modal / Bottom Sheet
```tsx
// Overlay: animate={{ opacity: 1 }} initial={{ opacity: 0 }}
// Sheet:   animate={{ y: 0 }}       initial={{ y: "100%" }} transition={SPRING_GENTLE}
```

---

## Icons (Lucide React)

### Convention
- **Size in buttons**: `w-4 h-4` or `size={16}`
- **Size standalone**: `w-5 h-5` or `size={20}`
- **Size feature icons**: `w-6 h-6` or `size={24}`
- **Size hero/display**: `w-8 h-8` or `size={32}`
- **Stroke width**: Default (2) for most, 1.5 for large display icons

### Key Icon Mappings
```
Target (crosshair)  → Target icon (current target)
Mission/Objective    → Scroll or FileText icon
Kill/Eliminate       → Skull icon
Players/Survivors    → Users icon
Winner/Victory       → Trophy icon
Timer/Duration       → Clock icon
Code/Secret          → Lock or KeyRound icon
Share                → Share2 icon
Copy                 → Copy icon
QR Code              → QrCode icon
Settings/Admin       → Settings icon
Back/Navigate        → ArrowLeft, ChevronLeft icon
Close                → X icon
Game/Play            → Gamepad2 or Play icon
Shield/Protected     → Shield icon
Alive status         → Heart or CircleDot icon
Dead status          → Skull icon
Feed/Activity        → Activity or Radio icon
Leaderboard/Rank     → BarChart3 or Medal icon
Join                 → UserPlus icon
Create               → Plus icon
```

### NO EMOJIS
Replace ALL emoji usage:
- 🎯 → `<Target />` icon
- 💀 → `<Skull />` icon
- 🏆 → `<Trophy />` icon
- 👥 → `<Users />` icon
- 🥇🥈🥉 → `<Medal />` with gold/silver/bronze colors
- 🗣️🤝🎭🧠 → `<MessageCircle />`, `<Handshake />`, `<Drama />`, `<Brain />` (category icons)
- Player avatars → `<User />` icon in colored circles

---

## CSS Utilities (globals.css)

### @theme inline tokens
```css
@theme inline {
  --color-brand-50: #f0fdf4;
  --color-brand-100: #dcfce7;
  --color-brand-200: #bbf7d0;
  --color-brand-300: #86efac;
  --color-brand-400: #4ade80;
  --color-brand-500: #10b981;
  --color-brand-600: #059669;
  --color-brand-700: #047857;
  --color-brand-800: #065f46;
  --color-brand-900: #064e3b;
  --color-brand-950: #022c22;

  --font-display: var(--font-sora);
  --font-body: var(--font-inter);
  --font-mono: var(--font-jetbrains-mono);

  --shadow-brand: 0 10px 15px -3px rgba(16, 185, 129, 0.1), 0 4px 6px -4px rgba(16, 185, 129, 0.1);
  --shadow-brand-lg: 0 20px 25px -5px rgba(16, 185, 129, 0.15), 0 8px 10px -6px rgba(16, 185, 129, 0.1);
}
```

### Key Utility Classes
```css
/* Selection */
::selection { background: rgba(16, 185, 129, 0.15); color: #064e3b; }

/* Scrollbar */
::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.2); }

/* Safe areas */
.pb-safe { padding-bottom: max(env(safe-area-inset-bottom, 0px), 16px); }
.pt-safe { padding-top: max(env(safe-area-inset-top, 0px), 16px); }
```

---

## Reference Code — Atomic Components

```tsx
// cn utility
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

// Animation constants
const SPRING_SNAPPY = { type: "spring" as const, stiffness: 400, damping: 30 };
const SPRING_BOUNCY = { type: "spring" as const, stiffness: 300, damping: 15 };
const SPRING_GENTLE = { type: "spring" as const, stiffness: 200, damping: 20 };
const EASE_OUT = { ease: [0.22, 1, 0.36, 1], duration: 0.5 };

const PAGE_VARIANTS = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: EASE_OUT },
  exit: { opacity: 0, y: -8, transition: { ease: [0.22, 1, 0.36, 1], duration: 0.3 } },
};

const STAGGER_CONTAINER = {
  animate: { transition: { staggerChildren: 0.06 } },
};

const STAGGER_ITEM = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { ease: [0.22, 1, 0.36, 1], duration: 0.4 } },
};
```
