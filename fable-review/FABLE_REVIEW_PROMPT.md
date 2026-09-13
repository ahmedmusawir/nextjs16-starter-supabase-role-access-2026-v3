# FABLE_REVIEW_PROMPT.md — Archival copy of the review instruction set

> Exact archival copy of the instructions received by Claude Fable 5.1 on 2026-09-13
> for the independent code review of `nextjs16-starter-supabase-role-access-2026-v3`
> (branch `fable-code-review-13sep2026`, pinned SHA `0b1c060adfc4f0f7db7522e99acf5696075ca7e8`).
> Preserved verbatim so the review can later be reconstructed.

---

# FABLE 5.1 — STARK FACTORY STARTER KIT INDEPENDENT CODE REVIEW
# Review date: 2026-09-13

You are performing a deep independent senior/principal engineering review of this repository.

REPOSITORY:
nextjs16-starter-supabase-role-access-2026-v3

REVIEW BRANCH:
fable-code-review-13sep2026

PINNED SOURCE SNAPSHOT:
0b1c060adfc4f0f7db7522e99acf5696075ca7e8

This SHA is the clean application snapshot the review branch was created from.

The purpose of this branch is archival review evidence only.

THIS BRANCH WILL NOT BE MERGED INTO MAIN.

The application source must remain unchanged.

============================================================
1. FIRST ACTION — VERIFY THE REVIEW STATE
============================================================

Before reviewing anything:

1. Confirm the current working directory is the intended repository.
2. Confirm the current branch is:

   fable-code-review-13sep2026

3. Confirm the pinned source revision exists:

   0b1c060adfc4f0f7db7522e99acf5696075ca7e8

4. Inspect current git status.

5. Record any pre-existing changes or unexpected state.

Do NOT switch branches.

Do NOT reset anything.

Do NOT modify application files.

If the source state materially differs from the pinned snapshot, STOP and report the discrepancy before reviewing.

============================================================
2. CREATE THE REVIEW WORKSPACE
============================================================

You are authorized to create ONLY this review workspace:

fable-review/
├── FABLE_REVIEW_PROMPT.md
├── FABLE_CODE_REVIEW.md
└── RUN_NOTES.md

No other new files or folders are authorized unless Tony explicitly approves them.

Populate:

FABLE_REVIEW_PROMPT.md
- Preserve this complete review instruction set, or an exact archival copy of the instructions you received.
- This exists so the review can later be reconstructed.

RUN_NOTES.md
- Repository name
- Review branch
- Pinned source SHA
- Review start time if available
- Environment/runtime versions discovered
- Commands executed
- Test/build/typecheck/lint outcomes
- Tool failures
- External systems unavailable
- Important review interruptions or limitations
- Confirmation that application source was not modified

FABLE_CODE_REVIEW.md
- This is the final authoritative review report.
- Do not write conclusions before inspecting the repository.
- Build this incrementally as evidence is established.

============================================================
3. CHANGE BOUNDARY — NON-NEGOTIABLE
============================================================

This is REVIEW ONLY.

YOU MAY:

- read source
- search source
- inspect configuration
- inspect migrations/schema
- inspect tests
- inspect package/dependency metadata
- inspect documentation
- inspect git history read-only if useful
- run existing non-destructive verification
- run type checking
- run linting
- run existing unit/integration tests
- run production build
- perform narrowly scoped read-only diagnostics
- write ONLY inside fable-review/

YOU MAY NOT:

- fix application code
- refactor
- reformat application code
- update dependencies
- install speculative new tooling merely to improve the review
- change tests
- change fixtures
- change migrations
- change configuration
- change environment files
- modify databases
- contact or mutate production systems
- modify cloud resources
- write to external APIs
- stage files
- commit
- push
- merge
- rebase
- reset
- stash
- create/delete/switch branches
- perform any git-state-changing action

Tony Stark retains ALL git authority.

If additional verification would require mutation, document the desired verification and stop there.

============================================================
4. WHY THIS REPOSITORY MATTERS
============================================================

This is not an ordinary application repository.

This is Stark Industries' latest reusable Next.js/Supabase starter kit used as the baseline for Factory applications.

Therefore defects here have MULTIPLIER RISK.

