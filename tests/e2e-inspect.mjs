import { chromium } from "playwright";
const BASE = "http://localhost:5173";

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1180, height: 820 } });
  const page = await ctx.newPage();

  page.on("console", (m) => {
    const t = m.text();
    if (t.includes("[probe]")) console.log("  [browser]", t);
  });

  // Login
  await page.goto(`${BASE}/auth`);
  await page.locator('input[autocomplete="name"]').fill("TestUserC");
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(`${BASE}/`, { timeout: 10000 });
  await page.waitForTimeout(2000);

  console.log("── Create personaggio ──");
  await page.locator('button[aria-label="Nuovo elemento"]').click();
  await page.waitForTimeout(400);
  await page.locator('[role="menuitem"]').filter({ hasText: "personaggio" }).first().click();
  await page.waitForTimeout(1500);

  // Grab workspace content via browser eval — hook into React's fiber tree? Easier: read from module.
  // The workspace-ui-store exports getJazzElementi/getJazzMe. We need to get it via the dev module.
  const pre = await page.evaluate(async () => {
    // vite dev exposes modules; try to reach the store
    try {
      const mod = await import("/src/ui/workspace-home/workspace-ui-store.ts");
      const me = mod.getJazzMe ? mod.getJazzMe() : null;
      const els = mod.getJazzElementi ? mod.getJazzElementi() : [];
      return {
        hasMe: !!me,
        accountId: me?.id ?? null,
        rootDefined: !!me?.root,
        workspaceDefined: !!me?.root?.workspace,
        elementiLen: me?.root?.workspace?.elementi?.length ?? -1,
        storeElsLen: els.length,
        firstElTitle: me?.root?.workspace?.elementi?.[0]?.titolo ?? null,
      };
    } catch (e) {
      return { error: String(e) };
    }
  });
  console.log("── State BEFORE reload ──");
  console.log(JSON.stringify(pre, null, 2));

  // Reload
  console.log("── Reload ──");
  await page.reload();
  await page.waitForTimeout(4000);

  const post = await page.evaluate(async () => {
    try {
      const mod = await import("/src/ui/workspace-home/workspace-ui-store.ts");
      const me = mod.getJazzMe ? mod.getJazzMe() : null;
      return {
        hasMe: !!me,
        accountId: me?.id ?? null,
        rootDefined: !!me?.root,
        workspaceDefined: !!me?.root?.workspace,
        workspaceNome: me?.root?.workspace?.nome ?? null,
        elementiLen: me?.root?.workspace?.elementi?.length ?? -1,
        elementiRaw: me?.root?.workspace?.elementi ? Array.from(me.root.workspace.elementi).map((e) => ({
          id: e?.id,
          titolo: e?.titolo,
          tipo: e?.tipo,
          deletedAt: e?.deletedAt ?? null,
        })) : null,
      };
    } catch (e) {
      return { error: String(e) };
    }
  });
  console.log("── State AFTER reload ──");
  console.log(JSON.stringify(post, null, 2));

  // Inspect all coValues in IDB
  const idb = await page.evaluate(async () => {
    const db = await new Promise((res, rej) => {
      const r = indexedDB.open("jazz-storage");
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
    const tx = db.transaction("coValues", "readonly");
    const st = tx.objectStore("coValues");
    const all = await new Promise((res) => {
      const r = st.getAll();
      r.onsuccess = () => res(r.result);
      r.onerror = () => res([]);
    });
    db.close();
    return all.slice(0, 30).map(v => ({
      id: v.id ?? v.covalueID ?? "?",
      keys: Object.keys(v),
      headerPreview: JSON.stringify(v).slice(0, 220),
    }));
  });
  console.log("── IDB coValues sample (first 30) ──");
  for (const v of idb) console.log(" ", v.id, "—", v.headerPreview);

  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
