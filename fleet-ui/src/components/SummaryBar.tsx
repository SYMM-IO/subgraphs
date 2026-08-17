import { Boxes, GitBranch, ShieldAlert, TriangleAlert } from "lucide-react";
import type { FleetSummary } from "../types/fleet";

const cards = [
  { key: "rows", label: "Subgraphs", icon: Boxes },
  { key: "deployments", label: "Versions", icon: GitBranch },
  { key: "multi_version", label: "Multiple versions", icon: TriangleAlert },
  { key: "attention", label: "Unhealthy", icon: ShieldAlert },
] as const;

export function SummaryBar({ summary }: { summary: FleetSummary }) {
  return (
    <section className="summary-grid" aria-label="Fleet summary">
      {cards.map((card) => {
        const Icon = card.icon;
        const value = summary[card.key];
        const note = card.key === "rows"
          ? `Across ${summary.chains} networks`
          : card.key === "deployments"
            ? `${summary.tags} live tag pointers`
            : card.key === "multi_version"
              ? value === 1 ? "1 subgraph to review" : `${value} subgraphs to review`
              : "Unsynced or unhealthy versions";
        return (
          <div className={card.key === "attention" && value > 0 ? "summary-card summary-card-alert" : "summary-card"} key={card.key}>
            <div className="summary-icon"><Icon size={18} aria-hidden="true" /></div>
            <span>{card.label}</span>
            <strong>{value}</strong>
            <small>{note}</small>
          </div>
        );
      })}
    </section>
  );
}
