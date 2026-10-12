# Mobile Banking Fees BD

A bilingual (English / বাংলা), fully offline static web app that calculates mobile-banking transaction fees in Bangladesh — bKash, Nagad, Rocket, upay (Tap marked not-available).

## The problem

Cash-out and send-money charges differ across providers and channels (agent, Priyo agent, app, ATM), and the rates change often. There was no simple, offline, Bangla-friendly tool to answer "how much will I actually receive if I cash out ৳10,000?" — this app does that, side-by-side.

## Features

1. **Cash-out calculator** — provider + channel dropdown, amount → fee breakdown (rate applied, fee ৳, net received). Inline validation (required / positive / ≤ ৳500,000).
2. **Send-money calculator** — provider + amount → charge by published slab tiers (e.g. bKash free under ৳100 in-app, ৳5 flat at/above ৳100; Nagad and upay free), receiver gets amount − charge.
3. **Compare view** — one amount → all providers' cash-out fees side-by-side, each at its cheapest channel; cheapest highlighted; empty state before input.
4. **Rates reference & editor** — every default rate (provider × channel × per-1000, plus send slabs) editable in the UI, persisted to `localStorage`, with "Reset to defaults" and edited markers.
5. **History** — last 20 calculations in `localStorage`, clearable; JSON export/import of history + custom rates; malformed imports rejected with an error and data left intact.
6. **EN/বাংলা toggle** with Bengali digits, persisted in `localStorage`.
7. Responsive mobile layout (verified at 390px), empty/loading/error states, zero network calls, no secrets.

## Stack

Vanilla HTML/CSS/JS, no dependencies. Fee math lives in `rates.js`, written so both the browser (`window.FeesBD`) and Node (`module.exports`) can use it — unit tests run against the same code the UI uses.

## Prerequisites

A modern browser. For tests: Node.js 18+ and a Chromium binary (tests use `puppeteer-core` with `/opt/meta-chromium/chrome`).

## Run locally

```bash
cd mobile-banking-fees-bd
# open index.html directly in a browser, or:
npx serve .        # or: python3 -m http.server 8000
```

No build step, no env vars, no backend.

## Testing

```bash
npm test            # node test.js  (fee-math unit tests)
node smoke.js       # headless-Chrome smoke tests
```

Results (2026-10-11): **21/21 node unit tests** (hand-verified fee math incl. slab boundaries) and **50/50 headless-Chrome smoke checks**, zero console/page errors. Full detail in `TEST_RESULTS.md`.

## Deployment

Static files only — deploy to GitHub Pages (Settings → Pages → Deploy from branch) or any static host.

## Limitations

- **Rates are editable defaults, not live data.** All figures are typical published rates found via web search (October 2026): e.g. bKash agent ৳18.50/৳1000 (Priyo agent ৳14.90 up to ৳25k/month), Nagad agent ৳14.90 / app ~৳12.50, Rocket agent ৳18.00 / DBBL ATM ৳9.00, upay agent/USSD ৳14.00 / UCB ATM ৳8.00, send-money slabs as published. Providers change rates frequently — **always verify in the provider's official app before transacting.** The in-app disclaimer and footer say the same.
- Tap is included but its rates are marked **not available** (no reliable published figures found; not guessed).
- Not financial advice; educational/estimation tool only.

## Status

Built 2026-10-11 (factory run #30). Awaiting publishing.
