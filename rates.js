/* Mobile Banking Fees BD — shared fee-math module.
 *
 * Usable from Node (module.exports) and directly in the browser (<script>).
 * All fee figures are TYPICAL PUBLISHED RATES collected via web search in
 * October 2026. They are EDITABLE DEFAULTS — not live or guaranteed.
 * The app labels them as such and lets the user edit/reset them.
 *
 * All fees are rounded to 2 decimals (paisa).
 */
(function (root) {
  "use strict";

  var RATES_VERSION = 1;

  function round2(n) {
    return Math.round((n + Number.EPSILON) * 100) / 100;
  }

  /* Default rates. `cashout` is a list of channels; each has per1000.
   * `send` is a slab list; each slab is { upTo, flat } or { upTo, per1000 }.
   * upTo: Infinity allowed (last slab). */
  function defaultRates() {
    return {
      version: RATES_VERSION,
      providers: [
        {
          id: "bkash",
          name: "bKash",
          nameBn: "বিকাশ",
          available: true,
          cashout: [
            { id: "agent", label: "Agent (standard)", labelBn: "এজেন্ট (সাধারণ)", per1000: 18.50,
              note: "Published agent rate", noteBn: "প্রকাশিত এজেন্ট রেট" },
            { id: "priyo", label: "Priyo Agent (up to ৳25k/month)", labelBn: "প্রিয় এজেন্ট (মাসে ৳২৫,০০০ পর্যন্ত)", per1000: 14.90,
              note: "Above ৳25,000/month the rate becomes ৳18.50/1000", noteBn: "মাসে ৳২৫,০০০-এর বেশি হলে রেট ৳১৮.৫০/হাজার" },
            { id: "atm", label: "ATM", labelBn: "এটিএম", per1000: 15.00,
              note: "BRAC Bank ATM", noteBn: "ব্র্যাক ব্যাংক এটিএম" }
          ],
          send: {
            slabs: [
              { upTo: 99, flat: 0, label: "Under ৳100 (app)", labelBn: "৳১০০-এর কম (অ্যাপ)" },
              { upTo: Infinity, flat: 5, label: "৳100 and above", labelBn: "৳১০০ ও তার বেশি" }
            ],
            note: "Free to your 5 Priyo numbers.",
            noteBn: "৫টি প্রিয় নম্বরে সম্পূর্ণ ফ্রি।"
          }
        },
        {
          id: "nagad",
          name: "Nagad",
          nameBn: "নগদ",
          available: true,
          cashout: [
            { id: "agent", label: "Agent", labelBn: "এজেন্ট", per1000: 14.90,
              note: "Published agent rate", noteBn: "প্রকাশিত এজেন্ট রেট" },
            { id: "app", label: "App", labelBn: "অ্যাপ", per1000: 12.50,
              note: "Typical published app rate", noteBn: "সাধারণ প্রকাশিত অ্যাপ রেট" }
          ],
          send: {
            slabs: [
              { upTo: Infinity, flat: 0, label: "Free", labelBn: "ফ্রি" }
            ],
            note: "Send Money is free on Nagad.",
            noteBn: "নগদে সেন্ড মানি সম্পূর্ণ ফ্রি।"
          }
        },
        {
          id: "rocket",
          name: "Rocket",
          nameBn: "রকেট",
          available: true,
          cashout: [
            { id: "agent", label: "Agent", labelBn: "এজেন্ট", per1000: 18.00,
              note: "Published agent rate", noteBn: "প্রকাশিত এজেন্ট রেট" },
            { id: "atm", label: "ATM (DBBL)", labelBn: "এটিএম (ডিবিবিএল)", per1000: 9.00,
              note: "Dutch-Bangla Bank ATM", noteBn: "ডাচ-বাংলা ব্যাংক এটিএম" }
          ],
          send: {
            slabs: [
              { upTo: Infinity, flat: 5, label: "Per transaction", labelBn: "প্রতি লেনদেনে" }
            ],
            note: "Typical published flat charge.",
            noteBn: "সাধারণ প্রকাশিত ফ্ল্যাট চার্জ।"
          }
        },
        {
          id: "upay",
          name: "upay",
          nameBn: "উপায়",
          available: true,
          cashout: [
            { id: "agent", label: "Agent / USSD", labelBn: "এজেন্ট / ইউএসএসডি", per1000: 14.00,
              note: "1.4% incl. VAT & taxes", noteBn: "ভ্যাট ও ট্যাক্সসহ ১.৪%" },
            { id: "app", label: "App", labelBn: "অ্যাপ", per1000: 14.00,
              note: "Same as USSD", noteBn: "ইউএসএসডির সমান" },
            { id: "atm", label: "ATM (UCB)", labelBn: "এটিএম (ইউসিবি)", per1000: 8.00,
              note: "UCB-owned ATMs", noteBn: "ইউসিবির নিজস্ব এটিএম" }
          ],
          send: {
            slabs: [
              { upTo: Infinity, flat: 0, label: "Free (P2P)", labelBn: "ফ্রি (পি২পি)" }
            ],
            note: "Person-to-person transfers are charge-free.",
            noteBn: "ব্যক্তি-থেকে-ব্যক্তি লেনদেনে কোনো চার্জ নেই।"
          }
        },
        {
          id: "tap",
          name: "Tap",
          nameBn: "ট্যাপ",
          available: false,
          cashout: [],
          send: { slabs: [], note: "", noteBn: "" },
          unavailableReason: "No reliable published rates found — marked not available rather than guessed.",
          unavailableReasonBn: "নির্ভরযোগ্য প্রকাশিত রেট পাওয়া যায়নি — অনুমান না করে 'উপলব্ধ নয়' রাখা হয়েছে।"
        }
      ]
    };
  }

  /* Cash-out fee for an amount at a per-1000 rate. */
  function cashoutFee(amount, per1000) {
    return round2((amount * per1000) / 1000);
  }

  /* Send-money fee for an amount against a slab list. First slab whose
   * upTo >= amount wins. Slab may be {flat} or {per1000}. */
  function sendFee(amount, slabs) {
    for (var i = 0; i < slabs.length; i++) {
      var s = slabs[i];
      if (amount <= s.upTo) {
        if (typeof s.flat === "number") return round2(s.flat);
        if (typeof s.per1000 === "number") return round2((amount * s.per1000) / 1000);
        return 0;
      }
    }
    return 0;
  }

  function netReceived(amount, fee) {
    return round2(amount - fee);
  }

  /* Effective per-1000 rate (for display), null when fee is flat-zero. */
  function effectivePer1000(fee, amount) {
    if (amount <= 0) return null;
    return round2((fee / amount) * 1000);
  }

  /* Group digits in Bangladeshi style: 12,34,567.89 */
  function groupBD(intStr) {
    if (intStr.length <= 3) return intStr;
    var last3 = intStr.slice(-3);
    var rest = intStr.slice(0, -3);
    var parts = [];
    while (rest.length > 2) {
      parts.unshift(rest.slice(-2));
      rest = rest.slice(0, -2);
    }
    if (rest.length) parts.unshift(rest);
    parts.push(last3);
    return parts.join(",");
  }

  /* Format money with ৳ and 2 decimals, Bangladeshi digit grouping.
   * Pass lang 'bn' for Bengali digits. */
  function formatMoney(n, lang) {
    var fixed = (Math.round((n + Number.EPSILON) * 100) / 100).toFixed(2);
    var neg = fixed.charAt(0) === "-";
    if (neg) fixed = fixed.slice(1);
    var parts = fixed.split(".");
    var s = "৳" + groupBD(parts[0]) + "." + parts[1];
    if (neg) s = "-" + s;
    return lang === "bn" ? toBnDigits(s) : s;
  }

  var BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  function toBnDigits(s) {
    return String(s).replace(/[0-9]/g, function (d) { return BN_DIGITS[+d]; });
  }

  /* Validate a custom rates object before accepting it as the active set
   * (used by the rates editor and JSON import). Returns { ok, errors[] }. */
  function validateRates(obj) {
    var errors = [];
    if (!obj || typeof obj !== "object") return { ok: false, errors: ["not an object"] };
    if (!Array.isArray(obj.providers)) { errors.push("providers must be an array"); }
    else {
      obj.providers.forEach(function (p, i) {
        if (typeof p.id !== "string" || !p.id) errors.push("provider[" + i + "]: missing id");
        if (p.available === false) return;
        if (!Array.isArray(p.cashout)) errors.push("provider " + p.id + ": cashout must be an array");
        else p.cashout.forEach(function (c, j) {
          if (typeof c.per1000 !== "number" || !(c.per1000 >= 0) || c.per1000 > 1000)
            errors.push("provider " + p.id + " channel " + j + ": per1000 must be 0..1000");
        });
        var slabs = p.send && p.send.slabs;
        if (!Array.isArray(slabs) || slabs.length === 0) errors.push("provider " + p.id + ": send.slabs missing");
        else slabs.forEach(function (s, k) {
          var feeOk = (typeof s.flat === "number" && s.flat >= 0) ||
                      (typeof s.per1000 === "number" && s.per1000 >= 0);
          if (!feeOk) errors.push("provider " + p.id + " slab " + k + ": needs flat or per1000 >= 0");
        });
      });
    }
    return { ok: errors.length === 0, errors: errors };
  }

  /* Cheapest cash-out channel for a provider (by per1000). Null if none. */
  function cheapestChannel(provider) {
    if (!provider.available || !provider.cashout || !provider.cashout.length) return null;
    return provider.cashout.reduce(function (a, b) { return b.per1000 < a.per1000 ? b : a; });
  }

  var api = {
    RATES_VERSION: RATES_VERSION,
    round2: round2,
    defaultRates: defaultRates,
    cashoutFee: cashoutFee,
    sendFee: sendFee,
    netReceived: netReceived,
    effectivePer1000: effectivePer1000,
    formatMoney: formatMoney,
    toBnDigits: toBnDigits,
    groupBD: groupBD,
    validateRates: validateRates,
    cheapestChannel: cheapestChannel
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    root.FeesBD = api;
  }
})(typeof self !== "undefined" ? self : this);
