# Sub-Orchestrator E2E Task: Opaque-Box E2E Testing Suite

Scope: E2E Testing Track in `/Users/macos/ieee-smc-2027/PROJECT.md` and `ORIGINAL_REQUEST.md`.
Deliverables:
1. Create `TEST_INFRA.md` at project root covering test philosophy, feature inventory, test architecture, and coverage thresholds.
2. Implement E2E test harness and test suites across all 4 tiers:
   - Tier 1: Feature Coverage (>=5 test cases per feature for Website Builder, Analytics, User Management, Last Login, Profile Management)
   - Tier 2: Boundary & Corner Cases (empty states, invalid inputs, edge timestamps, unauthenticated access, unicode strings)
   - Tier 3: Cross-Feature Interactions (pairwise: user login -> last login update -> analytics visitor count; user profile edit -> sidebar greeting update; page create -> edit blocks -> save AST -> public page render)
   - Tier 4: Real-World Scenarios (Conference admin workflow: add reviewer, view analytics, publish conference program page)
3. Provide an executable test runner (e.g. `pnpm run test:e2e` or a dedicated test script `tests/e2e/runner.ts` / node script) that executes all test cases and reports results with exit code 0 on pass.
4. Publish `TEST_READY.md` at project root when complete.
