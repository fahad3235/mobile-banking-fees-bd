/* Mobile Banking Fees BD — UI logic. Requires rates.js (FeesBD) loaded first. */
(function () {
  "use strict";
  var F = window.FeesBD;

  var LS = { rates: "mbfr_rates_v1", history: "mbfr_history_v1", lang: "mbfr_lang" };
  var MAX_AMOUNT = 500000;
  var HISTORY_MAX = 20;

  /* ---------- i18n ---------- */
  var I18N = {
    en: {
      appTitle: "Mobile Banking Fees BD",
      appTagline: "Compare cash-out & send-money charges for bKash, Nagad, Rocket, upay",
      disclaimerTitle: "⚠️ Rates are editable defaults",
      disclaimerBody: "Fee figures are typical published rates, not guaranteed live. Rates change frequently — verify in the provider's official app before transacting.",
      tabCashout: "Cash-out", tabSend: "Send money", tabCompare: "Compare", tabRates: "Rates", tabHistory: "History",
      provider: "Provider", channel: "Channel", amount: "Amount (৳)", amountPh: "e.g. 10000",
      calculate: "Calculate",
      rateApplied: "Rate applied", slabApplied: "Charge rule applied", fee: "Fee",
      netReceived: "You receive", receiverGets: "Receiver gets",
      compareAmount: "Cash-out amount (৳)", compareNow: "Compare",
      compareEmpty: "Enter an amount above to compare cash-out fees across providers.",
      compareHint: "Cheapest provider highlighted. Each provider is shown at its cheapest available channel.",
      ratePer1000: "Rate / ৳1000", cheapest: "cheapest", notAvailable: "not available",
      ratesIntro: "Every default below is editable. Changes are saved on your device only.",
      saveRates: "Save changes", resetDefaults: "Reset to defaults",
      ratesSaved: "✓ Rates saved.", ratesReset: "✓ Rates reset to defaults.",
      cashoutRatesTitle: "Cash-out rates (per ৳1,000)", sendRatesTitle: "Send-money charges",
      per1000unit: "/ ৳1000", flatUnit: "৳ flat",
      sendUpTo: "up to", sendFlat: "flat fee", sendPer1000: "per ৳1000",
      exportJson: "Export JSON", importJson: "Import JSON", clearHistory: "Clear",
      historyEmpty: "No calculations yet. Use the Cash-out or Send money tabs.",
      historyCleared: "History cleared.",
      importOk: "✓ Import successful.", importBad: "Import failed: file is not valid (malformed or wrong format). Your data is unchanged.",
      cashoutShort: "Cash-out", sendShort: "Send money",
      errRequired: "This field is required.",
      errPositive: "Enter an amount greater than 0.",
      errTooBig: "Amount must be ৳500,000 or less.",
      footerNote: "All fee figures are editable defaults based on typically published rates — always verify in the provider's official app. No data leaves your device."
    },
    bn: {
      appTitle: "মোবাইল ব্যাংকিং ফি বিডি",
      appTagline: "বিকাশ, নগদ, রকেট, উপায়ের ক্যাশ-আউট ও সেন্ড মানি চার্জ তুলনা করুন",
      disclaimerTitle: "⚠️ রেটগুলো সম্পাদনাযোগ্য ডিফল্ট মান",
      disclaimerBody: "ফি-র অঙ্কগুলো সাধারণ প্রকাশিত রেট, নিশ্চিত লাইভ নয়। রেট ঘন ঘন বদলায় — লেনদেনের আগে প্রোভাইডারের অফিসিয়াল অ্যাপে যাচাই করুন।",
      tabCashout: "ক্যাশ-আউট", tabSend: "সেন্ড মানি", tabCompare: "তুলনা", tabRates: "রেটসমূহ", tabHistory: "ইতিহাস",
      provider: "প্রোভাইডার", channel: "মাধ্যম", amount: "টাকার পরিমাণ (৳)", amountPh: "যেমন ১০০০০",
      calculate: "হিসাব করুন",
      rateApplied: "প্রযোজ্য রেট", slabApplied: "প্রযোজ্য চার্জ নিয়ম", fee: "ফি",
      netReceived: "আপনি পাবেন", receiverGets: "প্রাপক পাবেন",
      compareAmount: "ক্যাশ-আউটের পরিমাণ (৳)", compareNow: "তুলনা করুন",
      compareEmpty: "প্রোভাইডারদের ক্যাশ-আউট ফি তুলনা করতে উপরে পরিমাণ দিন।",
      compareHint: "সবচেয়ে সস্তা প্রোভাইডার হাইলাইট করা। প্রতিটি প্রোভাইডারকে তার সস্তাতম মাধ্যমে দেখানো হয়েছে।",
      ratePer1000: "রেট / ৳১০০০", cheapest: "সবচেয়ে সস্তা", notAvailable: "উপলব্ধ নয়",
      ratesIntro: "নিচের প্রতিটি ডিফল্ট মান সম্পাদনাযোগ্য। পরিবর্তন শুধু আপনার ডিভাইসে সংরক্ষিত হয়।",
      saveRates: "পরিবর্তন সংরক্ষণ", resetDefaults: "ডিফল্টে ফিরুন",
      ratesSaved: "✓ রেট সংরক্ষিত।", ratesReset: "✓ রেট ডিফল্টে ফেরত গেছে।",
      cashoutRatesTitle: "ক্যাশ-আউট রেট (প্রতি ৳১,০০০)", sendRatesTitle: "সেন্ড মানি চার্জ",
      per1000unit: "/ ৳১০০০", flatUnit: "৳ ফ্ল্যাট",
      sendUpTo: "পর্যন্ত", sendFlat: "ফ্ল্যাট ফি", sendPer1000: "প্রতি ৳১০০০",
      exportJson: "JSON এক্সপোর্ট", importJson: "JSON ইমপোর্ট", clearHistory: "মুছুন",
      historyEmpty: "এখনো কোনো হিসাব নেই। ক্যাশ-আউট বা সেন্ড মানি ট্যাব ব্যবহার করুন।",
      historyCleared: "ইতিহাস মুছে ফেলা হয়েছে।",
      importOk: "✓ ইমপোর্ট সফল।", importBad: "ইমপোর্ট ব্যর্থ: ফাইলটি বৈধ নয় (ত্রুটিপূর্ণ বা ভুল ফরম্যাট)। আপনার ডেটা অপরিবর্তিত আছে।",
      cashoutShort: "ক্যাশ-আউট", sendShort: "সেন্ড মানি",
      errRequired: "এই ঘরটি পূরণ করা আবশ্যক।",
      errPositive: "০-এর বেশি পরিমাণ দিন।",
      errTooBig: "পরিমাণ ৳৫,০০,০০০-এর বেশি হতে পারবে না।",
      footerNote: "সব ফি-র অঙ্ক সাধারণ প্রকাশিত রেটের ভিত্তিতে সম্পাদনাযোগ্য ডিফল্ট — সবসময় প্রোভাইডারের অফিসিয়াল অ্যাপে যাচাই করুন। কোনো ডেটা আপনার ডিভাইস ছাড়ে না।"
    }
  };

  /* ---------- state ---------- */
  var state = {
    lang: "en",
    rates: F.defaultRates(),
    history: []
  };

  function t(key) { return (I18N[state.lang] && I18N[state.lang][key]) || I18N.en[key] || key; }
  function money(n) { return F.formatMoney(n, state.lang); }
  function digits(s) { return state.lang === "bn" ? F.toBnDigits(s) : String(s); }

  function loadState() {
    try {
      var l = localStorage.getItem(LS.lang);
      if (l === "bn" || l === "en") state.lang = l;
      var r = localStorage.getItem(LS.rates);
      if (r) {
        var parsed = JSON.parse(r);
        if (parsed && F.validateRates(parsed).ok) state.rates = parsed;
      }
      var h = localStorage.getItem(LS.history);
      if (h) {
        var hp = JSON.parse(h);
        if (Array.isArray(hp)) state.history = hp.slice(0, HISTORY_MAX);
      }
    } catch (e) { /* corrupted storage: keep defaults */ }
  }
  function saveRates() { localStorage.setItem(LS.rates, JSON.stringify(state.rates)); }
  function saveHistory() { localStorage.setItem(LS.history, JSON.stringify(state.history)); }
  function saveLang() { localStorage.setItem(LS.lang, state.lang); }

  function providerById(id) {
    return state.rates.providers.find(function (p) { return p.id === id; });
  }
  function providerName(p) { return state.lang === "bn" ? p.nameBn : p.name; }
  function channelName(c) { return state.lang === "bn" ? c.labelBn : c.label; }

  /* ---------- validation ---------- */
  function validateAmount(raw) {
    if (raw === null || raw === undefined || String(raw).trim() === "") return { ok: false, key: "errRequired" };
    var n = Number(raw);
    if (!isFinite(n)) return { ok: false, key: "errRequired" };
    if (n <= 0) return { ok: false, key: "errPositive" };
    if (n > MAX_AMOUNT) return { ok: false, key: "errTooBig" };
    return { ok: true, value: n };
  }
  function showError(input, errEl, key) {
    input.classList.add("invalid");
    errEl.textContent = t(key);
    errEl.classList.add("show");
  }
  function clearError(input, errEl) {
    input.classList.remove("invalid");
    errEl.classList.remove("show");
    errEl.textContent = "";
  }

  /* ---------- history ---------- */
  function addHistory(entry) {
    entry.id = Date.now();
    state.history.unshift(entry);
    state.history = state.history.slice(0, HISTORY_MAX);
    saveHistory();
    renderHistory();
  }

  /* ---------- tabs ---------- */
  function bindTabs() {
    document.querySelectorAll(".tab").forEach(function (btn) {
      btn.addEventListener("click", function () {
        document.querySelectorAll(".tab").forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        var tab = btn.getAttribute("data-tab");
        document.querySelectorAll(".panel").forEach(function (p) {
          var show = p.id === "panel-" + tab;
          p.hidden = !show;
          p.classList.toggle("active", show);
        });
      });
    });
  }

  /* ---------- selects ---------- */
  function providerOptions(selectEl, onlyAvailable) {
    selectEl.innerHTML = "";
    state.rates.providers.forEach(function (p) {
      if (onlyAvailable && !p.available) return;
      var opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = providerName(p) + (p.available ? "" : " (" + t("notAvailable") + ")");
      opt.disabled = !p.available;
      selectEl.appendChild(opt);
    });
  }
  function channelOptions(selectEl, provider) {
    selectEl.innerHTML = "";
    (provider.cashout || []).forEach(function (c) {
      var opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = channelName(c) + " — " + digits(c.per1000.toFixed(2)) + t("per1000unit");
      selectEl.appendChild(opt);
    });
    var note = document.getElementById("co-channel-note");
    note.textContent = "";
    selectEl.onchange = function () {
      var ch = provider.cashout.find(function (c) { return c.id === selectEl.value; });
      if (ch && ch.note) note.textContent = state.lang === "bn" ? ch.noteBn : ch.note;
      else note.textContent = "";
    };
    if (selectEl.onchange) selectEl.onchange();
  }

  /* ---------- cash-out ---------- */
  function bindCashout() {
    var pSel = document.getElementById("co-provider");
    var cSel = document.getElementById("co-channel");
    var amt = document.getElementById("co-amount");
    var err = document.getElementById("err-co-amount");
    var res = document.getElementById("co-result");

    providerOptions(pSel, true);
    function refreshChannels() {
      channelOptions(cSel, providerById(pSel.value));
    }
    pSel.addEventListener("change", refreshChannels);
    refreshChannels();

    document.getElementById("cashout-form").addEventListener("submit", function (e) {
      e.preventDefault();
      clearError(amt, err);
      var v = validateAmount(amt.value);
      if (!v.ok) { showError(amt, err, v.key); res.hidden = true; return; }
      var p = providerById(pSel.value);
      var ch = p.cashout.find(function (c) { return c.id === cSel.value; });
      var fee = F.cashoutFee(v.value, ch.per1000);
      var net = F.netReceived(v.value, fee);
      document.querySelector('[data-result="co-rate"]').textContent =
        digits(ch.per1000.toFixed(2)) + t("per1000unit") + " (" + providerName(p) + " · " + channelName(ch) + ")";
      document.querySelector('[data-result="co-fee"]').textContent = money(fee);
      document.querySelector('[data-result="co-net"]').textContent = money(net);
      res.hidden = false;
      addHistory({
        kind: "cashout", provider: p.id, providerName: p.name,
        channel: ch.id, channelName: ch.label,
        amount: v.value, fee: fee, net: net, rate: ch.per1000, at: new Date().toISOString()
      });
    });
  }

  /* ---------- send money ---------- */
  function bindSend() {
    var pSel = document.getElementById("sm-provider");
    var amt = document.getElementById("sm-amount");
    var err = document.getElementById("err-sm-amount");
    var res = document.getElementById("sm-result");

    providerOptions(pSel, true);
    document.getElementById("send-form").addEventListener("submit", function (e) {
      e.preventDefault();
      clearError(amt, err);
      var v = validateAmount(amt.value);
      if (!v.ok) { showError(amt, err, v.key); res.hidden = true; return; }
      var p = providerById(pSel.value);
      var slab = p.send.slabs.find(function (s) { return v.value <= s.upTo; }) || p.send.slabs[p.send.slabs.length - 1];
      var fee = F.sendFee(v.value, p.send.slabs);
      var net = F.netReceived(v.value, fee);
      var ruleText = state.lang === "bn" ? slab.labelBn : slab.label;
      if (slab.flat != null && slab.flat > 0) ruleText += " — " + money(slab.flat);
      else if (slab.per1000 != null && slab.per1000 > 0) ruleText += " — " + digits(slab.per1000.toFixed(2)) + t("per1000unit");
      document.querySelector('[data-result="sm-rule"]').textContent = ruleText;
      document.querySelector('[data-result="sm-fee"]').textContent = money(fee);
      document.querySelector('[data-result="sm-net"]').textContent = money(net);
      var note = document.getElementById("sm-note");
      note.textContent = (state.lang === "bn" ? p.send.noteBn : p.send.note) || "";
      res.hidden = false;
      addHistory({
        kind: "send", provider: p.id, providerName: p.name,
        amount: v.value, fee: fee, net: net, at: new Date().toISOString()
      });
    });
  }

  /* ---------- compare ---------- */
  function bindCompare() {
    var amt = document.getElementById("cmp-amount");
    var err = document.getElementById("err-cmp-amount");
    var empty = document.getElementById("compare-empty");
    var wrap = document.getElementById("compare-table-wrap");
    var body = document.getElementById("compare-body");

    document.getElementById("compare-form").addEventListener("submit", function (e) {
      e.preventDefault();
      clearError(amt, err);
      var v = validateAmount(amt.value);
      if (!v.ok) { showError(amt, err, v.key); wrap.hidden = true; empty.hidden = false; return; }
      var rows = [];
      state.rates.providers.forEach(function (p) {
        var ch = F.cheapestChannel(p);
        if (!ch) {
          rows.push({ p: p, ch: null, fee: null, net: null });
          return;
        }
        var fee = F.cashoutFee(v.value, ch.per1000);
        rows.push({ p: p, ch: ch, fee: fee, net: F.netReceived(v.value, fee) });
      });
      var priced = rows.filter(function (r) { return r.fee !== null; });
      var minFee = priced.length ? Math.min.apply(null, priced.map(function (r) { return r.fee; })) : null;
      // sort: priced ascending, n/a last
      rows.sort(function (a, b) {
        if (a.fee === null) return 1;
        if (b.fee === null) return -1;
        return a.fee - b.fee;
      });
      body.innerHTML = "";
      rows.forEach(function (r) {
        var tr = document.createElement("tr");
        if (r.ch === null) {
          tr.className = "na-row";
          tr.innerHTML = "<td>" + esc(providerName(r.p)) + "</td><td colspan='4'>" +
            esc(state.lang === "bn" ? r.p.unavailableReasonBn : r.p.unavailableReason) + "</td>";
        } else {
          var isCheap = minFee !== null && r.fee === minFee;
          if (isCheap) tr.className = "cheapest";
          var td1 = document.createElement("td");
          td1.textContent = providerName(r.p);
          if (isCheap) {
            var tag = document.createElement("span");
            tag.className = "cheap-tag";
            tag.textContent = t("cheapest");
            td1.appendChild(tag);
          }
          var td2 = document.createElement("td"); td2.textContent = channelName(r.ch);
          var td3 = document.createElement("td"); td3.textContent = digits(r.ch.per1000.toFixed(2));
          var td4 = document.createElement("td"); td4.textContent = money(r.fee);
          var td5 = document.createElement("td"); td5.textContent = money(r.net);
          [td1, td2, td3, td4, td5].forEach(function (td) { tr.appendChild(td); });
        }
        body.appendChild(tr);
      });
      empty.hidden = true;
      wrap.hidden = false;
    });
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  /* ---------- rates editor ---------- */
  var defaultsSnapshot = F.defaultRates();

  function bindRates() {
    renderRatesEditor();
    document.getElementById("rates-save").addEventListener("click", function () {
      collectRatesFromInputs();
      var v = F.validateRates(state.rates);
      var status = document.getElementById("rates-status");
      if (!v.ok) { status.textContent = "✗ " + v.errors[0]; return; }
      saveRates();
      status.textContent = t("ratesSaved");
      refreshProviderSelects();
    });
    document.getElementById("rates-reset").addEventListener("click", function () {
      state.rates = F.defaultRates();
      saveRates();
      renderRatesEditor();
      refreshProviderSelects();
      document.getElementById("rates-status").textContent = t("ratesReset");
    });
  }

  function editedMark(providerId, kind, id) {
    var d = defaultsSnapshot.providers.find(function (p) { return p.id === providerId; });
    var cur = providerById(providerId);
    if (!d || !cur) return "";
    if (kind === "cashout") {
      var dc = d.cashout.find(function (c) { return c.id === id; });
      var cc = cur.cashout.find(function (c) { return c.id === id; });
      if (dc && cc && dc.per1000 !== cc.per1000) return '<span class="edited-dot" title="edited">•</span>';
    } else if (kind === "send") {
      var ds = d.send.slabs[id], cs = cur.send.slabs[id];
      if (ds && cs && (ds.flat !== cs.flat || ds.per1000 !== cs.per1000)) return '<span class="edited-dot" title="edited">•</span>';
    }
    return "";
  }

  function renderRatesEditor() {
    var wrap = document.getElementById("rates-tables");
    wrap.innerHTML = "";
    document.getElementById("rates-status").textContent = "";
    state.rates.providers.forEach(function (p) {
      var card = document.createElement("div");
      card.className = "rates-card";
      var h = document.createElement("h3");
      h.textContent = providerName(p);
      card.appendChild(h);
      if (!p.available) {
        var na = document.createElement("p");
        na.className = "hint";
        na.textContent = state.lang === "bn" ? p.unavailableReasonBn : p.unavailableReason;
        card.appendChild(na);
        wrap.appendChild(card);
        return;
      }
      var hc = document.createElement("h4");
      hc.textContent = t("cashoutRatesTitle");
      hc.style.margin = "8px 0";
      card.appendChild(hc);
      p.cashout.forEach(function (c) {
        var row = document.createElement("div");
        row.className = "rate-row";
        var lab = document.createElement("label");
        lab.innerHTML = esc(channelName(c)) + editedMark(p.id, "cashout", c.id);
        lab.setAttribute("for", "r-" + p.id + "-co-" + c.id);
        var inp = document.createElement("input");
        inp.type = "number"; inp.min = "0"; inp.max = "1000"; inp.step = "any";
        inp.id = "r-" + p.id + "-co-" + c.id;
        inp.value = c.per1000;
        inp.setAttribute("data-rate", JSON.stringify({ provider: p.id, kind: "cashout", id: c.id }));
        var unit = document.createElement("span");
        unit.className = "unit";
        unit.textContent = t("per1000unit");
        row.appendChild(lab); row.appendChild(inp); row.appendChild(unit);
        card.appendChild(row);
      });
      var hs = document.createElement("h4");
      hs.textContent = t("sendRatesTitle");
      hs.style.margin = "12px 0 8px";
      card.appendChild(hs);
      p.send.slabs.forEach(function (s, i) {
        var row = document.createElement("div");
        row.className = "rate-row";
        var upToTxt = s.upTo === Infinity ? "∞" : digits(String(s.upTo));
        var lab = document.createElement("label");
        lab.innerHTML = esc(state.lang === "bn" ? s.labelBn : s.label) +
          " (" + t("sendUpTo") + " " + upToTxt + ")" + editedMark(p.id, "send", i);
        lab.setAttribute("for", "r-" + p.id + "-sm-" + i);
        var inp = document.createElement("input");
        inp.type = "number"; inp.min = "0"; inp.step = "any";
        inp.id = "r-" + p.id + "-sm-" + i;
        var mode, val;
        if (typeof s.flat === "number") { mode = "flat"; val = s.flat; }
        else { mode = "per1000"; val = s.per1000; }
        inp.value = val;
        inp.setAttribute("data-rate", JSON.stringify({ provider: p.id, kind: "send", index: i, mode: mode }));
        var unit = document.createElement("span");
        unit.className = "unit";
        unit.textContent = mode === "flat" ? t("flatUnit") : t("per1000unit");
        row.appendChild(lab); row.appendChild(inp); row.appendChild(unit);
        card.appendChild(row);
      });
      var note = document.createElement("p");
      note.className = "hint";
      note.textContent = state.lang === "bn" ? p.send.noteBn : p.send.note;
      card.appendChild(note);
      wrap.appendChild(card);
    });
  }

  function collectRatesFromInputs() {
    document.querySelectorAll("[data-rate]").forEach(function (inp) {
      var meta = JSON.parse(inp.getAttribute("data-rate"));
      var v = Number(inp.value);
      if (!isFinite(v) || v < 0) return;
      var p = providerById(meta.provider);
      if (!p || !p.available) return;
      if (meta.kind === "cashout") {
        var c = p.cashout.find(function (x) { return x.id === meta.id; });
        if (c) c.per1000 = v;
      } else if (meta.kind === "send") {
        var s = p.send.slabs[meta.index];
        if (!s) return;
        if (meta.mode === "flat") { s.flat = v; delete s.per1000; }
        else { s.per1000 = v; delete s.flat; }
      }
    });
  }

  function refreshProviderSelects() {
    // re-render selects so edited rates show up (keep current selection where possible)
    ["co-provider", "sm-provider"].forEach(function (id) {
      var sel = document.getElementById(id);
      var cur = sel.value;
      providerOptions(sel, true);
      if ([].some.call(sel.options, function (o) { return o.value === cur; })) sel.value = cur;
      sel.dispatchEvent(new Event("change"));
    });
  }

  /* ---------- history ---------- */
  function renderHistory() {
    var list = document.getElementById("history-list");
    var empty = document.getElementById("history-empty");
    var badge = document.getElementById("history-badge");
    list.innerHTML = "";
    if (!state.history.length) {
      empty.hidden = false;
      badge.hidden = true;
      return;
    }
    empty.hidden = true;
    badge.hidden = false;
    badge.textContent = digits(state.history.length);
    state.history.forEach(function (h) {
      var li = document.createElement("li");
      var kindTxt = h.kind === "cashout" ? t("cashoutShort") : t("sendShort");
      var left = document.createElement("div");
      var when = new Date(h.at);
      left.innerHTML = "<strong>" + esc(kindTxt) + "</strong> · " + esc(h.providerName || h.provider) +
        (h.channelName ? " · " + esc(h.channelName) : "") +
        "<div class='h-meta'>" + esc(when.toLocaleString()) + "</div>";
      var right = document.createElement("div");
      right.innerHTML = "<span class='h-amt'>" + esc(money(h.amount)) + "</span> → " +
        "<span class='h-meta'>" + t("fee") + " " + esc(money(h.fee)) + "</span>";
      li.appendChild(left); li.appendChild(right);
      list.appendChild(li);
    });
  }

  function bindHistory() {
    document.getElementById("hist-clear").addEventListener("click", function () {
      state.history = [];
      saveHistory();
      renderHistory();
    });
    document.getElementById("hist-export").addEventListener("click", function () {
      var payload = {
        app: "mobile-banking-fees-bd",
        version: 1,
        exportedAt: new Date().toISOString(),
        rates: state.rates,
        history: state.history
      };
      var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "mb-fees-backup.json";
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    });
    document.getElementById("hist-import").addEventListener("change", function (e) {
      var err = document.getElementById("hist-import-error");
      err.classList.remove("show");
      var file = e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var data = JSON.parse(reader.result);
          if (!data || data.app !== "mobile-banking-fees-bd" ||
              !Array.isArray(data.history) || !F.validateRates(data.rates).ok) {
            throw new Error("bad format");
          }
          state.history = data.history.slice(0, HISTORY_MAX);
          state.rates = data.rates;
          saveHistory(); saveRates();
          renderHistory(); renderRatesEditor(); refreshProviderSelects();
        } catch (ex) {
          // data left intact — just show the error
          err.textContent = t("importBad");
          err.classList.add("show");
        }
        e.target.value = "";
      };
      reader.onerror = function () {
        err.textContent = t("importBad");
        err.classList.add("show");
        e.target.value = "";
      };
      reader.readAsText(file);
    });
  }

  /* ---------- language ---------- */
  function applyLang() {
    document.documentElement.lang = state.lang === "bn" ? "bn" : "en";
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) {
      el.placeholder = t(el.getAttribute("data-i18n-ph"));
    });
    document.getElementById("lang-en").setAttribute("aria-pressed", state.lang === "en" ? "true" : "false");
    document.getElementById("lang-bn").setAttribute("aria-pressed", state.lang === "bn" ? "true" : "false");
    // the History tab label contains the badge span, which the loop above wiped — rebuild it first
    var tabBtn = document.querySelector('[data-tab="history"]');
    tabBtn.innerHTML = "";
    tabBtn.appendChild(document.createTextNode(t("tabHistory") + " "));
    var badge = document.createElement("span");
    badge.id = "history-badge";
    badge.className = "badge";
    tabBtn.appendChild(badge);
    // re-render dynamic parts
    renderRatesEditor();
    renderHistory();
    refreshProviderSelects();
  }
  function bindLang() {
    document.getElementById("lang-en").addEventListener("click", function () {
      state.lang = "en"; saveLang(); applyLang();
    });
    document.getElementById("lang-bn").addEventListener("click", function () {
      state.lang = "bn"; saveLang(); applyLang();
    });
  }

  /* ---------- init ---------- */
  loadState();
  bindTabs();
  bindCashout();
  bindSend();
  bindCompare();
  bindRates();
  bindHistory();
  bindLang();
  applyLang();
})();
