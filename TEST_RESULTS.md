# TEST RESULTS — mobile-banking-fees-bd (run #30, 2026-10-11)

## Unit tests (`node test.js` — rates.js fee math)
**21/21 passed**, 0 failed.

Hand-verified computations (my own arithmetic, checked independently of the code):
1. bKash agent cash-out ৳10,000 @ ৳18.50/1000 → 10000 × 18.50 / 1000 = **৳185.00** ✓
2. bKash Priyo cash-out ৳25,000 @ ৳14.90/1000 → 25000 × 14.90 / 1000 = **৳372.50** ✓
3. Nagad app cash-out ৳5,000 @ ৳12.50/1000 → 5000 × 12.50 / 1000 = **৳62.50** ✓
4. bKash send ৳99 → **৳0** (under-100 free slab); ৳100 → **৳5** (slab boundary) ✓
5. upay ATM cash-out ৳10,000 @ ৳8.00/1000 → 10000 × 8 / 1000 = **৳80.00** ✓

Also covered: Rocket ATM 2000 → 18.00, fractional rounding 1500 @ 14.90 → 22.35, net 10000−185 = 9815, Nagad/Rocket/upay send slabs, BD digit grouping (৳2,04,028.97), Bengali digits (৳১৮৫.০০), cheapest-channel (bKash=priyo, Tap=null), validateRates accepts defaults / rejects negative per1000 / rejects null.

## Headless-Chrome smoke tests (`node smoke.js` — puppeteer-core + /opt/meta-chromium/chrome, file://)
**50/50 passed**, 0 failed, **0 console/page errors**.

Coverage:
- Default state: EN title, cash-out tab active, compare/history empty states.
- Cash-out happy paths with exact asserted amounts: bKash agent 10000 → ৳185.00 / ৳9,815.00 / rate line "18.50/ ৳1000 (bKash · Agent (standard))"; Priyo channel 25000 → ৳372.50.
- Validation: empty → "This field is required."; 0 → "Enter an amount greater than 0."; 999999999 → "Amount must be ৳500,000 or less."; results hidden on invalid submit.
- Send happy paths: Nagad 50000 → fee ৳0.00 / receiver ৳50,000.00; bKash 100 → ৳5.00 with rule label "৳100 and above — ৳5.00".
- Compare (10000): 5 rows sorted cheapest-first — upay ৳80.00 highlighted "cheapest", Rocket ৳90.00, Nagad ৳125.00, bKash ৳149.00 (Priyo channel), Tap row marked not-available; negative amount → inline error.
- Rates editor: bKash agent 18.50 → 20 saved, **persisted across reload** (recalc = ৳200.00), then reset to defaults confirmed.
- History: badge counts, entries rendered, JSON export produced a real download file (parsed: app marker + history present), clear works, import round-trip restores history, **malformed import rejected with the exact error message and history left intact**.
- i18n: BN toggle → "মোবাইল ব্যাংকিং ফি বিডি", fee renders "৳১৮৫.০০", language persisted across reload.
- Mobile 390px: no horizontal overflow (`scrollWidth <= clientWidth`); all 5 panels open via tabs.
- Zero console/page errors across the whole run.

## Repairs
- 1 app bug fixed: `applyLang()` wiped the History-tab badge via the `data-i18n` textContent loop before `renderHistory()` re-read it (`null.hidden` TypeError, broke init i18n) — fixed by rebuilding the badge before re-rendering. (Test revealed it via missing `#history-badge`.)
- 1 test-side fix: dropped a meaningless assertion about a hidden panel's empty-state visibility.

## Notes
- Rates are typical published figures from web search (Oct 2026), labeled as editable defaults throughout the UI with the required disclaimer. Tap has no reliable published rates → included but marked not available, never guessed.