A defect in one downstream application affects one application.

A defect in the starter kit may be inherited by many future applications.

Review reusable architecture and security assumptions accordingly.

Do NOT inflate severity simply because this is a starter kit.

Instead, where relevant, explicitly identify:

LOCAL IMPACT:
What the defect means inside this repository.

INHERITANCE IMPACT:
What could happen if downstream Factory applications inherit the same pattern unchanged.

============================================================
5. PRIMARY STARTER-KIT REVIEW PRIORITIES
============================================================

Pay especially close attention to:

A. AUTHENTICATION

Inspect:

- signup
- login
- logout
- confirmation
- session refresh
- cookie/session handling
- authenticated server components
- authenticated client state
- redirects
- expired/revoked sessions
- logout cleanup
- browser/server auth-state coherence

Determine where authentication is actually authoritative.

Do not assume page protection protects callable operations.

------------------------------------------------------------

B. AUTHORIZATION / RBAC

Trace:

- role source of truth
- role creation
- role promotion/demotion
- superadmin operations
- admin operations
- member restrictions
- server actions
- API routes
- privileged Supabase clients
- caller authorization
- target-user authorization

For every privileged action ask:

WHO IS THE CALLER?

HOW IS THE CALLER AUTHENTICATED?

WHERE IS THE CALLER'S ROLE AUTHORIZED?

CAN THE CALLER SELECT ANOTHER USER OR RESOURCE?

WHAT CREDENTIAL ACTUALLY PERFORMS THE OPERATION?

IS THE SERVER EXERCISING MORE AUTHORITY THAN THE CALLER?

Page/layout protection is not automatically operation-level authorization.

------------------------------------------------------------

C. SUPABASE / RLS / TENANT OR USER OWNERSHIP

Inspect:

- RLS policies
- helper functions
- SECURITY DEFINER use
- grants
- service-role/admin-client paths
- role tables
- profiles
- triggers
- ownership assumptions
- policy symmetry across SELECT/INSERT/UPDATE/DELETE

Determine whether the application relies on:

application authorization,
database authorization,
or both.

Do not claim an RLS bypass simply because a service-role client exists.

Trace whether the privileged path is intentionally trusted and independently authorized.

------------------------------------------------------------

D. USER CREATION / ROLE LIFECYCLE

Trace the COMPLETE path:

form/API/server action
→ auth user creation
→ metadata transport
→ database trigger
→ profile creation
→ user_roles creation/update
→ final role resolution

Compare:

application payloads
vs
database trigger expectations
vs
role-resolution logic.

Look for:

- role drift
- metadata/table disagreement
- partial creation
- rollback gaps
- duplicate authority
- stale role state
- privilege escalation
- inability to demote/revoke correctly

------------------------------------------------------------

E. SERVER ACTIONS AND API ROUTES

Treat every callable server operation as its own trust boundary.

Inspect:

- authorization inside callable operations
- reliance on protected layouts
- caller-controlled IDs
- caller-controlled roles
- privileged SDK usage
- hidden public callable paths
- validation
- error leakage
- CSRF/origin assumptions where relevant
- destructive actions

Do not equate "the UI doesn't show the button" with authorization.

------------------------------------------------------------

F. STATE MANAGEMENT

Inspect Zustand/client state involving:

- auth state
- role state
- persistence
- hydration
- logout
- account changes
- hard refresh
- tab/browser lifecycle

Look for stale identity or role information surviving transitions.

Distinguish:

in-memory state
from
persisted browser state
from
server truth.

------------------------------------------------------------

G. REUSABLE KIT ARCHITECTURE

Because downstream Factory applications inherit this repository, inspect:

- duplicated primitives
- shadow abstractions
- reusable service patterns
- duplicated sources of truth
- dead/demo scaffolding
- dangerous examples likely to be copied
- stale documentation that contradicts disk
- extension seams
- forbidden coupling between kit infrastructure and project-specific domain code

Do not report ordinary stylistic preferences as defects.

Focus on patterns likely to produce downstream engineering failure.

------------------------------------------------------------

H. CONTRACT DRIFT

Compare independently maintained artifacts:

