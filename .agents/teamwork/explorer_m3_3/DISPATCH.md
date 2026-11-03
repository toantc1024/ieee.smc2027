# DISPATCH — Explorer M3-3 (21 Conference Section Registry & Public Dynamic Page Renderer)
Date: 2026-11-02T15:40:00Z

## Mission
Investigate and design the Block Registry containing all 21 IEEE SMC 2027 conference sections, mapping them to the builder canvas and public dynamic page renderer (`/app/[slug]/page.tsx`).

## Source of Truth Paths
- Reference Sections: `/Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/modules/website-builder/blocks/`
- Target Sections: `/Users/macos/ieee-smc-2027/src/modules/website-builder/registry/`
- Existing Target Landing/Section Components: `/Users/macos/ieee-smc-2027/src/components/` and `/Users/macos/ieee-smc-2027/src/app/`
- Public Page Rendering: `/Users/macos/ieee-smc-2027/src/app/(public)/[slug]/` or equivalent public routes
- E2E Tests: `/Users/macos/ieee-smc-2027/tests/e2e/tier1-feature-coverage/page-builder.test.ts`
- Original Request: `/Users/macos/ieee-smc-2027/.agents/teamwork/ORIGINAL_REQUEST.md`

## Key Questions to Answer
1. **21 Conference Section Blocks**: List all 21 conference section block definitions:
   - HeroCarousel, CallForPapers, KeynoteSpeakersSection, CommitteesSection, ConferenceTracksSection, ImportantDatesSection, RegistrationFeesSection, VenueLocationSection, ScheduleTimelineSection, SponsorshipSection, WorkshopTutorialSection, PaperSubmissionGuidelinesSection, AwardsSection, TravelAccommodationSection, ContactSupportSection, FaqAccordionSection, PastConferencesSection, MediaGallerySection, VisaInformationSection, HeaderSection, FooterSection.
   - For each block: What is its type string, category, icon, default props, and property inspector schema?
2. **Public Dynamic Page Renderer**: How does the public renderer fetch page AST from Prisma by slug (`/api/pages/[slug]` or server component `prisma.page.findUnique({ where: { slug, isPublished: true } })`) and render the block list safely?
3. **Seam Dropzones & Drag-and-Drop Interaction**: How are drop zones between blocks, insertion indicators, and drag-and-drop operations handled?
4. **User Constraints**: Verify 0 sparkle icons, clean English terminology, Next.js 16 App Router compliance.

Deliver your detailed report to `/Users/macos/ieee-smc-2027/.agents/teamwork/explorer_m3_3/handoff.md` and send a message when done.

## 2026-11-02T15:40:34Z
Task dispatch received: Block Registry for all 21 IEEE SMC 2027 conference sections, public dynamic page renderer, seam dropzones & drag-and-drop mechanics.
