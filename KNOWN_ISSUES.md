# Known Issues

> **STATUS (2026-06-28): all previously-tracked issues are RESOLVED.** Both bugs below
> were fixed in **Gate 10 Phase A** — `supabase/setup.sql` now ships the **Mark IV
> smart trigger**, and the fix was **proven live** against the connected Supabase (a
> create-then-delete test). This file is retained as a **historical record** of what
> was wrong and how it was fixed. **There are no open issues.**
>
> Surfaced by the `stark-recon` report (Surprise #3), verified Gate 5, FIXED Gate 10
> Phase A (2026-06-28). See `agent_docs/RECON/RECON_starter-kit-v3_kit-hardening_2026-06-26.md`.

---

## ✅ RESOLVED — Issue 1: `profiles.full_name` was NULL at creation

**What was wrong:** the old `handle_new_user()` trigger read `raw_user_meta_data ->>
'name'`, but every writer writes `'full_name'` — so `profiles.full_name` landed NULL
at creation (the UI showed `"—"` until a manual profile edit).

**Fixed (Gate 10 Phase A):** the **Mark IV trigger** (`supabase/setup.sql`) reads
`->> 'full_name'` — the key the writers actually write. **Proven live 2026-06-28:** a
test user created with `{ full_name: 'Mark IV Test' }` → `profiles.full_name = 'Mark
IV Test'` (not null).

## ✅ RESOLVED — Issue 2: superadmin role-drop (was a 🔴 silent privilege bug)

**What was wrong:** the old trigger hard-coded `user_roles.role = 'member'` and ignored
the metadata role, so a UI-created "admin" was silently created as a **member**.

**Fixed (Gate 10 Phase A):** the **Mark IV trigger** reads + applies the metadata
`role` (defaulting to `'member'` only when absent) — no separate `user_roles` update
needed. **Proven live 2026-06-28:** a test user created with `{ role: 'admin' }` →
`user_roles.role = 'admin'` (not downgraded).

> The writers already wrote `full_name` + `role`; the old dumb trigger just ignored
> them. Mark IV makes writers + trigger agree. **Doctrine still holds:** superadmins
> are created in the Supabase **console only** (console-only) — the kit offers no
> app-side superadmin-creation surface.

---

## Reference — 2nd-step role pattern (no longer needed; kept for reference)

Before Mark IV, the only correct role-setter was a `user_roles.update({ role })` second
step (it lived in the now-removed `superadmin-add-user` fossil route, deleted Gate 6).
With Mark IV the trigger honors the metadata role directly, so this is **not needed**.
Kept only as a reference for projects that want app-side role-setting for the lower
roles (admin/member):

```js
const { error } = await adminClient
  .from("user_roles")
  .update({ role })
  .eq("user_id", newUserId);
```
