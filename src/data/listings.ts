// Partner listings — properties submitted by agents/landlords via /list-property,
// reviewed by the owner, then published here manually. Newest first.
export interface Listing {
  id: string; areaSlug: string; areaName: string; type: string;
  price: number; advance: string; description: string;
  agentName: string; agentPhone: string; added: string;
}

export const LISTINGS: Listing[] = [
  // Published via owner review — append new listings here and redeploy.
];
