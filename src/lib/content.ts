// Content engine — reads Markdown + YAML frontmatter from /content at build time.
// Decap CMS (/public/admin) edits these same files, so non-technical owners never touch code.
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

const CONTENT = path.join(process.cwd(), "content");

export interface PriceRow { type: string; min: number; max: number; advance: string }
export interface Reality { icon: "water" | "power" | "transport" | "noise"; title: string; text: string }
export interface Faq { q: string; a: string }

export interface Area {
  slug: string; name: string; tagline: string; lastVerified: string;
  summary: string; prices: PriceRow[]; realities: Reality[]; faqs: Faq[]; bodyHtml: string;
}
export interface Guide {
  slug: string; title: string; lastVerified: string; summary: string;
  layout: string[]; priceByArea: { area: string; range: string }[];
  warning: string; faqs: Faq[]; bodyHtml: string;
}
export interface RightsArticle {
  slug: string; title: string; summary: string; lawBox: string;
  steps: string[]; faqs: Faq[]; bodyHtml: string;
}
export interface NewsPost {
  slug: string; title: string; date: string; readTime: string;
  excerpt: string; tags: string[]; featured?: boolean; bodyHtml: string;
}
export interface LegalDoc { slug: string; title: string; updated: string; bodyHtml: string }

function readCollection<T>(dir: string): (T & { slug: string; bodyHtml: string })[] {
  const full = path.join(CONTENT, dir);
  if (!fs.existsSync(full)) return [];
  return fs
    .readdirSync(full)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const raw = fs.readFileSync(path.join(full, f), "utf8");
      const { data, content } = matter(raw);
      return { ...(data as object), slug: f.replace(/\.md$/, ""), bodyHtml: marked.parse(content) as string } as T & { slug: string; bodyHtml: string };
    });
}

function readOne<T>(dir: string, slug: string): (T & { slug: string; bodyHtml: string }) | null {
  const file = path.join(CONTENT, dir, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  return { ...(data as object), slug, bodyHtml: marked.parse(content) as string } as T & { slug: string; bodyHtml: string };
}

export const getAreas = () => readCollection<Omit<Area, "slug" | "bodyHtml">>("areas");
export const getArea = (slug: string) => readOne<Omit<Area, "slug" | "bodyHtml">>("areas", slug);
export const getGuides = () => readCollection<Omit<Guide, "slug" | "bodyHtml">>("guides");
export const getGuide = (slug: string) => readOne<Omit<Guide, "slug" | "bodyHtml">>("guides", slug);
export const getRights = () => readCollection<Omit<RightsArticle, "slug" | "bodyHtml">>("rights");
export const getRightsArticle = (slug: string) => readOne<Omit<RightsArticle, "slug" | "bodyHtml">>("rights", slug);
export const getNews = () => readCollection<Omit<NewsPost, "slug" | "bodyHtml">>("news").sort((a, b) => (a.date < b.date ? 1 : -1));
export const getNewsPost = (slug: string) => readOne<Omit<NewsPost, "slug" | "bodyHtml">>("news", slug);
export const getLegal = (slug: string) => readOne<Omit<LegalDoc, "slug" | "bodyHtml">>("legal", slug);

// Flat search index (server-built, passed to the client Fuse.js UI on /search).
export interface SearchEntry { title: string; excerpt: string; url: string; kind: "Area" | "Guide" | "News" | "Right" }
export function getSearchIndex(): SearchEntry[] {
  return [
    ...getAreas().map((a) => ({ title: a.name, excerpt: a.summary, url: `/areas/${a.slug}`, kind: "Area" as const })),
    ...getGuides().map((g) => ({ title: g.title, excerpt: g.summary, url: `/guides/${g.slug}`, kind: "Guide" as const })),
    ...getNews().map((n) => ({ title: n.title, excerpt: n.excerpt, url: `/news/${n.slug}`, kind: "News" as const })),
    ...getRights().map((r) => ({ title: r.title, excerpt: r.summary, url: `/rights/${r.slug}`, kind: "Right" as const })),
  ];
}

// "2026-09-01" → "Sep 1, 2026" (timezone-safe: parse components, never Date(string)).
export function formatDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[Number(m[2]) - 1]} ${Number(m[3])}, ${m[1]}`;
}
