"use client";

import { Calendar, FileText, Users, CreditCard, Clock, BarChart3 } from "lucide-react";
import type { ComponentDefinition, FieldDefinition } from "../types";
import { ConferenceScheduleBlock } from "./hcmute-academic/conference-schedule-block";
import { CallForPapersBlock } from "./hcmute-academic/call-for-papers-block";
import { KeynoteSpeakersBlock } from "./hcmute-academic/keynote-speakers-block";
import { RegistrationPricingBlock } from "./hcmute-academic/registration-pricing-block";
import { TimelineMilestonesBlock } from "./hcmute-academic/timeline-milestones-block";
import { StatsChartBlock } from "./hcmute-academic/stats-chart-block";

const text = (label: string): FieldDefinition => ({ type: "text", label });
const textarea = (label: string): FieldDefinition => ({ type: "textarea", label });
const image = (label: string): FieldDefinition => ({ type: "image", label });
const select = (label: string, options: [string, string][]): FieldDefinition => ({ type: "select", label, options: options.map(([value, label]) => ({ value, label })) });
const array = (label: string, itemLabel: string, itemFields: Record<string, FieldDefinition>): FieldDefinition => ({ type: "array", label, itemLabel, itemFields });
const heading = { sectionTitle: text("Section title"), sectionSubtitle: textarea("Section description") };

