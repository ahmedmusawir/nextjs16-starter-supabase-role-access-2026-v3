# Known Issues

> Recorded during the Starter Kit v3 "Kit Perfection" hardening campaign (Gate 5,
> 2026-06-26). These are **deliberately NOT fixed in the kit**: the DB trigger is
> backend state (applied per Supabase instance, not kit-shippable), and the portals
> are proof-of-concept that get rewritten in a real app. **Fix these when wiring a
> REAL Supabase backend / real RBAC model.**
>
> Surfaced by the `stark-recon` report (Surprise #3) and verified in Gate 5. See
> `agent_docs/RECON/RECON_starter-kit-v3_kit-hardening_2026-06-26.md`.

---

## Known Issue 1 — `profiles.full_name` NULL at creation

**Root cause:** the trigger `handle_new_user()` (`supabase/setup.sql`) reads
`raw_user_meta_data ->> 'name'`, but **every user-creation writer writes the key
`'full_name'`** (or nothing):

- signup — `src/app/api/auth/signup/route.ts` → `options.data.full_name`
- admin `addMember` — `src/app/(admin)/admin-portal/actions.ts` → `user_metadata.full_name`
- superadmin `addUser` (live) — `src/app/(superadmin)/superadmin-portal/actions.ts` → `user_metadata.full_name`
- `/api/auth/superadmin-add-user` route — dead fossil; writes no metadata at all

**Effect:** every new user's `profiles.full_name` is **NULL at creation**. No
creation path patches it afterward; it's only populated later if someone edits the
profile (`editUser` / `ProfileForm`). The UI shows `"—"` until then. Real and
universal, but recoverable by a manual edit.

**Prescribed fix (real-project time):** align the key. Recommended canonical key is
**`'full_name'`** — it matches the `profiles.full_name` column, `editUser`, and
`ProfileForm`. Either fix the trigger to read `'full_name'`, OR change all writers
to `'name'`. The **trigger is the better single-point fix** (one place vs. many
writers), BUT it lives in backend SQL → must be applied per Supabase instance.

## Known Issue 2 — superadmin role-drop (🔴 silent privilege bug)

**Root cause:** the trigger hard-codes `user_roles.role = 'member'` and ignores any
metadata role. The live superadmin `addUser` writes `role: formData.role` into
`user_metadata` → the trigger **discards it** → a UI-created **"admin" is silently
created as a MEMBER**. No error is shown.

The only path that correctly sets the role is the **fossil** route
`/api/auth/superadmin-add-user` (it does a `user_roles.update({ role })` second
step) — but that route is unreferenced/dead. Unit tests mock `createUser`, so they
assert the metadata payload shape, not the real trigger outcome → they don't catch
it.

**Prescribed fix (real-project time):** either the trigger reads + applies the
metadata role, OR each live creation path does a `user_roles` second-step update
after `createUser`. Decide with the real RBAC model.