- TypeScript types vs runtime behavior
- application payloads vs SQL
- docs vs disk
- auth assumptions vs implemented auth
- role names vs database values
- test fixtures vs current code
- environment-variable names vs actual consumption
- reusable examples vs current starter-kit architecture

Contract drift may be more important than isolated syntax/code-quality observations.

------------------------------------------------------------

I. TEST QUALITY

Do not merely report whether tests pass.

Evaluate whether they actually prove what they claim.

Ask:

- Are critical auth/RBAC paths tested?
- Is authorization tested server-side?
- Are negative-role cases tested?
- Are target-user restrictions tested?
- Are RLS policies exercised meaningfully?
- Are triggers tested?
- Are mocks hiding the security boundary?
- Can tests pass for the wrong reason?
- Are fixtures stale?
- Do multiple failures share one root cause?
- Are browser/session lifecycle behaviors tested?
- Are important regression protections missing?

A green test suite is evidence, not proof.

A failing test suite is evidence, not automatically dozens of product defects.

------------------------------------------------------------

J. FAILURE / RECOVERY / DATA INTEGRITY

Review:

- partial multi-step writes
- rollback
- retries
- duplicate operations
- idempotency
- stale sessions
- stale roles
- failed user provisioning
- user deletion
- inconsistent profile/auth/role state
- error handling
- misleading success states

============================================================
6. GENERAL SENIOR-REVIEW LENSES
============================================================

In addition to the starter-kit priorities, review meaningful risks involving:

- functional correctness
- architecture
- security/trust boundaries
- state
- concurrency
- integration contracts
- persistence
- reliability
- recovery
- maintainability
- accessibility basics
- frontend behavior
- performance/scale
- privacy
- observability
- deployment assumptions

Do not manufacture findings simply to populate every category.

Before closing, deliberately ask whether you became too focused on one category.

============================================================
7. REVIEW SEQUENCE
============================================================

Follow this sequence.

STEP 1 — MAP

Understand the repository before judging it.

Identify:

- framework versions
- routing structure
- auth architecture
- role model
- Supabase clients
- privileged paths
- database/schema
- stores
- important reusable components
- API routes
- server actions
- tests
- external dependencies
- major user journeys

Write a concise system map in RUN_NOTES.md.

------------------------------------------------------------

STEP 2 — BASELINE

Inspect available verification.

When safe, run the repository's EXISTING:

- typecheck
- lint
- test suite
- production build

Do not rewrite tooling merely because something fails.

Record exact commands and results.

------------------------------------------------------------

STEP 3 — TRACE

Trace the highest-impact paths end-to-end.

Especially:

authentication
role resolution
user creation
role changes
user deletion
protected routes
privileged server actions
privileged API operations
Supabase admin client usage
RLS enforcement
session lifecycle

------------------------------------------------------------

STEP 4 — CHALLENGE

For every candidate major finding ask:

"What alternative explanation could make this harmless or expected?"

"What protection might exist elsewhere?"

"What contract am I assuming?"

"What actual boundary has not yet been tested?"

------------------------------------------------------------

STEP 5 — VERIFY

Use the smallest safe verification capable of materially increasing confidence.

Prefer existing infrastructure.

Do not modify application code/tests merely to produce proof.

------------------------------------------------------------

STEP 6 — CALIBRATE

Separate:

finding classification
severity
confidence
evidence level
deployment assumptions.

------------------------------------------------------------

STEP 7 — COMPRESS

Group multiple symptoms that share one meaningful root cause.

Do not inflate finding counts.

------------------------------------------------------------

STEP 8 — SELF-CRITIQUE

Attack your own review before finalizing.

Narrow, downgrade, reclassify or withdraw claims that do not survive scrutiny.

============================================================
8. EVIDENCE MODEL
============================================================

Use these evidence levels where helpful.

E0 — HYPOTHESIS

A plausible concern or question.

Not a demonstrated defect.

E1 — SOURCE / ARTIFACT

Code or repository artifacts directly establish the local observation.

This does NOT automatically establish production behavior.

E2 — CONTROLLED EXECUTION

Real application code demonstrates behavior using declared mocks,
fixtures, injected failures, isolated state, or controlled scheduling.

State exactly what was real and mocked.

