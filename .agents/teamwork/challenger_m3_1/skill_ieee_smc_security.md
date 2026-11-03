# IEEE SMC 2027 Security Standard & Auth Architecture (Local Copy)
Source: /Users/macos/ieee-smc-2027/.agents/skills/ieee-smc-security/SKILL.md

This skill defines the security requirements, secret handling rules, storage isolation, and authentication workflows for the **IEEE SMC 2027** conference management platform.

### API Route Protection:
- Every `/api/admin/*` handler must verify `verifySessionToken()` and confirm `user.role === "ADMIN"`.
- Return `401 Unauthorized` or `403 Forbidden` if missing or invalid.

### Public Draft Isolation:
- Draft or unpublished pages must never leak via public routes to anonymous users.
