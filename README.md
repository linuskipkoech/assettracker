# AssetTracker KE

Track every asset you own — farms, livestock, a small business, stocks, land,
rental property — in one dashboard. Get general guidance from a built-in AI
assistant (including a Kenya-specific planting-advice tool), and book a
professional advisor when a decision needs real, tailored expertise.

## Tech stack

- **Next.js 16** (App Router) + **TypeScript** + **Tailwind CSS**
- **SQLite** via **Drizzle ORM** (zero-config for local dev; portable to Postgres — see below)
- **Auth.js (NextAuth v5)** with email/password (credentials) auth, JWT sessions
- **Anthropic Claude API** for the AI assistant (bring your own key)
- **Recharts** for the net-worth breakdown chart
- **Vitest** for unit tests

## Getting started

```bash
npm install
cp .env.example .env      # then edit .env — see "Environment variables" below
npm run setup              # creates the SQLite DB and adds demo data
npm run dev
```

Open http://localhost:3000. Log in with the seeded demo account:

- **Email:** `demo@assettracker.ke`
- **Password:** `demopass123`

Or click "Get started" to create your own account.

Two demo advisor accounts are also seeded (`james.kariuki@example.com` and
`grace.mumbi@example.com`, password `advisorpass123`) so the Advisors
directory isn't empty on a fresh checkout.

### Environment variables

Copy `.env.example` to `.env` and fill in:

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | Yes | Defaults to `file:./dev.db` (SQLite). See "Moving to Postgres" below. |
| `NEXTAUTH_SECRET` | Yes | Signs session cookies. Generate one with `openssl rand -base64 32`. |
| `NEXTAUTH_URL` | Yes | e.g. `http://localhost:3000` locally, your real domain in production. |
| `ANTHROPIC_API_KEY` | No | Your own key from https://console.anthropic.com/. Without it, the AI assistant reports itself offline but the rest of the app works normally — including a rule-based fallback for planting advice. |
| `ANTHROPIC_MODEL` | No | Defaults to `claude-sonnet-4-5-20250929`. |
| `RESEND_API_KEY` | No | Your own key from https://resend.com/. Without it, beneficiary/check-in emails are logged to the server console instead of sent — the whole feature still works for local testing. |
| `EMAIL_FROM` | No | Sender shown on those emails. Defaults to a Resend sandbox address. |
| `APP_URL` | No | Base URL for links inside those emails. Defaults to `NEXTAUTH_URL`. |
| `CRON_SECRET` | Only for the safety net | Shared secret for `POST /api/cron/check-inactivity`. The endpoint refuses to run until this is set. |

## What's included

- **Auth** — email/password signup and login, hashed passwords (bcrypt), JWT sessions, protected routes via middleware.
- **Assets** — Farm, Livestock, Business, Stock/Investment, Land, and Property, each with type-specific fields (e.g. acreage and crop for a farm, head count and breed for livestock, revenue/expenses for a business), a shared valuation, and a valuation history log.
- **Dashboard** — total net worth, a breakdown chart by asset category, and a recently-updated list.
- **AI Assistant** (`/assistant`) — a portfolio-aware chat assistant (Claude), plus a dedicated planting-advice tool that combines a static Kenyan agro-climatic reference dataset (rainy seasons by region, water needs and maturity by crop) with an LLM-written recommendation — falling back to the plain reference data if no API key is configured, so it never invents rainfall numbers it wasn't given.
- **Professional advisors** (`/advisors`) — advisor profiles (specialty, bio, rate, county), a directory with filtering, and a consultation-request flow (pending → accepted/declined → completed) visible to both sides on `/consultations`.
- **Beneficiaries & inactivity safety net** (`/beneficiaries`) — see below.

## Beneficiaries & inactivity safety net

Each user can list beneficiaries — people to notify if their account goes
inactive for an extended period — in priority order. Each beneficiary can
also have their own heir(s): a fallback contact reached only if *that*
specific beneficiary doesn't respond, not a fallback for anyone else's.

How it works, end to end:

1. **Activity tracking.** Every successful login updates `lastLoginAt` and
   cancels any in-progress check-in or escalation — logging in is always
   proof the account is fine. No separate "I'm still here" button to
   remember.
2. **Check-in.** Once a user hasn't logged in for `inactivityThresholdDays`
   (default 90, configurable per user on `/beneficiaries`), they're emailed
   a secure, one-click link asking them to confirm they're still around.
   They have `checkinGraceDays` (default 14) to click it — or just log in,
   which also confirms it.
3. **Escalation.** If neither happens in time, the first beneficiary in
   priority order is emailed: "this person hasn't checked in, please reach
   out to them, and let us know you've seen this." They have
   `beneficiaryGraceDays` (default 14) to acknowledge.
4. **Heirs.** If a beneficiary doesn't acknowledge in time, their own heir
   (if any) is notified next. Once all of one beneficiary's heirs are
   exhausted, the next top-level beneficiary is tried, and so on.
5. **Notification only.** Acknowledging a notice does **not** grant any
   account or data access — it only stops further escalation. This is a
   "make sure someone knows" system, not an access-transfer mechanism; a
   real estate/legal succession process is a separate, much bigger thing
   you'd build (or hand off to an attorney) on top of this.

