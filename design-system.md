# KILLER Design System v3.0 — Dark Gaming Theme

## Overview
- **Theme**: Dark-first with neon green accents — immersive gaming atmosphere
- **Typography**: Sora (Headings/Display), Inter (Body), JetBrains Mono (Codes)
- **Corner Radius**: 2rem (32px) for cards/sections, 1rem (16px) for buttons/inputs
- **Shadows**: Neon green glow shadows for active/primary states
- **Interactivity**: Spring-based micro-interactions, scale down on tap
- **Iconography**: Lucide-React exclusively (NO emojis anywhere)
- **Mobile-first**: 100% touch-optimized, generous spacing
- **Atmosphere**: Dark gaming UI with neon green glows, subtle grid patterns, glassmorphism on dark surfaces

---

## Color Palette

### Background (Dark)
```
--color-bg-primary:   #0a0f0d   (main background — near black with green tint)
--color-bg-secondary: #111916   (cards, elevated surfaces)
--color-bg-tertiary:  #1a2520   (inputs, secondary cards)
--color-bg-glass:     rgba(17, 25, 22, 0.8)  (glassmorphism panels)
```

### Primary Green (Neon/Light Green)
```
--color-brand-50:  #f0fdf4   (rarely used, very light green)
--color-brand-100: #dcfce7   (subtle glow tints)
--color-brand-200: #bbf7d0   (borders on hover)
--color-brand-300: #86efac   (decorative, secondary text)
--color-brand-400: #4ade80   (PRIMARY ACCENT — neon green, CTAs, glow)
--color-brand-500: #22c55e   (buttons, active states)
--color-brand-600: #16a34a   (hover states)
--color-brand-700: #15803d   (pressed states)
--color-brand-800: #166534   (dark green accents)
--color-brand-900: #14532d   (very dark green)
--color-brand-950: #052e16   (darkest)
```

### Neutrals (on dark bg)
```
White:       #ffffff   (primary text, headings)
Gray-100:    #f1f5f9   (primary text, strong)
Gray-300:    #d1d5db   (secondary text)
Gray-400:    #94a3b8   (tertiary text, labels)
Gray-500:    #64748b   (placeholder, disabled)
Gray-600:    #475569   (muted text)
Gray-700:    #334155   (borders on dark)
Gray-800:    #1e293b   (subtle borders)
```

### Semantic
```
Danger:   bg-red-500/10 text-red-400 border-red-500/20 (elimination, errors, death)
Success:  Uses brand green
Warning:  bg-amber-500/10 text-amber-400
```

### Glow Shadows
```css
--glow-sm:    0 0 15px rgba(74, 222, 128, 0.15);
--glow-md:    0 0 30px rgba(74, 222, 128, 0.2), 0 0 15px rgba(74, 222, 128, 0.1);
--glow-lg:    0 0 50px rgba(74, 222, 128, 0.25), 0 0 25px rgba(74, 222, 128, 0.15);
--glow-xl:    0 0 80px rgba(74, 222, 128, 0.3), 0 0 40px rgba(74, 222, 128, 0.2);
--glow-danger: 0 0 30px rgba(239, 68, 68, 0.2), 0 0 15px rgba(239, 68, 68, 0.1);
```

---

## Typography

### Fonts
- **Display/Headings**: `Sora` — font-display, geometric, playful but pro
- **Body**: `Inter` — font-sans, legendary readability
- **Mono**: `JetBrains Mono` — font-mono, for codes and numbers

### Scale (on dark backgrounds — white/light text)
```
H1: font-display text-5xl md:text-6xl font-extrabold tracking-tight text-white
H2: font-display text-3xl md:text-4xl font-bold tracking-tight text-white
H3: font-display text-xl md:text-2xl font-bold text-white
H4: font-display text-lg font-bold text-white

Body Large:  text-xl text-gray-300 font-medium leading-relaxed
Body:        text-base text-gray-300 leading-relaxed
Body Small:  text-sm text-gray-400
Caption:     text-xs text-gray-500

Label:       text-sm font-semibold text-gray-300
Overline:    text-xs font-bold text-green-400 tracking-widest uppercase
```

---

## Spacing & Layout

### Mobile-First Container
```
max-w-lg mx-auto px-5    (mobile default)
md:max-w-2xl md:px-8     (tablet)
```

### Section Spacing
```
Page padding:    py-8 px-5
Section gap:     space-y-8
Card gap:        gap-4 md:gap-6
Inner padding:   p-5 md:p-6
```

---

## Components

