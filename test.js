/* Node unit tests for rates.js fee-math (hand-verified expected values). */
"use strict";
const F = require("./rates.js");

let pass = 0, fail = 0;
function eq(actual, expected, label) {
  const a = JSON.stringify(actual), e = JSON.stringify(expected);
  if (a === e) { pass++; console.log("  ok:", label); }
  else { fail++; console.error("FAIL:", label, "\n  expected:", e, "\n  actual:  ", a); }
}

const R = F.defaultRates();
const byId = id => R.providers.find(p => p.id === id);

// --- Cash-out fee hand-verified ---
// 1. bKash agent: 10000 * 18.50/1000 = 185.00
eq(F.cashoutFee(10000, 18.50), 185, "bKash agent cash-out 10000 -> 185.00");
// 2. bKash priyo agent: 25000 * 14.90/1000 = 372.50
eq(F.cashoutFee(25000, 14.90), 372.5, "bKash priyo cash-out 25000 -> 372.50");
// 3. Nagad app: 5000 * 12.50/1000 = 62.50
eq(F.cashoutFee(5000, 12.50), 62.5, "Nagad app cash-out 5000 -> 62.50");
// 4. Rocket ATM: 2000 * 9.00/1000 = 18.00
eq(F.cashoutFee(2000, 9), 18, "Rocket ATM cash-out 2000 -> 18.00");
// 5. upay ATM: 10000 * 8.00/1000 = 80.00
eq(F.cashoutFee(10000, 8), 80, "upay ATM cash-out 10000 -> 80.00");
// 6. Fractional rounding: 1500 * 14.90/1000 = 22.35
eq(F.cashoutFee(1500, 14.90), 22.35, "fractional cash-out 1500 @14.90 -> 22.35");
// 7. Net received: 10000 - 185 = 9815
eq(F.netReceived(10000, 185), 9815, "net 10000-185 = 9815");

// --- Send-money slabs hand-verified ---
// 8. bKash send 99 -> 0 (under-100 free slab edge)
eq(F.sendFee(99, byId("bkash").send.slabs), 0, "bKash send 99 -> 0 (slab edge)");
// 9. bKash send 100 -> 5 (boundary, second slab)
eq(F.sendFee(100, byId("bkash").send.slabs), 5, "bKash send 100 -> 5 (slab boundary)");
// 10. bKash send 99.01 -> 5 (just over the free slab)
eq(F.sendFee(99.01, byId("bkash").send.slabs), 5, "bKash send 99.01 -> 5");
// 11. Nagad send 50000 -> 0 (free)
eq(F.sendFee(50000, byId("nagad").send.slabs), 0, "Nagad send 50000 -> 0");
// 12. Rocket send 10 -> 5 (flat per transaction)
eq(F.sendFee(10, byId("rocket").send.slabs), 5, "Rocket send 10 -> 5");
// 13. upay send 1000 -> 0 (free P2P)
eq(F.sendFee(1000, byId("upay").send.slabs), 0, "upay send 1000 -> 0");

// --- Formatting ---
// 14. Bangladeshi grouping: 204028.97 -> ৳2,04,028.97
eq(F.formatMoney(204028.97, "en"), "৳2,04,028.97", "BD grouping 204028.97");
// 15. Small amount: 185 -> ৳185.00
eq(F.formatMoney(185, "en"), "৳185.00", "money 185");
// 16. Bengali digits: 185.00 -> ৳১৮৫.০০
eq(F.formatMoney(185, "bn"), "৳১৮৫.০০", "BN digits 185");

// --- Cheapest channel ---
// 17. bKash cheapest = priyo (14.90)
eq(F.cheapestChannel(byId("bkash")).id, "priyo", "bKash cheapest channel = priyo");
// 18. Tap cheapest = null (not available)
eq(F.cheapestChannel(byId("tap")), null, "Tap cheapest channel = null");

// --- validateRates ---
// 19. defaults validate OK
eq(F.validateRates(R).ok, true, "default rates validate OK");
// 20. rejects negative per1000
const bad = JSON.parse(JSON.stringify(R));
bad.providers[0].cashout[0].per1000 = -5;
eq(F.validateRates(bad).ok, false, "negative per1000 rejected");
// 21. rejects non-object
eq(F.validateRates(null).ok, false, "null rates rejected");

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
