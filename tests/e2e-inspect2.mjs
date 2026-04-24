import { chromium } from "playwright";
const BASE = "http://localhost:5173";

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1180, height: 820 } });
  const page = await ctx.newPage();

  page.on("console", (m) => {
    const t = m.text();
    if (!t.includes("font-weight") && !t.includes("PressResponder") && !t.includes("hydration") && !t.includes("React DevTools")) {
      console.log(`  [${m.type()}] ${t.slice(0, 220)}`);
    }
  });

  await page.goto(`${BASE}/auth`);
  await page.locator('input[autocomplete="name"]').fill("TestUserD");
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(`${BASE}/`, { timeout: 10000 });
  await page.waitForTimeout(2000);

  console.log("── BEFORE create ──");
  console.log(JSON.stringify(await page.evaluate(() => ({
    accountId: window.__BB?.accountId,
    rootDefined: window.__BB?.rootDefined,
    workspaceDefined: window.__BB?.workspaceDefined,
    elementiLen: window.__BB?.elementiLen,
    workspaceNome: window.__BB?.workspaceNome,
  })), null, 2));

  console.log("── Create personaggio ──");
  await page.locator('button[aria-label="Nuovo elemento"]').click();
  await page.waitForTimeout(400);
  await page.locator('[role="menuitem"]').filter({ hasText: "personaggio" }).first().click();
  await page.waitForTimeout(1500);

  console.log("── AFTER create ──");
  console.log(JSON.stringify(await page.evaluate(() => ({
    accountId: window.__BB?.accountId,
    elementiLen: window.__BB?.elementiLen,
    firstElTitle: window.__BB?.me?.root?.workspace?.elementi?.[0]?.titolo ?? null,
    firstElId: window.__BB?.me?.root?.workspace?.elementi?.[0]?.id ?? null,
  })), null, 2));

  console.log("── Reload ──");
  await page.reload();
  await page.waitForTimeout(4000);

  console.log("── AFTER reload ──");
  console.log(JSON.stringify(await page.evaluate(() => ({
    accountId: window.__BB?.accountId,
    rootDefined: window.__BB?.rootDefined,
    workspaceDefined: window.__BB?.workspaceDefined,
    workspaceNome: window.__BB?.workspaceNome,
    elementiLen: window.__BB?.elementiLen,
    workspaceId: window.__BB?.me?.root?.workspace?.id ?? null,
    firstElTitle: window.__BB?.me?.root?.workspace?.elementi?.[0]?.titolo ?? null,
    rawLen: window.__BB?.rawCoMaps?.length ?? -1,
    domainLen: window.__BB?.domainElementi?.length ?? -1,
  })), null, 2));

  // Check DOM actually renders the list
  console.log("── DOM check ──");
  const bodyText = await page.locator("body").innerText();
  console.log("  contains 'Nuovo personaggio':", bodyText.includes("Nuovo personaggio"));
  console.log("  contains 'Nessun elemento':", bodyText.includes("Nessun elemento"));
  console.log("  body sample:", bodyText.slice(0, 400).replace(/\n+/g, " | "));

  // Try clicking "Tutti gli elementi" view to force a re-render
  console.log("── Click 'Tutti gli elementi' ──");
  const tutti = page.locator('text=Tutti gli elementi').first();
  if (await tutti.count() > 0) {
    await tutti.click();
    await page.waitForTimeout(1000);
    const body2 = await page.locator("body").innerText();
    console.log("  contains 'Nuovo personaggio' after clicking tutti:", body2.includes("Nuovo personaggio"));
    console.log("  sample:", body2.slice(0, 300).replace(/\n+/g, " | "));
  }

  // Trigger a storage event or navigate
  console.log("── Navigate back to Recenti ──");
  const recenti = page.locator('text=Recenti').first();
  if (await recenti.count() > 0) {
    await recenti.click();
    await page.waitForTimeout(800);
    const body3 = await page.locator("body").innerText();
    console.log("  contains 'Nuovo personaggio' in recenti:", body3.includes("Nuovo personaggio"));
  }

  // Wait more and try again
  await page.waitForTimeout(3000);
  console.log("── AFTER reload +3s ──");
  console.log(JSON.stringify(await page.evaluate(() => ({
    elementiLen: window.__BB?.elementiLen,
    domainLen: window.__BB?.domainElementi?.length ?? -1,
    workspaceNome: window.__BB?.workspaceNome,
    workspaceId: window.__BB?.me?.root?.workspace?.id ?? null,
  })), null, 2));

  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