All of the actual "has anyone gone quiet" checking happens in one function,
`runInactivityCheck()` in `src/lib/repositories/escalation.ts`, invoked by
`POST /api/cron/check-inactivity`. **Nothing calls that endpoint on its
own** — you need to schedule it yourself, e.g. once a day:

```bash
# crontab -e, run daily at 03:00
0 3 * * * curl -s -X POST https://your-domain.example/api/cron/check-inactivity \
  -H "Authorization: Bearer $CRON_SECRET"
```

Or, if you deploy to Vercel, a `vercel.json` cron entry pointed at the same
route (Vercel signs the request itself, but you can still check `CRON_SECRET`
as a second layer). The endpoint is idempotent and safe to call more often
than needed — it only acts on accounts whose deadline has actually passed,
and refuses to run at all (503) until `CRON_SECRET` is set.

## Moving to PostgreSQL for production

The schema (`src/db/schema.ts`) is written with Drizzle's SQLite column
builders, but the shapes map directly onto Postgres. To switch:

1. `npm install pg` and remove `better-sqlite3` (or keep it for local dev only).
2. In `src/db/schema.ts`, change the import from `drizzle-orm/sqlite-core` to `drizzle-orm/pg-core`, and swap `sqliteTable` → `pgTable`, `integer(..., { mode: "boolean" })` → `boolean(...)`, `integer(..., { mode: "timestamp" })` → `timestamp(...)`.
3. In `src/db/index.ts`, swap the `better-sqlite3` driver for `drizzle-orm/node-postgres` (or `postgres-js`).
4. In `drizzle.config.ts`, set `dialect: "postgresql"`.
5. Set `DATABASE_URL` to a real Postgres connection string and re-run `npm run db:generate && npm run db:migrate`.

## Known limitations — read before a real launch

This is a solid, working foundation, not a finished commercial product. Before
putting real money or real advisor relationships through it, you'd still want:

- **Payments** — consultation requests have no billing attached. Adding paid consultations means integrating a payment provider (Stripe, or M-Pesa via Daraja for a Kenya-first product) and building payout handling for advisors.
- **Advisor verification** — the `verified` flag exists in the schema but nothing currently checks credentials; it's set manually (e.g. directly in the database, or you'd build an admin review flow).
- **Live market/land data** — stock prices, land valuations, and weather forecasts are entered by the user or estimated by the AI assistant from general knowledge; there's no live feed from the NSE, a land registry, or the Kenya Meteorological Department. The planting-advice tool's seasonal data is a reasonable static baseline, not a forecast.
- **Rate limiting & abuse protection** — rate limiting is basic in-memory, which does not survive a restart and does not work across multiple server instances. A real deployment should move this to shared storage (e.g. Redis) or a platform-level solution (e.g. a WAF/CDN rule).
- **Beneficiary notification channel** — email only. The schema has a `phone` field for beneficiaries, but no SMS/WhatsApp provider is wired up; if email deliverability to an inactive or unmonitored inbox is a concern for your users, that's worth adding.
- **The inactivity scheduler** — `POST /api/cron/check-inactivity` does the real work, but nothing calls it automatically; see "Beneficiaries & inactivity safety net" above for how to schedule it. If it's never scheduled, the feature silently does nothing beyond letting users set it up.
- **Email verification & password reset** — not implemented. Anyone can sign up with any email address; there's no "forgot password" flow yet.
- **Admin tooling** — no dedicated screen for managing users, verifying advisors, or moderating content. The `role` field (`USER` / `ADVISOR` / `ADMIN`) exists in the schema for this purpose but no admin UI is built yet.
- **Automated end-to-end tests** — unit tests cover the agro-calendar logic, net-worth aggregation, and input validation; there's no automated browser-level test suite yet.
- **Security review** — the app follows sensible defaults (hashed passwords, per-request auth checks, zod validation on every write, ownership checks scoped to `userId` on every query) but hasn't had an independent security audit.

## Project structure

```
src/
  app/                 Next.js App Router pages + API routes
  components/          Client-side UI components (forms, chat, chart)
  db/                  Drizzle schema, DB client, migration + seed scripts
  lib/
    ai/                Anthropic client, prompts, Kenya agro-calendar data
    email/             Email client (Resend) + templates for the safety net
    escalation/        Pure beneficiary-chain logic (unit tested, no DB)
    repositories/      Data-access functions (assets, advisors/consultations, beneficiaries, escalation)
    validation.ts      zod schemas shared by API routes and forms
    constants.ts       Asset types, advisor specialties, Kenya counties
  auth.ts              Full NextAuth config (Node runtime — API routes, pages)
  auth.config.ts       Edge-safe NextAuth config (used by middleware.ts)
  middleware.ts         Route protection
drizzle/               Generated SQL migrations
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm start` | Run the production build |
| `npm run lint` | ESLint |
| `npm test` | Run the unit test suite (Vitest) |
| `npm run db:generate` | Generate a new SQL migration from schema changes |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:seed` | Add demo data (safe to re-run) |
| `npm run setup` | migrate + seed, for first-time setup |
