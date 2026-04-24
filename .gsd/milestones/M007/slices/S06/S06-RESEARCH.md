# S06 Research: Audit Jazz reale con 4 scenari browser

**Gathered:** 2026-04-24  
**Slice:** S06 — Audit Jazz reale con 4 scenari browser  
**Requirement:** R055

---

## Summary

S06 is a **browser audit** slice: no new UI, no schema changes. The deliverable is `S06-RESEARCH.md` documenting 4 Jazz runtime scenarios with verdicts and evidence. This research establishes the theoretical basis (code analysis + Jazz internals) and defines the exact verification procedure for the executor. Scenario D (sync intent) is fully confirmable from code alone; Scenarios A–C require live browser execution.

---

## Jazz Setup Analysis

### Runtime Stack (confirmed from code)

| Layer | Impl | Source |
|---|---|---|
| Package | `jazz-tools@0.14.28`, `jazz-react@0.14.28` | `package.json` |
| Auth | `useDemoAuth` → `DemoAuth` class → `LocalStorageKVStore` | `auth-context.tsx`, `jazz-browser/dist/auth/LocalStorageKVStore.js` |
| Storage | `IDBStorage` (IndexedDB, default) | `createBrowserContext.js` line: `peersToLoadFrom.push(await IDBStorage.asPeer())` |
| Sync | `sync={{ when: "never" }}` — no WebSocket created | `main.tsx` line 14 |
| Session | Web Locks API: `navigator.locks.request(accountID + "_" + idx)` | `createBrowserContext.js: provideBrowserLockSession` |
| Schema | `TimelineBoardAccount` → `TimelineBoardRoot` → `WorkspaceSchema` → `CoList<ElementoSchema>` | `workspace.schema.ts` |

### Key finding: `sync: { when: 'never' }` code path

From `createBrowserContext.js`:
```js
if (options.sync.when === "never") {
  return {
    toggleNetwork: () => { },  // no-op
    peersToLoadFrom,            // only IDB peer, no WebSocket
    setNode: () => { },
    crypto,
  };
}
```

Consequences:
- **No WebSocket is ever created** — no connection to any Jazz sync server attempted
- **IDBStorage peer IS active** — all mutations are persisted to IndexedDB
- **`toggleNetwork` is a no-op** — browser `online`/`offline` events have no effect
- DemoAuth credentials (account ID + secret) stored in `localStorage` via `LocalStorageKVStore`

### Multi-tab session isolation

`provideBrowserLockSession` iterates session slots `accountID + "_0"`, `accountID + "_1"`, etc. Each tab acquires a Web Lock on a different slot. This means:
- Tab 1 → session `accountID_0`
- Tab 2 → session `accountID_1`
- Both use the **same account** but different session IDs
- Both read/write to the **same IndexedDB database**
- No `BroadcastChannel` or `SharedWorker` observed in codebase — no active push notification between tabs

---

## 4 Scenarios: Planned Procedures and Expected Verdicts

### Scenario A: Reload dopo 5 mutazioni (persistence)

**What it tests:** Does IDB correctly persist CoMap mutations across page reload?

**Mechanism:**
1. DemoAuth reads `localStorage` key `demo-auth-existing-users` and account secret on reload → same Jazz account
2. Jazz node initializes with IDBStorage as peer → loads all CoValues for this account from IDB
3. All prior mutations (create/update/delete on `ElementoSchema`, `BoardSchema`, etc.) are CoValues stored in IDB

**Verification procedure for executor:**
1. `pnpm dev` → navigate to `http://localhost:5173`
2. Log in (or use existing DemoAuth user "Fabio")
3. Create 5 distinct mutations: create elemento "Abraamo", edit titolo → "Abraamo Patriarca", add tag "patriarca", add fonte (tipo "scrittura", valore "Gen 12:1"), create second elemento "Sara"
4. Open DevTools → Application → IndexedDB → look for `jazz-*` database → verify entries exist
5. Hard reload (Ctrl+Shift+R)
6. Verify: "Abraamo Patriarca", "Sara", tag "patriarca", fonte "Gen 12:1" all present
7. Check browser console for Jazz errors

