import { Search, SlidersHorizontal } from "lucide-react";
import clsx from "clsx";
import type { FleetGroup } from "../types/fleet";
import { ChainLogo } from "./ChainLogo";
import type { Filters } from "./FleetTable";

type ToolbarProps = {
  groups: FleetGroup[];
  filters: Filters;
  onChange: (filters: Filters) => void;
  visibleCount: number;
  totalCount: number;
};

function updateSet(set: Set<string>, key: string, checked: boolean) {
  const next = new Set(set);
  if (checked) next.add(key);
  else next.delete(key);
  return next;
}

export function Toolbar({ groups, filters, onChange, visibleCount, totalCount }: ToolbarProps) {
  const selectedNetworks = filters.chains.size;
  return (
    <section className="toolbar-card" aria-label="Fleet filters">
      <div className="toolbar-row">
        <div className="segmented" role="group" aria-label="Subgraph type">
          {["", "analytics", "events"].map((module) => (
            <button
              type="button"
              key={module || "all"}
              className={clsx(filters.module === module && "active")}
              onClick={() => onChange({ ...filters, module })}
              aria-pressed={filters.module === module}
            >
              {module ? module[0].toUpperCase() + module.slice(1) : "All"}
            </button>
          ))}
        </div>
        <div className="segmented" role="group" aria-label="Environment">
          {(["all", "prod", "stage"] as const).map((preset) => (
            <button
              type="button"
              key={preset}
              className={clsx(filters.preset === preset && "active")}
              onClick={() => onChange({ ...filters, preset })}
              aria-pressed={filters.preset === preset}
            >
              {preset === "all" ? "All networks" : preset === "prod" ? "Production" : "Staging"}
            </button>
          ))}
        </div>
        <label className="switch">
          <input className="control-input" type="checkbox" checked={filters.multiOnly} onChange={(event) => onChange({ ...filters, multiOnly: event.currentTarget.checked })} />
          <span aria-hidden="true" />
          Multiple versions
        </label>
        <details className="deployment-filter">
          <summary>
            <span className="deployment-filter-title"><SlidersHorizontal size={14} aria-hidden="true" /> Networks</span>
            <span className="deployment-filter-value">{selectedNetworks ? `${selectedNetworks} selected` : "All"}</span>
          </summary>
          <div className="deployment-filter-panel">
            <div className="deployment-filter-head">
              <strong>Filter by network</strong>
              {selectedNetworks ? <button type="button" onClick={() => onChange({ ...filters, chains: new Set() })}>Clear networks</button> : null}
            </div>
            <div className="deployment-options">
              {groups.map((group) => (
                <label className={clsx("deployment-option", group.is_orphan && "orphan", filters.chains.has(group.chain) && "active")} key={group.chain}>
                  <input
                    className="control-input"
                    type="checkbox"
                    checked={filters.chains.has(group.chain)}
                    onChange={(event) => onChange({ ...filters, chains: updateSet(filters.chains, group.chain, event.currentTarget.checked) })}
                  />
                  <ChainLogo chain={group.chain} network={group.network} logoUrl={group.logo_url} />
                  <span>{group.chain}</span>
                </label>
              ))}
            </div>
          </div>
        </details>
        <label className="search-box">
          <span className="sr-only">Search the fleet</span>
          <Search size={16} aria-hidden="true" />
          <input
            type="search"
            name="fleet-search"
            value={filters.query}
            onChange={(event) => onChange({ ...filters, query: event.currentTarget.value })}
            placeholder="Search network, subgraph, or version…"
            autoComplete="off"
            spellCheck={false}
          />
        </label>
        <span className="row-count" role="status" aria-live="polite">{visibleCount} of {totalCount} subgraphs</span>
      </div>
    </section>
  );
}
