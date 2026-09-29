# 🌙 Luna

**Storyboard-first short-form content creation.**

Luna is the UI layer over the AI models you already use. Instead of building yet
another video editor or training a model, Luna gives you a fast, polished
workflow to **draft a storyboard, write the script, choose a look, and generate
every scene** with the open-source backend of your choice.

The bet: the models are commoditized — the missing piece is a delightful,
opinionated interface that turns them into a real creative tool. That interface
is the whole product.

---

## What's in the box

- **Dashboard** — a library of your storyboards plus starter templates
  (Product Launch, Founder Story, 60-Second Explainer).
- **Storyboard editor** — a scene-by-scene canvas with:
  - drag-to-reorder timeline,
  - per-scene visual prompt, script/caption, look, output type (image/video),
    and duration,
  - live preview with the script rendered as an on-screen caption,
  - one-click **Generate scene** and **Generate all**.
- **Pluggable generation backends** — swap the model without touching the UI.
- **Accounts & sync** — email/password auth via Supabase; each user's
  storyboards are persisted per-user in Postgres with row-level security, plus a
  profile section and a members directory.

---

## Getting started

Luna targets **Node ≥ 20.9** (Next.js 16 requirement). An `.nvmrc` is included:

```bash
nvm use          # picks up Node 22 from .nvmrc
npm install
cp .env.example .env.local   # then fill in the Supabase values below
npm run dev                  # http://localhost:3000
```

Generation runs immediately on the built-in **Luna Preview** provider (styled
placeholder frames, no keys), so you can design flow and copy before wiring a
real model.

### Auth & database (Supabase)

Luna uses Supabase for authentication and per-user storyboard storage. Set:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
```

The schema (`profiles`, `storyboards`) and its row-level-security policies live
in `supabase/migrations`. Auth is email/password; sessions are refreshed in
`src/proxy.ts` (Next.js 16's renamed middleware) and every route except the auth
screens requires a session.

> **Email confirmation:** by default Supabase requires new users to confirm
> their email before they can sign in. For frictionless local testing you can
> turn this off at **Authentication → Providers → Email → "Confirm email"** in
> the Supabase dashboard. For production with confirmation on, add your deployed
> URL under **Authentication → URL Configuration → Redirect URLs**.

### Production build

```bash
npm run build    # uses the webpack builder (see note below)
npm start
```

> **Note on the build.** `npm run build` uses `next build --webpack`. In this
> repo's environment, Turbopack's production-build worker fails to resolve
> Tailwind v4's native `@tailwindcss/oxide` binary from its bundle sandbox,
> while both the webpack build and Turbopack **dev** (`npm run dev`) work
> perfectly. `npm run build:turbopack` is kept so you can retry the Turbopack
> build as that issue is resolved upstream.

---

## Connecting a real backend

Luna ships with three providers (see [`src/lib/providers`](src/lib/providers)):

| Provider          | Kind                         | Configure with                          |
| ----------------- | ---------------------------- | --------------------------------------- |
| **Luna Preview**  | Built-in placeholder         | _nothing — always on_                   |
| **Replicate**     | Hosted open models           | `REPLICATE_API_TOKEN`                   |
| **ComfyUI**       | Self-hosted node-graph engine| `COMFYUI_URL` (+ a workflow)            |

1. Copy `.env.example` to `.env.local` and fill in the keys for the backend you
   want.
2. Restart the dev server.
3. Open the **backend chip** in the app header and select your provider — it
   shows "Connected" once its config is detected.

### Adding your own provider

A provider is a thin adapter — implement the `Provider` interface and register
it. Nothing else in the app needs to change:

```ts
// src/lib/providers/types.ts
export interface Provider {
  id: string;
  name: string;
  description: string;
  capabilities: { image: boolean; video: boolean };
  isConfigured(): boolean;
  generate(req: GenerationRequest): Promise<GenerationResult>;
}
```

Add it to the registry in [`src/lib/providers/index.ts`](src/lib/providers/index.ts).
`buildStyledPrompt()` in `providers/prompt.ts` gives you consistent, style-aware
prompts across every backend.

---

## Architecture

```
src/
  app/
    page.tsx                 Dashboard (storyboard library)
    storyboard/[id]/page.tsx Editor route
    api/generate/route.ts    Generation endpoint → provider layer
    api/providers/route.ts   Provider metadata (server-computed config status)
  components/
    dashboard/               Library, templates, new-storyboard flow
    editor/                  Preview, inspector, drag-sortable timeline
    providers/               Backend picker + status chip
    ui/                      Design-system primitives
  lib/
    store.ts                 Zustand + localStorage (all app state)
    providers/               Pluggable generation backends
    types.ts, constants.ts   Domain model + presets/templates
```

**Data flow:** the client store holds storyboards and the chosen provider id. A
generate action calls `/api/generate`, which resolves the right provider on the
server (honoring your choice, falling back to a configured one, and finally to
the always-available preview), runs it, and returns a normalized asset that the
store writes back onto the scene.

---

## Roadmap ideas

- Timeline assembly / export (stitch scenes into a single clip via an existing
  open tool like ffmpeg or Remotion).
- Cloud sync + sharing (the store is already isolated behind a clean interface).
- Per-scene variations and a "pick the best" gallery.
- Voiceover generation as another provider capability.
