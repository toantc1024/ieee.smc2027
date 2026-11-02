/**
 * Test Fixtures & Sample Payloads for E2E Tests
 */

import { E2E_CONFIG } from "../config";

export interface PageBlockFixture {
  id: string;
  type: string;
  props: Record<string, any>;
  hidden?: boolean;
}

export const sampleBlocks: Record<string, PageBlockFixture> = {
  hero: {
    id: "hero-test-1",
    type: "HeroCarousel",
    props: { autoplayDuration: 5 },
    hidden: false,
  },
  cfp: {
    id: "cfp-test-1",
    type: "CallForPapers",
    props: {
      title: "Call for Contributed Papers & Workshop Proposals",
      deadline: "2027-04-15",
    },
    hidden: false,
  },
  dates: {
    id: "dates-test-1",
    type: "ImportantDates",
    props: {
      badge: "Critical Milestones",
    },
    hidden: false,
  },
  committees: {
    id: "committees-test-1",
    type: "CommitteesSection",
    props: {
      title: "Organizing & Technical Committees",
      subtitle: "Distinguished leadership driving IEEE SMC 2027",
    },
    hidden: false,
  },
  keynotes: {
    id: "keynotes-test-1",
    type: "Keynotes",
    props: {
      title: "Plenary Keynote Speakers",
    },
    hidden: false,
  },
};

export function createTestPagePayload(customSlug?: string, customTitle?: string) {
  const timestamp = Date.now();
  const slug = customSlug || `${E2E_CONFIG.testResourcePrefix}page-${timestamp}`;
  const title = customTitle || `E2E Test Page ${timestamp}`;

  return {
    id: slug,
    slug,
    title,
    blocks: [sampleBlocks.hero, sampleBlocks.cfp, sampleBlocks.dates],
    meta_title: `IEEE SMC 2027 | ${title}`,
    meta_description: "Automated E2E Test Conference Page",
    is_published: true,
  };
}

export function createTestUserPayload(role: "ADMIN" | "USER" = "USER", customEmail?: string) {
  const timestamp = Date.now();
  const email = customEmail || `test_e2e_${timestamp}@test-smc.org`;

  return {
    email,
    name: `E2E Test User ${timestamp}`,
    role,
    password: "TestPassword123!",
    profileData: {
      affiliation: "IEEE SMC Society Automation Lab",
      country: "Vietnam",
      title: "Reviewer & Delegate",
      conferenceTrack: "SUBMITTER",
    },
  };
}