**Expected verdict:** PASS  
**Rationale:** IDB is a durable peer; DemoAuth credentials survive localStorage. This is a standard Jazz-offline-first guarantee. No known issues.

---

### Scenario B: 2 tab propagano (multi-tab CRDT)

**What it tests:** Do mutations in Tab 1 propagate live to Tab 2 without reload?

**Mechanism:**
- Tab 1 writes to IDB (e.g., creates elemento "Isacco")
- Tab 2's in-memory Jazz node received the account's CoValues from IDB at startup
- **No BroadcastChannel / SharedWorker** observed → Tab 2 has no notification that Tab 1 modified IDB
- After Tab 2 refreshes: it reads the updated IDB → should see "Isacco"

**Verification procedure for executor:**
1. Open Tab 1 at `localhost:5173`, ensure logged in, element list shows N elements
2. Open Tab 2 at `localhost:5173` in a new window (same browser profile)
3. In Tab 1: create elemento "Isacco" — it should appear in Tab 1's list immediately
4. Observe Tab 2 WITHOUT refreshing — does "Isacco" appear? (expected: NO, or at least not immediately)
5. Wait 5 seconds — still not propagated?
6. Refresh Tab 2 → "Isacco" should now appear (loaded from IDB)
7. In DevTools → Application → Local Storage → note session keys (`accountID_0`, `accountID_1` sessionIDs)

**Expected verdict:** PARTIAL / EXPECTED-FAIL  
**Rationale:** No BroadcastChannel in jazz-browser v0.14.28, no WebSocket. IDB changes from Tab 1 are not pushed to Tab 2's in-memory node. Live propagation requires a sync server (M002 scope). After reload, Tab 2 reads from IDB → consistent. This is expected behavior for `sync:'never'`.  
**Action:** Document as known limitation to be resolved in M002. No fix needed in M007.

---

### Scenario C: Offline + modifica + online resync

**What it tests:** Are mutations made while network is simulated-offline preserved, and do they survive re-enabling the network?

**Mechanism:**
- With `sync: { when: 'never' }`, `toggleNetwork` is a no-op — the browser's online/offline state has **zero effect** on Jazz behavior
- Mutations always go to IDB regardless of network state
- "Resync" is not applicable without a remote sync peer

**Verification procedure for executor:**
1. Open DevTools → Network tab → toggle "Offline" preset
2. Observe app behavior: does it show any error or banner? (expected: no, since no network was ever used)
3. Create 3 new elementi while "offline"
4. Verify they appear in the list (IDB write works offline)
5. Toggle network back to "Online"
6. Verify: no crash, no data loss, all 3 elementi still present
7. Open DevTools → Application → IndexedDB → confirm entries exist for all created elementi
8. Reload page → confirm all elementi survive reload

**Expected verdict:** PASS (local-only mutations work offline); N/A for "resync" component  
**Rationale:** With `sync:'never'`, the app has always been "offline" from Jazz's perspective. Toggling network has no effect. Mutations accumulate in IDB and will be eligible for sync when M002 activates `sync: { when: 'signedUp', peer: 'wss://...' }`. The IDB transaction log is the source of truth that a future sync server would pull from.  
**Note for M002:** Jazz's IDB storage maintains a full CRDT transaction log. When sync is enabled in M002, the node will send all queued IDB transactions to the remote peer — this is the standard Jazz offline-first handshake.

---

### Scenario D: sync:'never' confermato intenzionale

**What it tests:** Is `sync: { when: 'never' }` intentional and correctly documented?

**Evidence from code (no browser execution required):**

`src/main.tsx` line 14:
```tsx
<JazzProvider
  AccountSchema={TimelineBoardAccount}
  sync={{ when: "never" }}
>
```

No env variables for Jazz cloud peer found:
```
rg 'JAZZ|VITE_JAZZ|cloudSyncPeer' src/ .env* vite.config.ts
```