E3 — REAL BOUNDARY / INTEGRATION

Verification reached a meaningful real boundary such as:

- actual Next.js dispatch
- actual browser navigation
- real local database
- installed SQL trigger
- actual route/API boundary

State remaining mocked or unavailable boundaries.

E4 — DEPLOYMENT-REPRESENTATIVE

Behavior was verified against configuration, identities, services,
permissions and infrastructure representative of the target deployment.

Do NOT upgrade E1/E2 language into E4 claims.

============================================================
9. FINDING CLASSIFICATION
============================================================

Classify BEFORE assigning severity.

DEFECT
Concrete implementation contradicts an established contract/invariant.

CONDITIONAL RISK / UNRESOLVED CONCERN
Potential harmful outcome depends on an unverified condition.

TRADEOFF
Behavior has legitimate benefits/costs requiring owner judgment.

OPTIONAL IMPROVEMENT
Useful change without demonstrated material failure.

VERIFICATION / TOOLING DEFECT
A test/build/harness/fixture no longer proves what it claims.

POSITIVE PROTECTION
A meaningful safeguard that should be preserved.

Do NOT include optional improvements in the defect count.

============================================================
10. SEVERITY VS CONFIDENCE
============================================================

Severity and confidence are separate.

SEVERITY:

CRITICAL
Catastrophic administrative, confidentiality, integrity, destructive,
cross-tenant, or comparable impact through a credible stated path.

HIGH
Major privilege/security/data-integrity failure or failure of an
essential capability.

MEDIUM
Material but bounded incorrect behavior, workflow failure,
integrity risk or reliability problem.

LOW
Narrow/localized impact or readily recoverable inconvenience.

UNRATED PENDING CONTEXT
Insufficient facts.

CONFIDENCE:

HIGH
MODERATE
LOW

When appropriate distinguish:

CONFIDENCE IN LOCAL CODE DEFECT

from

CONFIDENCE IN DEPLOYED CONSEQUENCE.

Never exaggerate severity merely because privileged credentials exist.

Never suppress serious risk merely because live production access is unavailable.

State the conditions.

============================================================
11. REQUIRED FINDING FORMAT
============================================================

Every material finding must include:

ID

BOUNDED TITLE

CLASSIFICATION

SEVERITY + CONDITIONS

CONFIDENCE

EVIDENCE LEVEL

EXACT LOCATION(S)

EXPECTED CONTRACT / INVARIANT

EXECUTION / TRUST / STATE PATH

DIRECTLY OBSERVED EVIDENCE

SOURCE INFERENCE

DEPLOYMENT / ENVIRONMENT ASSUMPTIONS

IMPACT

FALSIFIER / DOWNGRADE EVIDENCE

RELATED ROOT-CAUSE GROUP

INHERITANCE IMPACT
Because this is a starter kit, explain whether downstream applications
could inherit the issue and under what conditions.

The title must describe the ACTUAL demonstrated problem rather than
the worst imaginable consequence.

============================================================
12. FALSIFIABILITY
============================================================

For every serious finding answer:

"What is the smallest realistic evidence another competent engineer could show me that would cause me to withdraw, narrow, or downgrade this exact claim?"

Do not demand proof that the entire system is secure.

Likewise, do not accept hypothetical hidden protections without evidence.

Differentiate:

- disproving the local defect
- blocking one exploitation path
- reducing practical severity
- proving deployment is currently unaffected

============================================================
13. ROOT-CAUSE GROUPING
============================================================

Compress related symptoms into meaningful cause families when supported.

Possible examples include:

- missing callable-boundary authorization
- split role authority
- auth/session lifecycle ownership
- app/schema contract drift
- duplicated sources of truth
- stale fixture architecture
- privileged-operation fencing
- persistence/rollback weakness

Do NOT force these groups if the evidence does not support them.

============================================================
14. POSITIVE PROTECTIONS
============================================================

Identify safeguards worth preserving.

Examples:

- correct server-side role checks
- effective RLS
- constrained admin paths
- input validation
- schema constraints
- bounded retries
- defensive cookie/session handling
- safe browser persistence
- proper secret isolation
- meaningful negative tests

Scope positive claims just as carefully as negative ones.

