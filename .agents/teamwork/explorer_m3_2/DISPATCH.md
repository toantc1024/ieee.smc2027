# DISPATCH — Explorer M3-2 (Tri-Panel Studio Architecture, Canvas Auto-Fitting & Store)
Date: 2026-11-02T15:40:00Z

## Mission
Investigate the reference HCMUTE visual builder studio engine (`modules/website-builder/` and `app/manage/pages/[id]/`) and design the tri-panel studio editor, Zustand state store, Figma-ratio canvas auto-fitting, history diff, and top/sub-toolbar controls for IEEE SMC 2027.

## Source of Truth Paths
- Reference Studio: `/Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/modules/website-builder/`
- Reference Page Edit: `/Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/app/manage/pages/[id]/`
- Target Studio: `/Users/macos/ieee-smc-2027/src/modules/website-builder/`
- Target Page Edit: `/Users/macos/ieee-smc-2027/src/app/admin/(dashboard)/pages/[id]/`
- Original Request: `/Users/macos/ieee-smc-2027/.agents/teamwork/ORIGINAL_REQUEST.md`

## Key Questions to Answer
1. **Tri-Panel Layout**: Exactly how are the 308px left block drawer, fluid center canvas, and 295px right property inspector constructed? What tabs exist on the right panel (Content, Styles, JSON)?
2. **State Store (`useBuilderStore`)**: What state slices exist (blocks AST, selectedBlockId, history/undo/redo stack, viewport device, zoom level, dirty state, saving state)?
3. **Canvas Auto-Fitting**: How does the auto-fitting algorithm scale Desktop (1240px), Tablet (768px), and Mobile (390px) viewports with counter-scaled floating action pills and seam dropzones?
4. **Top Bar & Sub-Toolbar Controls**: How are viewport switcher, zoom presets (Fit, 50%, 75%, 100%, 125%), undo/redo, paste, preview modal, save (Ctrl+S / Cmd+S), and publish/unpublish wired?
5. **Auxiliary Modals & Tabs**: How are the Info tab (SEO scoring 0-100, social preview card), History tab (version diffing & rollback), and SyncTranslateModal structured?
6. **User Constraints**: Verify 0 sparkle icons, clean English terminology, Next.js 16 Suspense requirements.

Deliver your detailed report to `/Users/macos/ieee-smc-2027/.agents/teamwork/explorer_m3_2/handoff.md` and send a message when done.