`createBrowserContext.js` confirms this eliminates all network activity:
```js
if (options.sync.when === "never") {
  return { toggleNetwork: () => { }, peersToLoadFrom, ... };
}
```

**Verdict:** CONFIRMED INTENTIONAL  
**Rationale:** No API key exists, no sync server URL configured, `sync: 'never'` is the documented M007 state. The `CLAUDE.md` constitution section "Jazz `sync: { when: 'never' }`" explicitly states: "confermato intenzionale (no API key ancora) — non rimuovere."

**Forward intelligence for M002:** When activating sync, change to:
```tsx
sync={{ when: "signedUp", peer: process.env.VITE_JAZZ_PEER_URL }}
```
This should be env-variable driven, not a hardcoded URL. The IDB transaction log will automatically replay to the remote peer on first connection.

---

## Implementation Landscape

### Files Relevant to Audit

| File | Role |
|---|---|
| `src/main.tsx` | `sync: { when: 'never' }` — Scenario D evidence |
| `src/app/auth-context.tsx` | `useDemoAuth` → credential lifecycle |
| `node_modules/jazz-browser/dist/createBrowserContext.js` | IDB peer setup, sync:never code path |
| `node_modules/jazz-browser/dist/auth/LocalStorageKVStore.js` | DemoAuth localStorage persistence |
| `node_modules/cojson-storage-indexeddb/dist/idbNode.js` | IDB storage backend |

### What Needs to Be Built

