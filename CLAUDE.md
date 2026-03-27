# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

KILLER is a real-time multiplayer assassination party game PWA. Players join a game via code/QR, receive a secret target and mission (in French), and eliminate targets by obtaining their 4-digit kill codes. The last survivor wins. Built with Next.js 16 (App Router), Firebase (Firestore + real-time listeners + Storage), Tailwind CSS v4, and Framer Motion.

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — ESLint (next lint)

No test framework is configured.

## Architecture

### Game Flow

1. **Create** (`/create`) — admin creates a game, gets a 6-char join code + QR
2. **Lobby** (`/game/[id]` with `GameLobby`) — players join via code, real-time player list, min 4 to start
3. **Start** — admin triggers start; `lib/game-logic.ts:createKillChain()` shuffles players into a circular linked list (each targets the next, last targets first) and assigns random missions
4. **Active** (`/game/[id]` with `PlayerDashboard`) — players see target/mission/survivors; submit kill codes at `/game/[id]/kill`
5. **Kill processing** (`POST /api/kills`) — validates code, marks victim dead, killer inherits victim's target+mission, checks win condition
6. **End** — last survivor wins, `VictoryScreen`/`DeathScreen` shown

### Key Directories

- `app/api/` — Next.js Route Handlers for all server logic (game CRUD, join, start, kills, leaderboard, feed)
- `components/game/` — game-phase UI (lobby, dashboard, mission card, kill feed, death/victory screens)
- `components/ui/` — reusable primitives (Button, Card, Input, BottomSheet, CodeInput, etc.)
- `hooks/` — `useGame`, `usePlayer`, `useKillFeed` (all with Firestore `onSnapshot` real-time listeners), `useAccount` (localStorage persistence)
- `lib/firebase/` — `client.ts` (browser Firestore + Storage), `server.ts` (Firebase Admin SDK for API routes), `types.ts` (DB types), `helpers.ts` (batched queries for >30 IDs)
- `lib/game-logic.ts` — kill chain algorithm and mission assignment
- `lib/missions.ts` — 65 French missions across 4 categories (conversation, action, social, piège) with difficulty levels
- `lib/utils.ts` — code generators, shuffle, relative time formatting, `cn()` classname helper

### Database (Firebase Firestore)

Four top-level collections: `accounts`, `games` (status: lobby→active→finished), `players` (circular target_id references, kill_code, mission_id), `kill_events`. Composite indexes needed for compound queries (auto-suggested by Firestore on first failure).

### Real-time Pattern

All game state hooks use Firestore `onSnapshot` listeners. `useGame` watches a single game document, `usePlayer` watches a single player document and refetches target on target_id change, `useKillFeed` listens to a query on kill_events filtered by game_id.

### Rate Limiting

In-memory rate limiter in `/api/kills` — 3 attempts per 60 seconds per player to prevent code guessing.

## Conventions

- **Language:** all UI strings are in French, no i18n system
- **TypeScript strict mode** with `@/*` path alias
- **"use client"** directives are explicit on all client components
- **File naming:** kebab-case files, PascalCase components
- **Styling:** Tailwind v4 with inline `@theme` in `globals.css` (no tailwind.config file); dark theme with green (`killer-*`) and red (`danger-*`) color tokens; glass morphism + glow effects
- **Animations:** Framer Motion for page transitions and interactions, CSS keyframes for continuous effects (pulse-glow, kill-flash)
- **Mobile-first:** PWA with service worker (Serwist), safe area insets, bottom navigation, QR code joining

## Environment Variables

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
FIREBASE_SERVICE_ACCOUNT_KEY
ADMIN_SECRET
```
