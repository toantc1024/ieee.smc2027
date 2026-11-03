# Test Writer E2E Task: Comprehensive Opaque-Box E2E Test Suite

Scope: Dual Track E2E Testing for IEEE SMC 2027 Portal Modernization
Target Files: `TEST_INFRA.md`, `tests/e2e/**`, `TEST_READY.md`

Input documents:
- `/Users/macos/ieee-smc-2027/.agents/teamwork/ORIGINAL_REQUEST.md`
- `/Users/macos/ieee-smc-2027/PROJECT.md`

Mandatory Requirements:
1. Design opaque-box test suite independent of implementation design.
2. Follow 4-tier methodology:
   - Tier 1: Feature Coverage (>=5 test cases per feature across Page Editor, Analytics, User Management, Profile Management, Last Login)
   - Tier 2: Boundary & Corner Cases (>=5 test cases per feature covering edge cases, unauthenticated states, invalid inputs, null/empty states)
   - Tier 3: Cross-Feature Combinations (pairwise interactions: user auth -> last login update; profile update -> sidebar greeting; page save -> public render)
   - Tier 4: Real-World Scenarios (realistic end-to-end conference management workflows)
3. Write runnable test runner (e.g., node / ts-node or vitest/playwright script in `tests/e2e/`) that executes cleanly with exit code 0.
4. Create `TEST_INFRA.md` and publish `TEST_READY.md` at project root.
