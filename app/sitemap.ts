import type { MetadataRoute } from "next";
import { tasks } from "@/lib/data";
import { getDomains } from "@/lib/curriculum";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://claude-exam-guide.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const statics = [
    "",
    "/learn",
    "/drill",
    "/exam-sim",
    "/cheatsheet",
    "/glossary",
    "/progress",
    "/diagnostic",
  ].map((p) => ({
    url: `${BASE}${p}`,
    lastModified: new Date(),
  }));
  const domains = getDomains().map((d) => ({
    url: `${BASE}/learn/${d.slug}`,
    lastModified: new Date(),
  }));
  const lessons = tasks.map((t) => ({
    url: `${BASE}/learn/${t.domainSlug}/${t.taskSlug}`,
    lastModified: new Date(),
  }));
  return [...statics, ...domains, ...lessons];
}
