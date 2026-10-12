/* Headless-Chrome smoke tests for Mobile Banking Fees BD (puppeteer-core + system Chromium). */
"use strict";
const fs = require("fs");
const puppeteer = require("/home/hatch/workspace/muse-project-factory/builds/savings-interest-bd/node_modules/puppeteer-core");

const DIR = "/home/hatch/workspace/muse-project-factory/builds/mobile-banking-fees-bd";
const FILE = "file://" + DIR + "/index.html";
const DL = "/tmp/mbfr-dl";
let pass = 0, fail = 0;
function eq(actual, expected, label) {
  if (actual === expected) { pass++; console.log("  ok:", label); }
  else { fail++; console.error("FAIL:", label, "\n  expected:", JSON.stringify(expected), "\n  actual:  ", JSON.stringify(actual)); }
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "/opt/meta-chromium/chrome",
    headless: "new",
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--allow-file-access-from-files"]
  });
  const errors = [];
  try {
    fs.rmSync(DL, { recursive: true, force: true });
    fs.mkdirSync(DL, { recursive: true });
    const page = await browser.newPage();
    page.on("console", m => { if (m.type() === "error") errors.push("console: " + m.text()); });
    page.on("pageerror", e => errors.push("pageerror: " + e.message));
    await page.setViewport({ width: 1280, height: 900 });
    await page.goto(FILE, { waitUntil: "load", timeout: 30000 });
    await page.waitForFunction(() => document.querySelector('[data-i18n="appTitle"]').textContent.length > 0, { timeout: 5000 });
    const txt = sel => page.$eval(sel, el => el.textContent);
    const vis = sel => page.$eval(sel, el => !el.hidden);

    // 1. default state: EN, cashout active, compare empty, history empty
    eq(await txt('[data-i18n="appTitle"]'), "Mobile Banking Fees BD", "EN title by default");
    eq(await page.$eval("#panel-cashout", el => el.classList.contains("active")), true, "cashout panel active by default");
    eq(await page.$eval("#panel-compare", el => el.hidden), true, "compare panel hidden initially");
    await page.click('[data-tab="compare"]');
    eq(await vis("#compare-empty"), true, "compare empty state visible");
    await page.click('[data-tab="history"]');
    eq(await vis("#history-empty"), true, "history empty state visible");
    await page.click('[data-tab="cashout"]');

    // 2. cashout happy path: bKash agent, 10000 -> fee 185.00, net 9815
    await page.$eval("#co-amount", el => { el.value = "10000"; });
    await page.click('#cashout-form button[type="submit"]');
    await page.waitForFunction(() => !document.getElementById("co-result").hidden, { timeout: 5000 });
    eq(await txt('[data-result="co-fee"]'), "৳185.00", "cashout fee = ৳185.00");
    eq(await txt('[data-result="co-net"]'), "৳9,815.00", "cashout net = ৳9,815.00");
    eq(await txt('[data-result="co-rate"]'), "18.50/ ৳1000 (bKash · Agent (standard))", "rate line text");
    eq(await txt("#history-badge"), "1", "history badge = 1");

    // 3. cashout priyo channel: 25000 -> 372.50
    await page.select("#co-channel", "priyo");
    await page.$eval("#co-amount", el => { el.value = "25000"; });
    await page.click('#cashout-form button[type="submit"]');
    await page.waitForFunction(() => document.querySelector('[data-result="co-fee"]').textContent === "৳372.50", { timeout: 5000 });
    eq(await txt('[data-result="co-fee"]'), "৳372.50", "priyo cashout fee = ৳372.50");
    eq(await txt("#history-badge"), "2", "history badge = 2");

    // 4. validation: empty, zero, too big
    await page.$eval("#co-amount", el => { el.value = ""; });
    await page.click('#cashout-form button[type="submit"]');
    await page.waitForFunction(() => document.getElementById("err-co-amount").classList.contains("show"), { timeout: 5000 });
    eq(await txt("#err-co-amount"), "This field is required.", "empty amount -> required error");
    eq(await page.$eval("#co-result", el => el.hidden), true, "result hidden on invalid submit");
    await page.$eval("#co-amount", el => { el.value = "0"; });
    await page.click('#cashout-form button[type="submit"]');
    await page.waitForFunction(() => document.getElementById("err-co-amount").textContent === "Enter an amount greater than 0.", { timeout: 5000 });
    eq(await txt("#err-co-amount"), "Enter an amount greater than 0.", "zero amount -> positive error");
    await page.$eval("#co-amount", el => { el.value = "999999999"; });
    await page.click('#cashout-form button[type="submit"]');
    await page.waitForFunction(() => /500,000/.test(document.getElementById("err-co-amount").textContent), { timeout: 5000 });
    eq(await txt("#err-co-amount"), "Amount must be ৳500,000 or less.", "huge amount -> too-big error");

    // 5. send happy path: Nagad, 50000 -> fee 0, receiver 50000
    await page.click('[data-tab="send"]');
    await page.select("#sm-provider", "nagad");
    await page.$eval("#sm-amount", el => { el.value = "50000"; });
    await page.click('#send-form button[type="submit"]');
    await page.waitForFunction(() => !document.getElementById("sm-result").hidden, { timeout: 5000 });
    eq(await txt('[data-result="sm-fee"]'), "৳0.00", "nagad send fee = ৳0.00");
    eq(await txt('[data-result="sm-net"]'), "৳50,000.00", "nagad receiver = ৳50,000.00");
    // 6. send bKash 100 -> fee 5.00 (slab boundary), rule label
    await page.select("#sm-provider", "bkash");
    await page.$eval("#sm-amount", el => { el.value = "100"; });
    await page.click('#send-form button[type="submit"]');
    await page.waitForFunction(() => document.querySelector('[data-result="sm-fee"]').textContent === "৳5.00", { timeout: 5000 });
    eq(await txt('[data-result="sm-fee"]'), "৳5.00", "bkash send 100 -> ৳5.00");
    eq(await txt('[data-result="sm-rule"]'), "৳100 and above — ৳5.00", "send rule label");
    eq(await txt("#history-badge"), "4", "history badge = 4");

    // 7. compare: 10000 -> sorted cheapest-first, upay highlighted, tap n/a last
    await page.click('[data-tab="compare"]');
    await page.$eval("#cmp-amount", el => { el.value = "10000"; });
    await page.click('#compare-form button[type="submit"]');
    await page.waitForFunction(() => !document.getElementById("compare-table-wrap").hidden, { timeout: 5000 });
    const rows = await page.$$eval("#compare-body tr", trs => trs.map(tr => ({
      cls: tr.className,
      cells: [...tr.children].map(td => td.textContent)
    })));
    eq(rows.length, 5, "compare has 5 rows (4 providers + tap n/a)");
    eq(rows[0].cells[0].replace(/cheapest/, "").trim(), "upay", "cheapest row = upay");
    eq(rows[0].cls, "cheapest", "upay row highlighted");
    eq(rows[0].cells[3], "৳80.00", "upay fee = ৳80.00");
    eq(rows[1].cells[3], "৳90.00", "rocket fee = ৳90.00");
    eq(rows[2].cells[3], "৳125.00", "nagad fee = ৳125.00");
    eq(rows[3].cells[3], "৳149.00", "bkash fee = ৳149.00 (priyo channel)");
    eq(rows[4].cls, "na-row", "tap row marked n/a");
    // compare validation
    await page.$eval("#cmp-amount", el => { el.value = "-5"; });
    await page.click('#compare-form button[type="submit"]');
    await page.waitForFunction(() => document.getElementById("err-cmp-amount").classList.contains("show"), { timeout: 5000 });
    eq(await txt("#err-cmp-amount"), "Enter an amount greater than 0.", "compare negative -> error");

    // 8. rates edit + persist across reload
    await page.click('[data-tab="rates"]');
    await page.$eval("#r-bkash-co-agent", el => { el.value = "20"; });
    await page.click("#rates-save");
    await page.waitForFunction(() => /saved/i.test(document.getElementById("rates-status").textContent), { timeout: 5000 });
    eq(await txt("#rates-status"), "✓ Rates saved.", "rates saved status");
    await page.reload({ waitUntil: "load" });
    await page.waitForFunction(() => document.querySelector('[data-i18n="appTitle"]').textContent.length > 0, { timeout: 5000 });
    await page.click('[data-tab="cashout"]');
    await page.$eval("#co-amount", el => { el.value = "10000"; });
    await page.click('#cashout-form button[type="submit"]');
    await page.waitForFunction(() => document.querySelector('[data-result="co-fee"]').textContent === "৳200.00", { timeout: 8000 });
    eq(await txt('[data-result="co-fee"]'), "৳200.00", "edited rate persists after reload (20/1000)");
    // reset to defaults
    await page.click('[data-tab="rates"]');
    await page.click("#rates-reset");
    await page.waitForFunction(() => /reset/i.test(document.getElementById("rates-status").textContent), { timeout: 5000 });
    eq(await txt("#rates-status"), "✓ Rates reset to defaults.", "rates reset status");

    // 9. history: entries rendered, clear
    await page.click('[data-tab="history"]');
    const hcount = await page.$$eval("#history-list li", els => els.length);
    eq(hcount >= 4, true, "history has entries (" + hcount + ")");
    // export -> download file
    const cdp = await page.target().createCDPSession();
    await cdp.send("Page.setDownloadBehavior", { behavior: "allow", downloadPath: DL });
    await page.click("#hist-export");
    await sleep(1500);
    const dlFiles = fs.readdirSync(DL).filter(f => f.endsWith(".json"));
    eq(dlFiles.length >= 1, true, "export produced a JSON download");
    const backupPath = DL + "/" + dlFiles[0];
    const backup = JSON.parse(fs.readFileSync(backupPath, "utf8"));
    eq(backup.app, "mobile-banking-fees-bd", "export file has app marker");
    eq(Array.isArray(backup.history) && backup.history.length >= 4, true, "export file has history");
    // clear then import round-trip
    await page.click("#hist-clear");
    eq(await page.$$eval("#history-list li", els => els.length), 0, "history cleared");
    const inp = await page.$("#hist-import");
    await inp.uploadFile(backupPath);
    await page.waitForFunction(() => document.querySelectorAll("#history-list li").length >= 4, { timeout: 5000 });
    eq(await page.$$eval("#history-list li", els => els.length), backup.history.length, "import round-trip restores history");
    // malformed import rejected, data intact
    const badPath = "/tmp/mbfr-bad.json";
    fs.writeFileSync(badPath, "{ this is not valid json !!!");
    await inp.uploadFile(badPath);
    await page.waitForFunction(() => document.getElementById("hist-import-error").classList.contains("show"), { timeout: 5000 });
    eq(await txt("#hist-import-error"), "Import failed: file is not valid (malformed or wrong format). Your data is unchanged.", "malformed import error message");
    eq(await page.$$eval("#history-list li", els => els.length), backup.history.length, "history intact after bad import");

    // 10. BN toggle: title + Bengali digits, persisted across reload
    await page.click("#lang-bn");
    await page.waitForFunction(() => document.documentElement.lang === "bn", { timeout: 5000 });
    eq(await txt('[data-i18n="appTitle"]'), "মোবাইল ব্যাংকিং ফি বিডি", "BN title");
    await page.click('[data-tab="cashout"]');
    await page.$eval("#co-amount", el => { el.value = "10000"; });
    await page.click('#cashout-form button[type="submit"]');
    await page.waitForFunction(() => document.querySelector('[data-result="co-fee"]').textContent === "৳১৮৫.০০", { timeout: 8000 });
    eq(await txt('[data-result="co-fee"]'), "৳১৮৫.০০", "BN digits in fee");
    await page.reload({ waitUntil: "load" });
    await page.waitForFunction(() => document.documentElement.lang === "bn", { timeout: 8000 });
    eq(await txt('[data-i18n="appTitle"]'), "মোবাইল ব্যাংকিং ফি বিডি", "BN lang persists after reload");
    await page.click("#lang-en"); // restore EN for cleanliness

    // 11. 390px mobile: no horizontal overflow, tabs usable
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.reload({ waitUntil: "load" });
    await page.waitForFunction(() => document.querySelector('[data-i18n="appTitle"]').textContent.length > 0, { timeout: 5000 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1);
    eq(overflow, true, "390px: no horizontal overflow");
    // tabs scroll horizontally; tap through each
    for (const tab of ["cashout", "send", "compare", "rates", "history"]) {
      await page.click('[data-tab="' + tab + '"]');
      eq(await page.$eval("#panel-" + tab, el => !el.hidden), true, "390px: panel " + tab + " opens");
    }

    // 12. zero console/page errors
    eq(errors.length, 0, "zero console/page errors" + (errors.length ? ": " + errors.join(" | ") : ""));
  } finally {
    await browser.close();
  }
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error("HARNESS ERROR:", e); process.exit(2); });
