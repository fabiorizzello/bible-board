import { chromium } from "playwright";
const BASE = "http://localhost:5173";

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1180, height: 820 } });
  const page = await ctx.newPage();

  const saveLogs = [];
  page.on("console", (m) => {
    const t = m.text();
    if (t.includes("DEBUG-SAVE") || t.includes("Jazz") || t.includes("account") || t.includes("workspace") || t.toLowerCase().includes("persist") || t.toLowerCase().includes("storage") || t.toLowerCase().includes("indexed")) {
      saveLogs.push(`[${m.type()}] ${t.slice(0, 200)}`);
    }
  });

  // Login
  console.log("── Login ──");
  await page.goto(`${BASE}/auth`);
  await page.locator('input[autocomplete="name"]').fill("TestUserB");
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(`${BASE}/`, { timeout: 10000 });
  await page.waitForTimeout(2000);

  // Dump IndexedDB database names + localStorage
  console.log("── Storage inspection (before create) ──");
  const storage1 = await page.evaluate(async () => {
    const dbs = await indexedDB.databases();
    const lsKeys = Object.keys(localStorage);
    const lsSample = {};
    for (const k of lsKeys) lsSample[k] = localStorage.getItem(k)?.slice(0, 100);
    return { dbNames: dbs.map(d => d.name), localStorageKeys: lsKeys, localStorageSample: lsSample };
  });
  console.log("  IDB DBs:", storage1.dbNames);
  console.log("  localStorage keys:", storage1.localStorageKeys);
  for (const [k, v] of Object.entries(storage1.localStorageSample)) {
    console.log(`    ${k} = ${v}`);
  }

  // Grab account id
  const accountId1 = await page.evaluate(() => {
    return window.__JAZZ_DEBUG?.me?.id ?? localStorage.getItem("jazz-demo-auth-logged-in-secret") ?? "unknown";
  });
  console.log("  accountId marker:", accountId1);

  // Create personaggio
  console.log("── Create personaggio ──");
  await page.locator('button[aria-label="Nuovo elemento"]').click();
  await page.waitForTimeout(400);
  await page.locator('[role="menuitem"]').filter({ hasText: "personaggio" }).first().click();
  await page.waitForTimeout(2000);
  const list1 = await page.locator("body").innerText();
  console.log("  list contains 'Nuovo personaggio':", list1.includes("Nuovo personaggio"));

  // Inspect IDB row count for jazz storage
  const idbAfter = await page.evaluate(async () => {
    const dbs = await indexedDB.databases();
    const result = [];
    for (const { name, version } of dbs) {
      if (!name) continue;
      const db = await new Promise((res, rej) => {
        const req = indexedDB.open(name, version);
        req.onsuccess = () => res(req.result);
        req.onerror = () => rej(req.error);
      });
      const stores = Array.from(db.objectStoreNames);
      const counts = {};
      for (const s of stores) {
        try {
          const tx = db.transaction(s, "readonly");
          const store = tx.objectStore(s);
          const cnt = await new Promise((res) => {
            const r = store.count();
            r.onsuccess = () => res(r.result);
            r.onerror = () => res(-1);
          });
          counts[s] = cnt;
        } catch (e) { counts[s] = `err: ${e.message}`; }
      }
      db.close();
      result.push({ name, stores: counts });
    }
    return result;
  });
  console.log("  IDB content after create:", JSON.stringify(idbAfter, null, 2));

  // Reload
  console.log("── Reload ──");
  await page.reload();
  await page.waitForTimeout(3000);
  const afterBody = await page.locator("body").innerText();
  console.log("  url after reload:", page.url());
  console.log("  contains 'Nuovo personaggio':", afterBody.includes("Nuovo personaggio"));
  console.log("  contains 'Nessun elemento':", afterBody.includes("Nessun elemento"));

  // Second storage inspection
  const storage2 = await page.evaluate(async () => {
    const dbs = await indexedDB.databases();
    const lsKeys = Object.keys(localStorage);
    return { dbNames: dbs.map(d => d.name), lsKeys };
  });
  console.log("  IDB DBs after reload:", storage2.dbNames);
  console.log("  localStorage keys after reload:", storage2.lsKeys);

  console.log("── Filtered logs ──");
  for (const l of saveLogs.slice(0, 40)) console.log("  " + l);

  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
