import { Boxes, GitBranch, ShieldCheck, TriangleAlert } from "lucide-react";
import type { FleetSummary } from "../types/fleet";

const cards = [
  { key: "rows", label: "Active rows", sub: "chains", icon: Boxes },
  { key: "deployments", label: "Deployments", sub: "tag pointers", icon: GitBranch },
  { key: "multi_version", label: "Multi-version", sub: "rows needing review", icon: TriangleAlert },
  { key: "attention", label: "Attention", sub: "non-healthy or unsynced", icon: ShieldCheck },
] as const;

export function SummaryBar({ summary }: { summary: FleetSummary }) {
  return (
    <section className="summary-grid" aria-label="Fleet summary">
      {cards.map((card) => {
        const Icon = card.icon;
        const value = summary[card.key];
        const note = card.key === "rows" ? `${summary.chains} ${card.sub}` : card.key === "deployments" ? `${summary.tags} ${card.sub}` : card.sub;
        return (
          <div className="summary-card" key={card.key}>
            <div className="summary-icon"><Icon size={18} /></div>
            <span>{card.label}</span>
            <strong>{value}</strong>
            <small>{note}</small>
          </div>
        );
      })}
    </section>
  );
}
