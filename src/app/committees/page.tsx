import type { Metadata } from "next";
import { CommitteesSection } from "@/components/sections/CommitteesSection";
import { CONFERENCE_INFO } from "@/data/conference";

export const metadata: Metadata = {
  title: "Committees & Leadership",
  description:
    "Organizing Committee, Steering Committee, General Chairs, and Program Chairs of the 2027 IEEE International Conference on Systems, Man, and Cybernetics (IEEE SMC 2027), hosted by HCM-UTE.",
  openGraph: {
    title: "Committees & Leadership | IEEE SMC 2027",
    description:
      "Meet the international steering and local organizing committees leading IEEE SMC 2027 in Ho Chi Minh City, Vietnam.",
  },
};

export default function CommitteesPage() {
  return (
    <div className="w-full flex flex-col">
      <CommitteesSection
        title="Organizing Committee"
        subtitle="International Steering & Local Organizing Committees for IEEE SMC 2027 in Ho Chi Minh City, Vietnam"
        autoplayDuration={4}
        showAllGroups={true}
      />
    </div>
  );
}
