// Featured-agent directory — agencies pay monthly to appear in area guides.
// To add a paying agent: append { name, areas, phone, tagline, since } and redeploy.
export interface Agent { name: string; areas: string[]; phone: string; tagline: string; since: string }

export const AGENTS: Agent[] = [
  // Example (uncomment + edit when the first agent pays):
  // { name: "Owusu Properties", areas: ["spintex", "tema"], phone: "0244000000", tagline: "Estate specialists · 200+ matches", since: "Sep 2026" },
];

export const agentsFor = (areaSlug: string): Agent[] => AGENTS.filter((a) => a.areas.includes(areaSlug));
