Implement production-ready page builder, analytics, user management, last login, and profile management modules for the IEEE SMC 2027 website, matching the feature set, controls, and button layout of the reference HCMUTE website frontend.

Working directory: /Users/macos/ieee-smc-2027
Integrity mode: development

Reference material: /Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/

## Requirements

### R1. Page Editor / Page Builder Module
Port and integrate the page builder module from the reference project (`/Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/modules/website-builder/`) into the IEEE SMC 2027 project. The page editor UI, button layout, action controls, and builder capabilities must match the reference HCMUTE frontend.

### R2. Analytics Module
Port and integrate the analytics module from the reference project (`/Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/modules/analytics/`), providing the analytics dashboard views, reporting controls, and tracking functionality present in the reference.

### R3. User Management, Last Login, and Profile Management
Port and integrate user management, profile management, and last login tracking from the reference project (`/Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/modules/user/` and auth modules), ensuring complete feature parity and matching UI controls.

### R4. Project Integration and Build Standards
Integrate all ported modules into the IEEE SMC 2027 project routing, layout, and shared component system. The code must adhere to existing project standards (clean styling, Next.js architecture) without using sparkle icons.

## Acceptance Criteria

### Page Editor / Page Builder
- [ ] The page builder module is integrated and functional, with button positions, controls, and editor tools matching the reference implementation.
- [ ] Page creation, editing, block manipulation, and saving operate reliably without regressions.

### Analytics & User Modules
- [ ] Analytics dashboard views and metrics render accurately with feature parity to the reference frontend.
- [ ] User management lists, profile management views, and last login tracking are functional and match the reference module controls.

### Build and Verification
- [ ] Project builds successfully (`pnpm run build` or equivalent) with zero TypeScript or lint errors.
- [ ] All ported module routes load cleanly without runtime exceptions or missing dependencies.
