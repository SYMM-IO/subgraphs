import { ChevronDown, ChevronRight, Copy, ExternalLink, Rocket, Trash2 } from "lucide-react";
import { Fragment, useState } from "react";
import clsx from "clsx";
import type { FleetGroup, FleetModule, ManagedPipeline, Selection } from "../types/fleet";
import { deploymentHealth, rowKey, searchableText, toSelection } from "../lib/format";
import { endpointUrl } from "../lib/api";
import { ChainLogo } from "./ChainLogo";
import { Button, Pill } from "./ui";

export type Filters = {
  module: string;
  preset: "all" | "prod" | "stage";
  query: string;
  multiOnly: boolean;
  chains: Set<string>;
};

type TableProps = {
  groups: FleetGroup[];
  project: string;
  filters: Filters;
  selected: Map<string, Selection>;
  onToggle: (key: string, selection: Selection, checked: boolean) => void;
  onToggleAll: (visible: Array<{ key: string; selection: Selection }>, checked: boolean) => void;
  onCopy: (base: string, versionOrTag: string) => void;
  onDelete: (base: string, version: string) => void;
  onRemoveTag: (base: string, version: string, tag: string) => void;
  onPromote: (base: string, version: string, tags: string[], managedPipelines: ManagedPipeline[]) => void;
};

function rowVisible(group: FleetGroup, row: FleetModule, filters: Filters) {
  if (filters.module && row.module_short !== filters.module) return false;
  if (filters.multiOnly && row.deployments.length < 2) return false;
  if (filters.chains.size && !filters.chains.has(group.chain)) return false;
  if (filters.preset === "prod" && !group.is_prod) return false;
  if (filters.preset === "stage" && !group.is_stage) return false;
  if (filters.query && !searchableText(group, row).includes(filters.query.toLowerCase())) return false;
  return true;
}

export function visibleRows(groups: FleetGroup[], filters: Filters) {
  return groups.flatMap((group) =>
    group.modules
      .filter((row) => rowVisible(group, row, filters))
      .map((row) => ({ group, row, key: rowKey(group, row), selection: toSelection(group, row) })),
  );
}