1. **Run the app and execute scenarios A–C** in a real browser (can't be mocked)
2. **Document verdicts** with screenshots or DevTools evidence
3. **Write `S06-RESEARCH.md`** with the 4 verdict summaries
4. **Apply any in-scope fixes** — currently none expected based on code analysis

### Risk Assessment

| Risk | Likelihood | Impact |
|---|---|---|
| Scenario A fails (IDB not persisting) | Low | High — would indicate Jazz regression, needs investigation |
| Scenario B live-propagates (surprising pass) | Low | Low — would be a bonus, but not guaranteed without sync server |
| IDB corruption on hard reload | Very Low | Medium — would surface in console Jazz errors |
| `provideBrowserLockSession` lock contention | Low | Medium — could manifest as Tab 2 failing to initialize |

---

## Task Decomposition Recommendation

### T01 — Browser audit + document S06-RESEARCH.md

**Scope:** Execute all 4 scenarios, document verdicts and evidence, write the final `S06-RESEARCH.md` artifact.

**Files to modify:**
- Create/update `S06-RESEARCH.md` at `.gsd/milestones/M007/slices/S06/S06-RESEARCH.md`
- (If any in-scope Jazz fix needed) `src/main.tsx` or schema files

**Verification:**
```bash
# Scenario D — code analysis
grep 'when.*never' src/main.tsx
rg 'JAZZ\|VITE_JAZZ' src/ .env* 2>/dev/null || echo "no jazz env vars"

# Confirm IDB default storage (no storage prop passed to JazzProvider)
grep 'storage' src/main.tsx

# No websocket in network tab (browser devtools — manual)
# Open localhost:5173 → DevTools → Network → WS filter → confirm 0 connections

# Tests still pass
pnpm test --run
pnpm tsc --noEmit
```

**No changes to domain/adapter code expected.** If Scenario A or B yields surprising findings, escalate to roadmap as blocker before S07.

---

## Verdicts & Evidence

*Audit executed: 2026-04-24. Scenarios A–C are DEFERRED-TO-S07 (auto-mode has no interactive browser); verdicts are based on complete static analysis of Jazz runtime internals (`createBrowserContext.js`, `LocalStorageKVStore.js`, `idbNode.js`) already carried out in the research phase above. Scenario D is fully confirmed from code.*

---

### Scenario A — Reload dopo 5 mutazioni (persistence)

**Verdict: PASS (expected) — DEFERRED-TO-S07 for live confirmation**

**Rationale:**
- DemoAuth stores account ID + secret in `localStorage` via `LocalStorageKVStore` — credentials survive hard reload.
- `IDBStorage.asPeer()` is always initialized in `createBrowserContext.js` regardless of `sync` mode — all CoValue mutations are written to IndexedDB synchronously as part of the CRDT transaction log.
- On reload, Jazz node re-initializes with the same account (loaded from localStorage) and replays all IDB-persisted CoValues — the in-memory CRDT state is fully reconstructed.
- No Jazz regression or IDB corruption mechanism has been identified in v0.14.28.

**Evidence (static):**
```
createBrowserContext.js: peersToLoadFrom.push(await IDBStorage.asPeer())
LocalStorageKVStore.js: get(key) { return localStorage.getItem(key); }
```

**Action for S07:** Human operator to execute live: create 5 mutations → hard-reload → verify all present in UI. Expected: all 5 mutations survive reload.

---

### Scenario B — 2 tab propagano (multi-tab CRDT)

**Verdict: PARTIAL / EXPECTED-FAIL (live propagation) — DEFERRED-TO-S07 for confirmation**

**Rationale:**
- `provideBrowserLockSession` assigns separate session slots (`accountID_0`, `accountID_1`) to each tab, both under the same account.
- No `BroadcastChannel` or `SharedWorker` detected in jazz-browser@0.14.28 — there is no mechanism to notify Tab 2's in-memory Jazz node that Tab 1 has written new CoValues to IDB.
- **Expected behavior:** mutation in Tab 1 appears in Tab 1 immediately (in-memory). Tab 2 does NOT update in real-time. After Tab 2 is manually refreshed, it reads updated IDB and shows the mutation. This is not a bug — it is the expected behavior of `sync:'never'`.
- Live cross-tab propagation requires a sync server (M002 scope).

**Evidence (static):**
```
createBrowserContext.js: no BroadcastChannel, no SharedWorker references found
provideBrowserLockSession: navigator.locks.request(accountID + "_" + idx, ...)
```

**Action for S07:** Human operator to confirm: Tab 1 creates elemento → Tab 2 does NOT update live → Tab 2 refreshes → elemento appears. Known limitation, not a defect.

---

### Scenario C — Offline + modifica + online resync

**Verdict: PASS (local mutations) / N/A (resync) — DEFERRED-TO-S07 for live confirmation**

**Rationale:**
- With `sync: { when: 'never' }`, `toggleNetwork()` is a literal no-op (`return { toggleNetwork: () => { }, ... }`).
- The app has always been "network-isolated" from Jazz's perspective — toggling DevTools "Offline" changes only browser-level fetch/XHR behavior, which is irrelevant since no Jazz requests are made.
- All mutations go directly to IDB regardless of network state. The IDB write path does not check `navigator.onLine`.
- "Resync" component is not applicable: there is no remote peer to sync to. This scenario is effectively identical to normal usage.
- The CRDT transaction log in IDB will be the source for future sync in M002 — no data is lost, just not yet transmitted.

**Evidence (static):**
```
createBrowserContext.js:
if (options.sync.when === "never") {
  return { toggleNetwork: () => { }, peersToLoadFrom, setNode: () => { }, crypto };
}
```

**Action for S07:** Human operator to confirm: enable DevTools offline → create 3 elementi → re-enable online → verify no crash and all 3 elementi persist across reload.

---

### Scenario D — sync:'never' confermato intenzionale

**Verdict: CONFIRMED INTENTIONAL**

**Evidence (from code — fully verified in auto-mode):**

| Check | Command | Result |
|---|---|---|
| `sync: { when: "never" }` present | `grep -n 'when.*never' src/main.tsx` | Line 14: `sync={{ when: "never" }}` |
| No Jazz env vars | `rg 'JAZZ\|VITE_JAZZ\|cloudSyncPeer' src/ vite.config.ts` | 0 matches (exit 1) |
| No `storage` prop on JazzProvider | `grep 'storage' src/main.tsx` | No output (IDB is default) |
| TypeScript clean | `pnpm tsc --noEmit` | Clean (exit 0) |
| All tests pass | `pnpm test --run` | 150/150 passed |

**Rationale:** No API key, no sync server URL, `sync: 'never'` is the deliberate M007 configuration. The `createBrowserContext.js` code path confirms that with `sync.when === "never"`, zero WebSocket connections are attempted and the only peer is IDB. This is the correct state for M007 (local-only prototype).

---

## Forward Intelligence for M002

### (a) Come attivare il sync

Change `src/main.tsx` `<JazzProvider>` prop from:
```tsx
sync={{ when: "never" }}
```
to:
```tsx
sync={{ when: "signedUp", peer: import.meta.env.VITE_JAZZ_PEER_URL }}
```

Add `VITE_JAZZ_PEER_URL=wss://cloud.jazz.tools/?key=<API_KEY>` to `.env.local` (gitignored).  
**Never hardcode the sync peer URL** — it must be env-variable driven for local/staging/prod environments.

### (b) Primo handshake IDB → peer

Jazz's sync protocol on first connection with a remote peer:

1. Jazz node enumerates all locally-known CoValue IDs from IDB.
2. For each CoValue, it sends a `known` message to the remote peer declaring its current CRDT state vector.
3. The remote peer responds with any transactions the local node is missing (forward-sync) and requests any transactions the remote is missing (back-sync).
4. After the exchange, local IDB and remote peer are eventually consistent.
5. Subsequent mutations are streamed in real-time via the WebSocket.

**Implication for M002:** All CoValues created in M007 (Elementi, Board, Workspace) will be automatically uploaded on first connection — no migration script needed. The account-level key (stored in localStorage) is the identity anchor.

### (c) DemoAuth → PasskeyAuth migration path

| Aspect | DemoAuth | PasskeyAuth |
|---|---|---|
| Credential storage | `localStorage` (`demo-auth-existing-users`) | WebAuthn FIDO2 credential stored in OS keychain |
| Account creation | Automatic on first render | User gesture required (create passkey flow) |
| Account recovery | Copy/paste secret from localStorage | Platform authenticator (Face ID, Touch ID) |
| Multi-device | Manual secret export | Passkey sync via iCloud/Google Password Manager |
| API | `useDemoAuth(setErrors, existingUsers)` | `usePasskeyAuth(appName)` (jazz-react) |

**Migration steps for M002:**
1. Replace `useDemoAuth` with `usePasskeyAuth` in `src/app/auth-context.tsx`.
2. Remove `existingUsers` state and the DemoAuth "select user" UI.
3. Add a "Sign in with Passkey" button (triggers WebAuthn assertion) and a "Register" button (triggers WebAuthn credential creation).
4. Test account persistence: after passkey registration, reload → passkey re-asserts → same Jazz account ID.
5. **No schema changes needed** — account identity (`TimelineBoardAccount`) is independent of auth method. The CRDT data (Elementi, Boards) is anchored to the CoValue IDs, not the auth mechanism.
6. **Risk:** Existing DemoAuth accounts cannot be "migrated" to PasskeyAuth — they are different account identities. Recommend creating fresh accounts for M002 beta; document that M007 local data is not forward-migrated.

---

## Skills Discovered

None installed — standard Jazz + browser DevTools work, no specialist skill needed.

---

## Sources

- `node_modules/.pnpm/jazz-browser@0.14.28/node_modules/jazz-browser/dist/createBrowserContext.js` — sync:never code path, IDB setup, session locking
- `node_modules/.pnpm/jazz-browser@0.14.28/node_modules/jazz-browser/dist/auth/LocalStorageKVStore.js` — DemoAuth persistence
- `node_modules/.pnpm/cojson-storage-indexeddb@0.14.28/node_modules/cojson-storage-indexeddb/dist/` — IDB storage backend
- `src/main.tsx`, `src/app/auth-context.tsx`, `src/features/workspace/workspace.schema.ts` — live project configuration
