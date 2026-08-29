import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Activity, Moon, RefreshCw, Sun, UploadCloud } from "lucide-react";
import type { ApiActionResponse, ApiToast, FleetPayload, FleetSummary, JobView, Selection } from "./types/fleet";
import {
  bulkDeploy,
  bulkPromote,
  deleteVersion,
  fetchFleet,
  fetchJobs,
  refreshFleet,
  removeTag,
  rowPromote,
} from "./lib/api";
import { ActivityRail } from "./components/ActivityRail";
import { ActionDialogs, type DialogState } from "./components/ActionDialogs";
import { BrandLogo } from "./components/BrandLogo";
import { FleetTable, type Filters, visibleRows } from "./components/FleetTable";
import { SummaryBar } from "./components/SummaryBar";
import { Toolbar } from "./components/Toolbar";
import { Button, Modal, ToastHost } from "./components/ui";

const emptyFilters: Filters = {
  module: "",
  preset: "all",
  query: "",
  multiOnly: false,
  chains: new Set(),
};

const emptySummary: FleetSummary = {
  chains: 0,
  rows: 0,
  deployments: 0,
  tags: 0,
  multi_version: 0,
  attention: 0,
};

export function App() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = window.localStorage.getItem("fleet-theme");
    return saved === "dark" || saved === "light" ? saved : "light";
  });
  const [fleet, setFleet] = useState<FleetPayload | null>(null);
  const [jobs, setJobs] = useState<JobView[]>([]);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [selected, setSelected] = useState<Map<string, Selection>>(new Map());
  const [dialog, setDialog] = useState<DialogState>({ kind: "none" });
  const [toast, setToast] = useState<ApiToast | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const dialogTriggerRef = useRef<HTMLElement | null>(null);
  const activityTriggerRef = useRef<HTMLButtonElement | null>(null);

  const loadFleet = useCallback(async () => {
    setLoading(true);
    try {
      const payload = await fetchFleet();
      setFleet(payload);
      setJobs(payload.jobs);
    } catch (error) {
      setToast({ kind: "err", title: "Fleet load failed", body: error instanceof Error ? error.message : String(error) });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFleet();
  }, [loadFleet]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#0a0e0d" : "#f2f6f4");
    window.localStorage.setItem("fleet-theme", theme);
  }, [theme]);

  useEffect(() => {
    const timer = window.setInterval(async () => {
      try {
        setJobs(await fetchJobs());
      } catch {
        // Keep the current activity view; transient polling failures should not wipe the UI.
      }
    }, 1500);
    return () => window.clearInterval(timer);
  }, []);

  const allRows = useMemo(() => (fleet ? fleet.groups.flatMap((group) => group.modules.map((row) => ({ group, row }))) : []), [fleet]);
  const filteredRows = useMemo(() => (fleet ? visibleRows(fleet.groups, filters) : []), [fleet, filters]);
  const filteredSummary = useMemo<FleetSummary>(() => {
    if (!fleet) return emptySummary;
    const deployments = filteredRows.flatMap(({ row }) => row.deployments);
    return {
      chains: new Set(filteredRows.map(({ group }) => group.chain)).size,
      rows: filteredRows.length,
      deployments: deployments.length,
      tags: filteredRows.reduce((total, { row }) => total + Object.keys(row.tags).length, 0),
      multi_version: filteredRows.filter(({ row }) => row.deployments.length > 1).length,
      attention: deployments.filter((deployment) => deployment.synced !== "100%" || (deployment.status ? !deployment.status.toLowerCase().includes("healthy") : false)).length,
    };
  }, [fleet, filteredRows]);
  const selections = Array.from(selected.values());
  const runningJobs = jobs.filter((job) => job.status === "running").length;
  const visibleKeys = new Set(filteredRows.map((row) => row.key));
  const hiddenSelectionCount = Array.from(selected.keys()).filter((key) => !visibleKeys.has(key)).length;

  function applyResponse(response: ApiActionResponse) {
    setFleet(response.fleet);
    setJobs(response.jobs);
    setToast(response.toast);
  }

  function openDialog(nextDialog: DialogState) {
    dialogTriggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setDialog(nextDialog);
  }

  function closeDialog() {
    setDialog({ kind: "none" });
    const trigger = dialogTriggerRef.current;
    dialogTriggerRef.current = null;
    window.requestAnimationFrame(() => {
      if (trigger?.isConnected) trigger.focus();
    });
  }

  function changeActivityOpen(open: boolean) {
    setActivityOpen(open);
    if (!open) {
      window.requestAnimationFrame(() => {
        if (activityTriggerRef.current?.isConnected) activityTriggerRef.current.focus();
      });
    }
  }

  const closeToast = useCallback((open: boolean) => {
    if (!open) setToast(null);
  }, []);

  async function runAction(action: () => Promise<ApiActionResponse>, shouldCloseDialog = true) {
    setBusy(true);
    try {
      const response = await action();
      applyResponse(response);
      if (shouldCloseDialog) closeDialog();
    } catch (error) {
      setToast({ kind: "err", title: "Action failed", body: error instanceof Error ? error.message : String(error) });
    } finally {
      setBusy(false);
    }
  }

  const refresh = () => runAction(refreshFleet, false);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    const transitionGuard = document.createElement("style");
    transitionGuard.textContent = "*,*::before,*::after{transition:none!important}";
    document.head.append(transitionGuard);
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.style.colorScheme = nextTheme;
    setTheme(nextTheme);
    void document.body.offsetHeight;
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => transitionGuard.remove()));
  };

  const toggleRow = (key: string, selection: Selection, checked: boolean) => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (checked) next.set(key, selection);
      else next.delete(key);
      return next;
    });
  };

  const toggleAll = (rows: Array<{ key: string; selection: Selection }>, checked: boolean) => {
    setSelected((prev) => {
      const next = new Map(prev);
      rows.forEach((row) => {
        if (checked) next.set(row.key, row.selection);
        else next.delete(row.key);
      });
      return next;
    });
  };

  const copyEndpoint = async (base: string, versionOrTag: string) => {
    if (!fleet) return;
    const url = `https://api.goldsky.com/api/public/${fleet.goldskyProject}/subgraphs/${base}/${versionOrTag}/gn`;
    try {
      await navigator.clipboard.writeText(url);
      setToast({ kind: "ok", title: "Endpoint copied", body: `${base}/${versionOrTag}` });
    } catch {
      setToast({ kind: "err", title: "Unable to copy endpoint", body: "Copy the endpoint from the page opened by the adjacent link." });
    }
  };

  if (loading && !fleet) {
    return (
      <main className="boot-screen" aria-busy="true" aria-live="polite">
        <BrandLogo />
        <h1>Loading SYMMIO Fleet</h1>
        <p>Fetching Goldsky deployment state…</p>
      </main>
    );
  }

  if (!fleet) {
    return (
      <main className="boot-screen">
        <BrandLogo />
        <h1>Fleet unavailable</h1>
        <p>Check the Fleet server logs, then try loading the deployment state again.</p>
        <Button variant="primary" onClick={() => void loadFleet()}>
          <RefreshCw size={15} aria-hidden="true" /> Try again
        </Button>
      </main>
    );
  }

  return (
    <>
      <div className="app-shell">
        <main className="main-pane" aria-busy={busy}>
          <header className="app-header">
            <div className="header-ambient" aria-hidden="true" />
            <div className="title-block">
              <BrandLogo />
              <div className="title-copy">
                <div className="title-row">
                  <span className="app-kicker">SYMMIO</span>
                  <h1>Subgraph Fleet</h1>
                </div>
                <div className="header-meta">
                  <span className={fleet.lastError ? "status-pill status-pill-stale" : "status-pill"}>
                    <span className="status-dot" aria-hidden="true" />
                    {fleet.lastError ? "Cached state" : "Goldsky connected"}
                  </span>
                  <span>{fleet.lastFetchedLabel}</span>
                  {fleet.lastError ? <span className="header-error">{fleet.lastError}</span> : null}
                </div>
              </div>
            </div>
            <div className="header-actions">
              <Button className="theme-toggle" onClick={toggleTheme} aria-label={`Use ${theme === "light" ? "dark" : "light"} appearance`}>
                {theme === "light" ? <Moon size={15} aria-hidden="true" /> : <Sun size={15} aria-hidden="true" />}
                {theme === "light" ? "Dark mode" : "Light mode"}
              </Button>
              <Button onClick={(event) => { activityTriggerRef.current = event.currentTarget; setActivityOpen(true); }}>
                <Activity size={15} aria-hidden="true" />
                Activity
                <span className="button-count" aria-label={runningJobs ? `${runningJobs} running actions` : `${jobs.length} recorded actions`}>
                  {runningJobs ? `${runningJobs} running` : jobs.length}
                </span>
              </Button>
              <Button onClick={refresh} disabled={busy}>
                <RefreshCw size={15} className={busy ? "spin-slow" : undefined} aria-hidden="true" />
                {busy ? "Refreshing…" : "Refresh"}
              </Button>
            </div>
          </header>

          <Toolbar
            groups={fleet.groups}
            filters={filters}
            onChange={setFilters}
            visibleCount={filteredRows.length}
            totalCount={allRows.length}
          />

          {selected.size ? (
            <div className="bulk-bar" role="region" aria-label="Bulk actions">
              <div className="bulk-selection-copy">
                <strong>{selected.size} selected</strong>
                {hiddenSelectionCount ? <span>{hiddenSelectionCount} outside current filters</span> : <span>Ready for a bulk action</span>}
              </div>
              <Button variant="primary" onClick={() => openDialog({ kind: "bulk-promote", selections })}>Promote</Button>
              <Button onClick={() => openDialog({ kind: "bulk-deploy", selections })}><UploadCloud size={14} aria-hidden="true" /> Deploy</Button>
              <Button variant="ghost" onClick={() => setSelected(new Map())}>Clear selection</Button>
            </div>
          ) : null}

          <SummaryBar summary={filteredSummary} />

          <FleetTable
            groups={fleet.groups}
            project={fleet.goldskyProject}
            filters={filters}
            selected={selected}
            onToggle={toggleRow}
            onToggleAll={toggleAll}
            onCopy={copyEndpoint}
            onDelete={(base, version) => setDialog({ kind: "confirm-delete", base, version })}
            onRemoveTag={(base, version, tag) => setDialog({ kind: "confirm-untag", base, version, tag })}
            onPromote={(base, version, tags, managedPipelines) => setDialog({ kind: "row-promote", base, version, tags, managedPipelines })}
          />
        </main>
      </div>

      <Modal
        open={activityOpen}
        onOpenChange={changeActivityOpen}
        title="Activity"
        description={runningJobs ? `${runningJobs} action${runningJobs === 1 ? "" : "s"} running now` : `${jobs.length} total action${jobs.length === 1 ? "" : "s"}`}
        icon={<Activity size={18} aria-hidden="true" />}
        className="activity-dialog"
      >
        <ActivityRail jobs={jobs} compact />
      </Modal>

      <ActionDialogs
        state={dialog}
        busy={busy}
        onClose={closeDialog}
        onBulkDeploy={(version, batchSelections) => {
          void runAction(() => bulkDeploy({ version, selections: batchSelections }).then((response) => {
            setSelected(new Map());
            return response;
          }));
        }}
        onBulkPromote={(input) => {
          void runAction(() => bulkPromote(input).then((response) => {
            setSelected(new Map());
            return response;
          }));
        }}
        onDelete={(base, version) => void runAction(() => deleteVersion({ base, version }))}
        onUntag={(base, version, tag) => void runAction(() => removeTag({ base, version, tag }))}
        onRowPromote={(base, version, tags, updatePipelines) => void runAction(() => rowPromote({ base, version, tags, updatePipelines }))}
      />
      <ToastHost toast={toast} onOpenChange={closeToast} />
    </>
  );
}