### Buttons
```tsx
// Primary (main CTAs) — neon green glow
className="bg-green-500 text-white font-bold px-6 py-3.5 rounded-2xl
           shadow-[0_0_30px_rgba(74,222,128,0.3)] hover:bg-green-400
           hover:shadow-[0_0_40px_rgba(74,222,128,0.4)] active:bg-green-600 transition-all"

// Secondary (glass outline on dark)
className="bg-white/5 border border-green-500/30 text-green-400 font-bold px-6 py-3.5 rounded-2xl
           hover:bg-green-500/10 hover:border-green-400/50 transition-all backdrop-blur-sm"

// Ghost (on dark)
className="text-gray-400 font-bold px-6 py-3.5 rounded-2xl hover:bg-white/5 transition-all"

// Danger (red glow)
className="bg-red-500/10 text-red-400 border border-red-500/20 font-bold px-6 py-3.5 rounded-2xl
           hover:bg-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.15)] transition-all"
```

### Cards
```tsx
// Standard Card (dark glass)
className="bg-[#111916] rounded-3xl border border-green-500/10 shadow-lg p-5"

// Highlighted Card (green glow border)
className="bg-[#111916] rounded-3xl border border-green-500/30 shadow-[0_0_30px_rgba(74,222,128,0.1)] p-5"

// Glass Card
className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-5"

// Neon Card (for important items like mission card)
className="bg-[#111916] rounded-3xl border border-green-400/40 shadow-[0_0_40px_rgba(74,222,128,0.15)] p-6
           relative overflow-hidden"
// + subtle green gradient overlay at top
```

### Inputs (on dark)
```tsx
className="w-full px-4 py-3.5 rounded-2xl border border-white/10 bg-white/5
           focus:border-green-500/50 focus:bg-white/10 focus:shadow-[0_0_20px_rgba(74,222,128,0.1)]
           focus:outline-none text-white placeholder:text-gray-500 transition-all backdrop-blur-sm"
```

### Badges
```tsx
// Green (primary)
className="bg-green-500/15 text-green-400 px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-widest border border-green-500/20"

// Live (with pulse dot)
// same as green + <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.6)]" />

// Danger
className="bg-red-500/15 text-red-400 px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-widest border border-red-500/20"
```

### Bottom Navigation (Mobile — dark glass)
```tsx
className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm z-50
           bg-[#111916]/90 backdrop-blur-xl border border-green-500/15 shadow-2xl rounded-3xl p-2
           flex justify-around items-center"

// Active tab
className="p-3 rounded-2xl bg-green-500 text-white shadow-[0_0_20px_rgba(74,222,128,0.3)] transition-all"

// Inactive tab
className="p-3 rounded-2xl text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-all"
```

### Bottom Sheet / Modal (dark)
```tsx
// Overlay
className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"

// Sheet
className="fixed bottom-0 left-0 right-0 z-50 bg-[#111916] border-t border-green-500/15 rounded-t-3xl shadow-2xl
           max-h-[85vh] overflow-auto pb-safe"

// Drag handle
className="w-12 h-1.5 bg-gray-600 rounded-full mx-auto mt-3 mb-4"
```

---

## Animations (Framer Motion)

### Spring Configs
```tsx
const SPRING_SNAPPY = { type: "spring", stiffness: 400, damping: 30 };
const SPRING_BOUNCY = { type: "spring", stiffness: 300, damping: 15 };
const SPRING_GENTLE = { type: "spring", stiffness: 200, damping: 20 };
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
whileTap={{ scale: 0.96 }} transition={SPRING_SNAPPY}
```

---

## Special Effects

### Neon Text Glow
```css
.text-glow-green {
  text-shadow: 0 0 20px rgba(74, 222, 128, 0.5), 0 0 40px rgba(74, 222, 128, 0.3);
}
```

### Gradient Text (neon green)
```css
.text-gradient-green {
  background: linear-gradient(135deg, #22c55e, #4ade80, #86efac);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### Subtle Grid Pattern (background atmosphere)
```css
.bg-grid {
  background-image:
    linear-gradient(rgba(74, 222, 128, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(74, 222, 128, 0.03) 1px, transparent 1px);
  background-size: 40px 40px;
}
```

### Radial Glow (behind hero elements)
```css
.bg-radial-glow {
  background: radial-gradient(ellipse at center, rgba(74, 222, 128, 0.12) 0%, transparent 70%);
}
```

---

## Icons (Lucide React)
- Size in buttons: `w-4 h-4` or `size={16}`
- Size standalone: `w-5 h-5`
- Size feature: `w-6 h-6`
- Size hero: `w-8 h-8`

### NO EMOJIS — use Lucide icons only.

---

## Reference Code — Key Patterns

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

// Dark background base
<div className="min-h-dvh bg-[#0a0f0d]">
  {/* Grid pattern overlay */}
  <div className="fixed inset-0 bg-grid pointer-events-none" />
  {/* Radial glow behind main content */}
  <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-radial-glow pointer-events-none" />
  {/* Content */}
  <div className="relative z-10">...</div>
</div>
```