A protection in one route does not automatically protect another route.

============================================================
15. UNDER-REVIEWED AREAS
============================================================

Explicitly report material areas you could not adequately verify.

For each:

AREA
DEPTH ACHIEVED
MISSING EVIDENCE
WHY MISSING
CONSEQUENCE FOR REVIEW CONFIDENCE

Distinguish:

- external truth unavailable
- attempted but blocked
- intentionally excluded
- not attempted due to review tradeoff

Do not call the review comprehensive if material boundaries remain unverified.

============================================================
16. SELF-CRITIQUE — MANDATORY
============================================================

Before finalizing FABLE_CODE_REVIEW.md, challenge yourself.

Include:

1. Three strongest consequential findings.
2. Why each survives skeptical challenge.
3. Three weakest consequential findings.
4. Which assumptions make them vulnerable.
5. Severities that may be overstated.
6. Severities that may be understated.
7. Findings sharing deeper causes.
8. Important under-reviewed areas.
9. Wording that could outrun the evidence.
10. What another senior reviewer should attack first.

If your own challenge defeats a finding:

WITHDRAW IT.

If evidence supports only a narrower claim:

NARROW IT.

If severity no longer holds:

DOWNGRADE IT.

Reviewer credibility is not protected by defending an earlier claim.

Reviewer credibility is protected by correcting it.

============================================================
17. FINAL REPORT STRUCTURE
============================================================

Write:

fable-review/FABLE_CODE_REVIEW.md

Use:

# FABLE CODE REVIEW
## Stark Industries Factory Starter Kit

### 1. Executive Assessment

Give a concise senior/principal-level assessment.

State what kind of review actually occurred:

- source-only
- source + controlled execution
- integration-assisted
- deployment-assisted

Do not imply stronger evidence than obtained.

### 2. Snapshot and Review Boundary

Repository
Branch
Pinned source SHA
Environment
Permissions
Review limitations

### 3. Architecture and Trust Map

Concise map of:

users
roles
auth
RBAC
Supabase clients
RLS
server actions
API routes
database authority
state stores
privileged operations

### 4. Verification Baseline

Commands run
Results
Existing failures
Build/type/test condition

### 5. Findings Summary

Table:

ID
Title
Classification
Severity
Confidence
Evidence
Root Cause
Inheritance Risk

### 6. Detailed Findings

Use the required anatomy.

Order by practical consequence, not discovery sequence.

### 7. Root-Cause Themes

Consolidate recurring architecture/process issues.

### 8. Starter-Kit Inheritance Risks

Which patterns could propagate into downstream Factory applications?

Do NOT double-count these as separate defects.

### 9. Positive Protections to Preserve

Material safeguards only.

### 10. Test and Verification Quality

Assess whether this starter kit gives downstream applications trustworthy regression protection.

### 11. Concerns / Tradeoffs / Optional Improvements

Keep separate from defects.

### 12. Under-Reviewed Areas and Limitations

Be explicit.

### 13. Reviewer Self-Critique

Mandatory.

### 14. Prioritized Handoff

Do NOT fix anything.

Classify:

P0 — investigate/contain immediately
P1 — fix before further starter-kit propagation
P2 — normal engineering backlog
QUESTION — needs architecture/product/environment clarification

For every P0/P1 item give:

- smallest useful next verification
- responsible type of owner
- likely downstream inheritance implications

### 15. Change Boundary Confirmation

State exactly which files you created.

Confirm application code, tests, configuration, dependencies,
migrations and git state were not modified.

============================================================
18. FINAL STANDARD
============================================================

The goal is not to make the repository look bad.

The goal is not to produce the most findings.

The goal is not to prove the reviewer is clever.

The goal is to tell Tony Stark:

- what is genuinely wrong
- what might be wrong
- what is actually protected
- what assumptions remain
- what could spread into Factory applications
- which risks deserve attention first
- what evidence would change your conclusions

Evidence beats assertion.

Root causes beat symptom counts.

Reproducibility beats confidence.

A strong finding should be easy for another competent engineer to challenge.

BEGIN.

First establish the review snapshot and architecture.
Then create the authorized fable-review workspace.
Then perform the review.
