// Private lead tracker — owner-only. No index, no public navigation.
import type { Metadata } from "next";
import Tracker from "./Tracker";

export const metadata: Metadata = { title: "Lead Tracker", description: "Private owner tool.", alternates: { canonical: "/track" }, robots: { index: false, follow: false } };

export default function TrackPage() {
  return <Tracker />;
}