export const HCMUTE_ACADEMIC_BLOCKS: Record<string, ComponentDefinition> = {
  "Conference/Schedule": {
    type: "Conference/Schedule", label: "Conference schedule", category: "program", icon: Calendar,
    description: "Organize sessions by day and track.",
    fields: { ...heading, days: { ...text("Days"), description: "Separate days with commas." }, sessions: array("Sessions", "session", {
      dayIndex: { type: "number", label: "Day index (first day is 0)", min: 0 }, time: text("Time"),
      type: select("Session type", [["keynote", "Keynote"], ["session", "Session"], ["panel", "Panel"], ["break", "Break"], ["ceremony", "Ceremony"]]),
      title: text("Session title"), speaker: text("Speaker"), speakerAffiliation: text("Speaker affiliation"), speakerAvatar: image("Speaker image"), chair: text("Session chair"), room: text("Room or meeting link"), track: text("Track"), description: textarea("Description"),
    }) },
    defaultProps: { sectionTitle: "Conference schedule", sectionSubtitle: "", days: "", sessions: [] }, render: ConferenceScheduleBlock,
  },
  "Conference/CallForPapers": {
    type: "Conference/CallForPapers", label: "Call for papers", category: "academic", icon: FileText,
    description: "Show submission links, deadlines and research topics.",
    fields: { sectionTitle: text("Section title"), conferenceName: text("Conference name"), scopeDescription: textarea("Scope and description"), submissionUrl: text("Submission URL"), templateWordUrl: text("Word template URL"), templateLatexUrl: text("LaTeX template URL"), indexingBadges: { ...text("Indexing badges"), description: "Separate badges with commas." },
      deadlines: array("Deadlines", "deadline", { title: text("Title"), date: text("Date"), highlight: { type: "switch", label: "Highlight deadline" } }),
      topics: array("Tracks and topics", "track", { trackName: text("Track name"), subTopics: textarea("Topics") }),
    },
    defaultProps: { sectionTitle: "Call for papers", conferenceName: "", scopeDescription: "", submissionUrl: "", templateWordUrl: "", templateLatexUrl: "", indexingBadges: "", deadlines: [], topics: [] }, render: CallForPapersBlock,
  },
  "Conference/Speakers": {
    type: "Conference/Speakers", label: "Speakers and leadership", category: "organization", icon: Users,
    description: "Present speakers or leaders in cards or a feature carousel.",
    fields: { ...heading, badge: text("Badge"), titleColor: select("Title color", [["", "Default"], ["primary", "Primary"], ["white", "White"], ["dark", "Dark"]]), subtitleColor: select("Description color", [["", "Default"], ["white", "White"], ["primary", "Primary"], ["dark", "Dark"]]), badgeColor: select("Badge color", [["", "Default"], ["primary", "Primary"], ["red", "Red"], ["amber", "Amber"], ["white", "White"], ["dark", "Dark"]]),
      backgroundColor: select("Background", [["primary", "Primary"], ["white", "White"], ["slate", "Slate"], ["dark", "Dark"]]), layout: select("Layout", [["cards", "Cards"], ["human-quote", "Portrait and quote"], ["carousel", "Carousel"]]), columns: select("Columns", [["2", "2"], ["3", "3"], ["4", "4"]]), exploreLabel: text("Explore button text"), exploreHref: text("Explore URL"), admissionsLabel: text("Second button text"), admissionsHref: text("Second button URL"),
      speakers: array("Speakers", "speaker", { name: text("Name"), role: text("Role"), email: text("Email"), group: text("Group"), affiliation: text("Affiliation"), country: text("Country"), image: image("Portrait"), quote: textarea("Quote"), keynoteTitle: text("Keynote title"), abstract: textarea("Biography"), scholarUrl: text("Google Scholar URL"), linkedinUrl: text("LinkedIn URL"), orcid: text("ORCID URL") }),
    },
    defaultProps: { sectionTitle: "Speakers", sectionSubtitle: "", columns: "2", layout: "cards", backgroundColor: "white", exploreLabel: "", exploreHref: "", admissionsLabel: "", admissionsHref: "", speakers: [] }, render: KeynoteSpeakersBlock,
  },
  "Conference/Pricing": {
    type: "Conference/Pricing", label: "Registration pricing", category: "registration", icon: CreditCard,
    description: "Compare registration packages and their benefits.",
    fields: { ...heading, noteText: text("Footer note"), tiers: array("Pricing tiers", "tier", { name: text("Name"), price: text("Price"), period: text("Price period"), badge: text("Badge"), isPopular: { type: "switch", label: "Highlight this tier" }, description: textarea("Description"), features: { ...textarea("Benefits"), description: "Separate benefits with semicolons." }, ctaText: text("Button text"), ctaLink: text("Registration URL") }) },
    defaultProps: { sectionTitle: "Registration fees", sectionSubtitle: "", noteText: "", tiers: [] }, render: RegistrationPricingBlock,
  },
  "Data/Timeline": {
    type: "Data/Timeline", label: "Milestones timeline", category: "history", icon: Clock,
    description: "Display milestones vertically or horizontally.",
    fields: { ...heading, layout: select("Layout", [["vertical", "Vertical"], ["horizontal", "Horizontal"]]), items: array("Milestones", "milestone", { year: text("Date or year"), title: text("Title"), description: textarea("Description"), badge: text("Badge"), status: select("Status", [["completed", "Completed"], ["current", "Current"], ["upcoming", "Upcoming"]]), icon: select("Icon", [["flag", "Flag"], ["award", "Award"], ["rocket", "Rocket"], ["star", "Star"], ["book", "Book"], ["check", "Check"]]), image: image("Image"), linkText: text("Link text"), linkUrl: text("Link URL") }) },
    defaultProps: { sectionTitle: "Milestones", sectionSubtitle: "", layout: "vertical", items: [] }, render: TimelineMilestonesBlock,
  },
  "Data/StatsChart": {
    type: "Data/StatsChart", label: "Interactive statistics chart", category: "conference", icon: BarChart3,
    description: "Show metric cards and an interactive chart.",
    fields: { ...heading, chartType: select("Chart type", [["bar", "Bar"], ["line", "Line"], ["area", "Area"], ["pie", "Pie"]]), series1Name: text("Series 1 name"), series2Name: text("Series 2 name"), metrics: array("Metrics", "metric", { value: text("Value"), label: text("Label"), trend: text("Trend"), icon: select("Icon", [["book", "Book"], ["money", "Funding"], ["grad", "Graduation"], ["award", "Award"]]) }), dataPoints: array("Data points", "point", { label: text("Label"), value1: { type: "number", label: "Series 1 value" }, value2: { type: "number", label: "Series 2 value" } }) },
    defaultProps: { sectionTitle: "Statistics", sectionSubtitle: "", chartType: "bar", series1Name: "Series 1", series2Name: "Series 2", metrics: [], dataPoints: [] }, render: (props) => <StatsChartBlock key={props.chartType} {...props} />,
  },
};