export function FleetTable(props: TableProps) {
  const rows = visibleRows(props.groups, props.filters);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const allVisibleSelected = rows.length > 0 && rows.every((row) => props.selected.has(row.key));
  const someVisibleSelected = !allVisibleSelected && rows.some((row) => props.selected.has(row.key));
  const toggleExpanded = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <section className="table-card">
      <div className="table-scroll">
        <table className="fleet-table">
          <caption className="sr-only">Goldsky subgraphs, deployed versions, tag pointers, health, and actions</caption>
          <thead>
            <tr>
              <th className="check-col" scope="col">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={(event) => props.onToggleAll(rows, event.currentTarget.checked)}
                  aria-label="Select all visible rows"
                  ref={(node) => {
                    if (node) node.indeterminate = someVisibleSelected;
                  }}
                />
              </th>
              <th scope="col">Network / subgraph</th>
              <th scope="col">Versions</th>
              <th scope="col">Tags</th>
              <th className="details-col" scope="col">Details</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ group, row, key, selection }) => {
              const isExpanded = expanded.has(key);
              const tagCount = Object.keys(row.tags).length;
              const showNetwork = group.network && group.network !== group.chain;
              return (
                <Fragment key={key}>
                  <tr className={clsx("fleet-parent-row", props.selected.has(key) && "selected", isExpanded && "expanded")}>
                    <td data-label="Select" className="check-col">
                      <input
                        type="checkbox"
                        checked={props.selected.has(key)}
                        onChange={(event) => props.onToggle(key, selection, event.currentTarget.checked)}
                        aria-label={`Select ${group.chain} ${row.module}`}
                      />
                    </td>
                    <td data-label="Network / subgraph">
                      <div className="fleet-identity">
                        <ChainLogo chain={group.chain} network={group.network} logoUrl={group.logo_url} />
                        <div className="identity-copy">
                          <div className="identity-title">
                            <strong className={clsx(group.is_orphan && "warning-text")}>{group.chain}</strong>
                            {showNetwork ? <span>{group.network}</span> : null}
                            <div className="chain-pills">
                              {group.is_stage ? <Pill tone="yellow">stage</Pill> : null}
                              {group.is_orphan ? <Pill tone="yellow">unmapped</Pill> : null}
                            </div>
                          </div>
                          <div className="identity-subgraph">
                            <strong className={clsx("module-name", row.module_short === "analytics" && "module-primary")}>{row.module_short}</strong>
                            <code>{row.base}</code>
                            <span>{row.module}</span>
                            {row.managed_pipelines.length ? <Pill tone="blue">{row.managed_pipelines.length} pipeline{row.managed_pipelines.length === 1 ? "" : "s"}</Pill> : null}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td data-label="Deployments">
                      <div className="deploy-summary">
                        <strong>{row.deployments.length || "no"}</strong>
                        <span>version{row.deployments.length === 1 ? "" : "s"}</span>
                        {row.deployments.length > 1 ? <Pill tone="yellow">review</Pill> : null}
                      </div>
                    </td>
                    <td data-label="Tags">
                      <div className="tag-summary">
                        <strong>{tagCount}</strong>
                        <span>tag{tagCount === 1 ? "" : "s"}</span>
                      </div>
                    </td>
                    <td data-label="Details" className="details-col">
                      <button className="expand-button" onClick={() => toggleExpanded(key)} aria-expanded={isExpanded} aria-label={`${isExpanded ? "Collapse" : "Open"} ${group.chain} ${row.module}`}>
                        {isExpanded ? <ChevronDown size={15} aria-hidden="true" /> : <ChevronRight size={15} aria-hidden="true" />}
                        <span>{isExpanded ? "Hide details" : "View details"}</span>
                      </button>
                    </td>
                  </tr>
                  {isExpanded ? (
                    <tr className="deployment-detail-row">
                      <td colSpan={5}>
                        <div className="deployment-detail-panel">
                          <div className="detail-sections">
                            <section className="detail-section">
                              <div className="detail-heading">
                                <span>Deployments</span>
                              </div>
                              <div className="deployment-subtable">
                                {row.deployments.length ? (
                                  <div className="deployment-subrow subrow-header" aria-hidden="true">
                                    <span>Version</span>
                                    <span>Status</span>
                                    <span>Tags</span>
                                    <span>Actions</span>
                                  </div>
                                ) : null}
                                {row.deployments.length ? row.deployments.map((deployment) => {
                                  const health = deploymentHealth(deployment);
                                  const tagsOnVersion = Object.entries(row.tags).filter(([, version]) => version === deployment.version).map(([tag]) => tag);
                                  const movableTags = Object.entries(row.tags).filter(([, version]) => version !== deployment.version).map(([tag]) => tag);
                                  return (
                                    <div className="deployment-subrow" key={deployment.version}>
                                      <div className="deployment-version">
                                        <span className="mono version">{deployment.version}</span>
                                        <div className="endpoint-actions">
                                          <button className="icon-button" onClick={() => props.onCopy(row.base, deployment.version)} aria-label={`Copy endpoint for ${row.base} ${deployment.version}`}>
                                            <Copy size={15} aria-hidden="true" />
                                          </button>
                                          <a className="icon-button" href={endpointUrl(props.project, row.base, deployment.version)} target="_blank" rel="noreferrer" aria-label={`Open endpoint for ${row.base} ${deployment.version} in a new tab`}>
                                            <ExternalLink size={15} aria-hidden="true" />
                                          </a>
                                        </div>
                                      </div>
                                      <div className="deployment-status">
                                        <Pill tone={deployment.synced === "100%" ? "green" : "yellow"}>{deployment.synced || "?"}</Pill>
                                        {deployment.status ? <Pill tone={health === "healthy" ? "green" : health === "failed" ? "red" : "yellow"}>{deployment.status}</Pill> : null}
                                      </div>
                                      <div className="deployment-tags">
                                        {tagsOnVersion.length ? tagsOnVersion.map((tag) => <Pill key={tag} tone="blue">{tag}</Pill>) : <span className="muted">no tags</span>}
                                      </div>
                                      <div className="deployment-actions">
                                        {movableTags.length ? (
                                          <Button size="sm" variant="primary" onClick={() => props.onPromote(row.base, deployment.version, movableTags, row.managed_pipelines)}>
                                            <Rocket size={13} /> promote
                                          </Button>
                                        ) : null}
                                        <button className="icon-button danger" onClick={() => props.onDelete(row.base, deployment.version)} aria-label={`Delete ${row.base} ${deployment.version}`}>
                                          <Trash2 size={15} aria-hidden="true" />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                }) : <div className="deployment-subrow empty-subrow"><span className="muted">No deployments found for this subgraph.</span></div>}
                              </div>
                            </section>

                            <section className="detail-section">
                              <div className="detail-heading">
                                <span>Tag pointers</span>
                                <small>{tagCount} total</small>
                              </div>
                              <div className="tag-subtable">
                                {tagCount ? (
                                  <div className="tag-subrow subrow-header" aria-hidden="true">
                                    <span>Tag</span>
                                    <span>Actions</span>
                                  </div>
                                ) : null}
                                {tagCount ? Object.entries(row.tags).map(([tag, version]) => (
                                  <div className="tag-subrow" key={tag}>
                                    <div className="tag-target">
                                      <Pill tone="blue">{tag}</Pill>
                                      <span className="mono">{version}</span>
                                    </div>
                                    <div className="tag-actions">
                                      <button className="icon-button" onClick={() => props.onCopy(row.base, tag)} aria-label={`Copy ${tag} endpoint for ${row.base}`}>
                                        <Copy size={15} aria-hidden="true" />
                                      </button>
                                      <a className="icon-button" href={endpointUrl(props.project, row.base, tag)} target="_blank" rel="noreferrer" aria-label={`Open ${tag} endpoint for ${row.base} in a new tab`}>
                                        <ExternalLink size={15} aria-hidden="true" />
                                      </a>
                                      <Button size="sm" variant="ghost" onClick={() => props.onRemoveTag(row.base, version, tag)}>Remove tag</Button>
                                    </div>
                                  </div>
                                )) : <div className="tag-subrow empty-subrow"><span className="muted">No tag pointers found for this subgraph.</span></div>}
                              </div>
                            </section>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      {rows.length === 0 ? (
        <div className="empty-filter">
          <strong>No subgraphs match these filters</strong>
          <span>Reset the filters to return to the complete fleet.</span>
          <Button onClick={props.onClearFilters}>Reset filters</Button>
        </div>
      ) : null}
    </section>
  );
}
