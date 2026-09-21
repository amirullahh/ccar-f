import { notFound } from "next/navigation";
import { getDomain, getDomains, getTasksForDomain } from "@/lib/data";
import { DomainOverview } from "@/components/domain-overview";

export function generateStaticParams() {
  return getDomains().map((d) => ({ domain: d.slug }));
}

export function generateMetadata({ params }: { params: { domain: string } }) {
  const domain = getDomain(params.domain);
  if (!domain) return {};
  return {
    title: `Domain ${domain.num} — ${domain.title}`,
    description: domain.description,
  };
}

export default function DomainPage({ params }: { params: { domain: string } }) {
  const domain = getDomain(params.domain);
  if (!domain) notFound();

  return <DomainOverview domain={domain} tasksList={getTasksForDomain(domain.slug)} />;
}
