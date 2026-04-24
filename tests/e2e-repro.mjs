import { chromium } from "playwright";

const BASE = "http://localhost:5173";

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1180, height: 820 } });
  const page = await ctx.newPage();

  const logs = [];
  const errors = [];
  page.on("console", (m) => logs.push(`[${m.type()}] ${m.text()}`));
  page.on("pageerror", (e) => errors.push(`PAGEERROR ${e.message}\n${e.stack}`));

  // 1. Login
  console.log("── 1. Login as TestUserA ──");
  await page.goto(`${BASE}/auth`);
  await page.locator('input[autocomplete="name"]').fill("TestUserA");
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(`${BASE}/`, { timeout: 10000 });
  await page.waitForTimeout(1500);
  console.log("  URL:", page.url());

  // 2. Click "Nuovo elemento"
  console.log("── 2. Click 'Nuovo elemento' ──");
  await page.locator('button[aria-label="Nuovo elemento"]').click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: "/tmp/bb-a-dialog.png" });

  // 3. Dump dialog buttons + inputs
  console.log("── 3. Dialog contents ──");
  const dialogText = await page.locator('[role="dialog"], [role="alertdialog"]').first().innerText().catch(() => "");
  console.log("  dialog text:", dialogText.replace(/\n+/g, " | "));
  const inputs = await page.locator('[role="dialog"] input, [role="alertdialog"] input').all();
  console.log(`  inputs in dialog: ${inputs.length}`);
  for (let i = 0; i < inputs.length; i++) {
    const ph = await inputs[i].getAttribute("placeholder").catch(() => "");
    console.log(`    input[${i}] placeholder="${ph}"`);
  }

  // 4. Pick "personaggio" from the dropdown — this creates the element directly
  console.log("── 4. Pick 'personaggio' ──");
  await page.locator('[role="menuitem"], [role="option"]').filter({ hasText: "personaggio" }).first().click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "/tmp/bb-b-after-create.png" });

  // 6. Verify it appears in the list
  console.log("── 5. After create — list state ──");
  const body1 = await page.locator("body").innerText();
  console.log("  contains 'Nuovo personaggio':", body1.includes("Nuovo personaggio"));
  console.log("  contains 'Nessun elemento':", body1.includes("Nessun elemento"));
  // dump first 600 chars
  console.log("  body sample:", body1.slice(0, 600).replace(/\n+/g, " | "));

  // 7. Click on the created element in the list
  console.log("── 6. Click the created element in list pane ──");
  const listEl = page.locator('text=Nuovo personaggio').first();
  if (await listEl.count() > 0) {
    await listEl.click();
    await page.waitForTimeout(600);
  } else {
    console.log("  'Nuovo personaggio' not found in list — CRITICAL");
  }
  await page.screenshot({ path: "/tmp/bb-c-detail.png" });

  // 8. Try to edit title: find contenteditable or input in detail pane
  console.log("── 7. Attempt title edit ──");
  // Find header title in detail
  const detailTitle = page.locator('h1, h2, [role="heading"]').filter({ hasText: "Nuovo personaggio" }).first();
  if (await detailTitle.count() > 0) {
    console.log("  found detail title heading");
    await detailTitle.click();
    await page.waitForTimeout(300);
    // Now should be an input or contenteditable
    const editableField = page.locator('input:focus, [contenteditable="true"]:focus').first();
    if (await editableField.count() > 0) {
      console.log("  focused editable field — typing suffix");
      await page.keyboard.press("End");
      await page.keyboard.type(" EDITED");
      await page.keyboard.press("Tab");
      await page.waitForTimeout(1000);
    } else {
      console.log("  no editable field focused after click — trying triple-click + type");
      await detailTitle.click({ clickCount: 3 });
      await page.keyboard.type("ABRAMO");
      await page.keyboard.press("Tab");
      await page.waitForTimeout(1000);
    }
  } else {
    console.log("  no detail title heading found with ABRAMO text");
  }
  await page.screenshot({ path: "/tmp/bb-d-edited.png" });

  // 9. Try to edit descrizione
  console.log("── 8. Attempt descrizione edit (if visible) ──");
  const desc = page.locator('textarea, [contenteditable="true"]').first();
  if (await desc.count() > 0) {
    await desc.click();
    await page.keyboard.type("patriarca della fede");
    await page.keyboard.press("Tab");
    await page.waitForTimeout(800);
  }

  const beforeReload = await page.locator("body").innerText();
  console.log("── 9. State BEFORE reload ──");
  console.log("  contains 'EDITED':", beforeReload.includes("EDITED"));
  console.log("  contains 'ABRAMO':", beforeReload.includes("ABRAMO"));
  console.log("  contains 'patriarca':", beforeReload.includes("patriarca"));

  // 10. Reload
  console.log("── 10. Reload ──");
  await page.reload();
  await page.waitForTimeout(2500);
  await page.screenshot({ path: "/tmp/bb-e-after-reload.png" });

  const afterReload = await page.locator("body").innerText();
  console.log("── 11. State AFTER reload ──");
  console.log("  url:", page.url());
  console.log("  contains 'ABRAMO':", afterReload.includes("ABRAMO"));
  console.log("  contains 'EDITED':", afterReload.includes("EDITED"));
  console.log("  contains 'patriarca':", afterReload.includes("patriarca"));
  console.log("  contains 'Nessun elemento':", afterReload.includes("Nessun elemento"));
  console.log("  body sample:", afterReload.slice(0, 600).replace(/\n+/g, " | "));

  console.log("── 12. Console log summary (filtered) ──");
  for (const l of logs) {
    if (l.includes("[error]") || l.includes("[warning]") || l.toLowerCase().includes("jazz") || l.toLowerCase().includes("save") || l.toLowerCase().includes("commit") || l.toLowerCase().includes("failed") || l.toLowerCase().includes("workspace") || l.toLowerCase().includes("account")) {
      console.log("  " + l.slice(0, 300));
    }
  }
  console.log("── 13. Page errors ──");
  for (const e of errors) console.log("  " + e.slice(0, 500));

  await browser.close();
})().catch((e) => { console.error("FATAL:", e); process.exit(1); });
