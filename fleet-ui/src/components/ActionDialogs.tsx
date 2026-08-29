import { GitBranch, Rocket, Trash2, UploadCloud, Workflow } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import type { ManagedPipeline, Selection } from "../types/fleet";
import { Button, Field, Modal } from "./ui";

export type DialogState =
  | { kind: "none" }
  | { kind: "bulk-deploy"; selections: Selection[] }
  | { kind: "bulk-promote"; selections: Selection[] }
  | { kind: "confirm-delete"; base: string; version: string }
  | { kind: "confirm-untag"; base: string; version: string; tag: string }
  | { kind: "row-promote"; base: string; version: string; tags: string[]; managedPipelines: ManagedPipeline[] };

type Props = {
  state: DialogState;
  busy: boolean;
  onClose: () => void;
  onBulkDeploy: (version: string, selections: Selection[]) => void;
  onBulkPromote: (input: {
    selections: Selection[];
    tags: string[];
    mode: "specific" | "auto";
    version: string;
    requireSynced: boolean;
    deleteDisplaced: boolean;
    updatePipelines: boolean;
  }) => void;
  onDelete: (base: string, version: string) => void;
  onUntag: (base: string, version: string, tag: string) => void;
  onRowPromote: (base: string, version: string, tags: string[], updatePipelines: boolean) => void;
};

export function ActionDialogs(props: Props) {
  const open = props.state.kind !== "none";
  const close = props.busy ? undefined : props.onClose;
  if (props.state.kind === "bulk-deploy") {
    return <BulkDeployDialog open={open} busy={props.busy} selections={props.state.selections} onClose={close} onSubmit={props.onBulkDeploy} />;
  }
  if (props.state.kind === "bulk-promote") {
    return <BulkPromoteDialog open={open} busy={props.busy} selections={props.state.selections} onClose={close} onSubmit={props.onBulkPromote} />;
  }
  if (props.state.kind === "confirm-delete") {
    const state = props.state;
    return (
      <ConfirmDialog
        open={open}
        busy={props.busy}
        title="Delete deployment"
        description={`${state.base}/${state.version}`}
        icon={<Trash2 size={18} aria-hidden="true" />}
        confirmLabel="Delete deployment"
        body="Permanently delete this version from Goldsky. Move or remove any tag pointers that still depend on it first."
        danger
        onClose={close}
        onConfirm={() => props.onDelete(state.base, state.version)}
      />
    );
  }
  if (props.state.kind === "confirm-untag") {
    const state = props.state;
    return (
      <ConfirmDialog
        open={open}
        busy={props.busy}
        title="Remove tag"
        description={`${state.tag} on ${state.base}/${state.version}`}
        icon={<GitBranch size={18} aria-hidden="true" />}
        confirmLabel="Remove tag"
        body={`Remove the ${state.tag} pointer from this subgraph. Requests to that tag will stop resolving until it is promoted again.`}
        onClose={close}
        onConfirm={() => props.onUntag(state.base, state.version, state.tag)}
      />
    );
  }
  if (props.state.kind === "row-promote") {
    return <RowPromoteDialog open={open} busy={props.busy} state={props.state} onClose={close} onSubmit={props.onRowPromote} />;
  }
  return null;
}

function ConfirmDialog({
  open,
  busy,
  title,
  description,
  icon,
  confirmLabel,
  body,
  danger,
  onClose,
  onConfirm,
}: {
  open: boolean;
  busy: boolean;
  title: string;
  description: string;
  icon: ReactNode;
  confirmLabel: string;
  body: string;
  danger?: boolean;
  onClose?: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      open={open}
      onOpenChange={(next) => !next && onClose?.()}
      title={title}
      description={description}
      icon={icon}
      closeDisabled={busy}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy} autoFocus>Cancel</Button>
          <Button variant={danger ? "danger" : "primary"} onClick={onConfirm} disabled={busy} aria-busy={busy}>
            {busy ? <LoaderCircle size={14} className="spin-slow" aria-hidden="true" /> : null}{confirmLabel}
          </Button>
        </>
      }
    >
      <p className="dialog-copy">{body}</p>
    </Modal>
  );
}

function BulkDeployDialog({
  open,
  busy,
  selections,
  onClose,
  onSubmit,
}: {
  open: boolean;
  busy: boolean;
  selections: Selection[];
  onClose?: () => void;
  onSubmit: Props["onBulkDeploy"];
}) {
  const [version, setVersion] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const submit = () => {
    if (!version.trim()) {
      setError("Enter a version label, for example v0.2.13.");
      inputRef.current?.focus();
      return;
    }
    setError("");
    onSubmit(version.trim(), selections);
  };
  return (
    <Modal
      open={open}
      onOpenChange={(next) => !next && onClose?.()}
      title="Sequential batch deploy"
      description={`${selections.length} selected subgraph${selections.length === 1 ? "" : "s"}`}
      icon={<UploadCloud size={18} aria-hidden="true" />}
      closeDisabled={busy}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button variant="primary" onClick={submit} disabled={busy} aria-busy={busy}>
            {busy ? <LoaderCircle size={14} className="spin-slow" aria-hidden="true" /> : null}Queue deploy
          </Button>
        </>
      }
    >
      <Field label="Version label" hint="Deployments run sequentially in the order shown below." error={error} errorId="bulk-deploy-version-error">
        <input
          ref={inputRef}
          className="input"
          value={version}
          onChange={(event) => { setVersion(event.currentTarget.value); setError(""); }}
          onKeyDown={(event) => { if (event.key === "Enter") submit(); }}
          placeholder="v0.2.13"
          aria-invalid={!!error}
          aria-describedby={error ? "bulk-deploy-version-error" : undefined}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          autoFocus
        />
      </Field>
      <SelectionPreview selections={selections} />
    </Modal>
  );
}

function BulkPromoteDialog({
  open,
  busy,
  selections,
  onClose,
  onSubmit,
}: {
  open: boolean;
  busy: boolean;
  selections: Selection[];
  onClose?: () => void;
  onSubmit: Props["onBulkPromote"];
}) {
  const [version, setVersion] = useState("");
  const [mode, setMode] = useState<"specific" | "auto">("specific");
  const [latest, setLatest] = useState(true);
  const [stage, setStage] = useState(false);
  const [requireSynced, setRequireSynced] = useState(true);
  const [deleteDisplaced, setDeleteDisplaced] = useState(false);
  const [updatePipelines, setUpdatePipelines] = useState(true);
  const tags = useMemo(() => [latest && "latest", stage && "stage"].filter(Boolean) as string[], [latest, stage]);
  const affectedPipelines = useMemo(() => pipelineNames(selections), [selections]);
  return (
    <Modal
      open={open}
      onOpenChange={(next) => !next && onClose?.()}
      title="Promote selected subgraphs"
      description={`${selections.length} selected subgraph${selections.length === 1 ? "" : "s"}`}
      icon={<Rocket size={18} aria-hidden="true" />}
      closeDisabled={busy}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button
            variant="primary"
            onClick={() => onSubmit({ selections, tags, mode, version, requireSynced, deleteDisplaced, updatePipelines })}
            disabled={busy || tags.length === 0 || (mode === "specific" && !version.trim())}
          >
            {busy ? <LoaderCircle size={14} className="spin-slow" aria-hidden="true" /> : null}
            {deleteDisplaced ? "Promote and delete old versions" : "Promote selected"}
          </Button>
        </>
      }
    >
      <div className="option-grid">
        <label><input ref={latestRef} type="checkbox" checked={latest} onChange={(e) => { setLatest(e.currentTarget.checked); setError(""); }} /> latest</label>
        <label><input type="checkbox" checked={stage} onChange={(e) => { setStage(e.currentTarget.checked); setError(""); }} /> stage</label>
      </div>
      <div className="radio-stack">
        <label><input type="radio" name="promote-mode" checked={mode === "specific"} onChange={() => { setMode("specific"); setError(""); }} /> Specific version</label>
        <label><input type="radio" name="promote-mode" checked={mode === "auto"} onChange={() => { setMode("auto"); setError(""); }} /> Newest fully synced version per subgraph</label>
      </div>
      <Field label="Version" hint={mode === "auto" ? "Fleet chooses the newest 100% synced version for each subgraph." : "The same version label is promoted for every selected subgraph."} error={error} errorId="bulk-promote-error">
        <input
          ref={versionRef}
          className="input"
          value={version}
          disabled={mode === "auto"}
          onChange={(event) => { setVersion(event.currentTarget.value); setError(""); }}
          onKeyDown={(event) => { if (event.key === "Enter") submit(); }}
          placeholder="v0.2.13"
          aria-invalid={!!error && mode === "specific"}
          aria-describedby={error ? "bulk-promote-error" : undefined}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
        />
      </Field>
      <div className="option-grid stacked">
        <label><input type="checkbox" checked={requireSynced} onChange={(e) => setRequireSynced(e.currentTarget.checked)} /> Require 100% sync before tagging</label>
        <label className="danger-text"><input type="checkbox" checked={deleteDisplaced} onChange={(e) => setDeleteDisplaced(e.currentTarget.checked)} /> Delete displaced versions</label>
      </div>
      <PipelineFollowup
        checked={updatePipelines}
        onChange={setUpdatePipelines}
        affectedPipelines={affectedPipelines}
        description="Runs only after every selected subgraph is promoted successfully, using a fresh snapshot."
      />
      <SelectionPreview selections={selections} />
    </Modal>
  );
}

function RowPromoteDialog({
  open,
  busy,
  state,
  onClose,
  onSubmit,
}: {
  open: boolean;
  busy: boolean;
  state: Extract<DialogState, { kind: "row-promote" }>;
  onClose?: () => void;
  onSubmit: Props["onRowPromote"];
}) {
  const [selected, setSelected] = useState(() => new Set(state.tags));
  const [updatePipelines, setUpdatePipelines] = useState(true);
  const tags = Array.from(selected);
  const submit = () => {
    if (!tags.length) {
      setError("Select at least one tag to promote.");
      firstTagRef.current?.focus();
      return;
    }
    setError("");
    onSubmit(state.base, state.version, tags);
  };
  return (
    <Modal
      open={open}
      onOpenChange={(next) => !next && onClose?.()}
      title="Promote version"
      description={`${state.base}/${state.version}`}
      icon={<Rocket size={18} aria-hidden="true" />}
      closeDisabled={busy}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button variant="primary" disabled={busy || tags.length === 0} onClick={() => onSubmit(state.base, state.version, tags, updatePipelines)}>
            {busy ? "Promoting..." : "Promote"}
          </Button>
        </>
      }
    >
      <div className="option-grid">
        {state.tags.map((tag) => (
          <label key={tag}>
            <input
              ref={tag === state.tags[0] ? firstTagRef : undefined}
              type="checkbox"
              checked={selected.has(tag)}
              onChange={(event) => {
                const next = new Set(selected);
                if (event.currentTarget.checked) next.add(tag);
                else next.delete(tag);
                setSelected(next);
                setError("");
              }}
            />
            {tag}
          </label>
        ))}
      </div>
      <PipelineFollowup
        checked={updatePipelines}
        onChange={setUpdatePipelines}
        affectedPipelines={state.managedPipelines.map((pipeline) => pipeline.name)}
        description="Runs after the selected tags are promoted successfully, using a fresh snapshot."
      />
    </Modal>
  );
}

function pipelineNames(selections: Selection[]) {
  return Array.from(new Set(selections.flatMap((selection) => selection.managed_pipelines.map((pipeline) => pipeline.name)))).sort();
}

function PipelineFollowup({
  checked,
  onChange,
  affectedPipelines,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  affectedPipelines: string[];
  description: string;
}) {
  return (
    <div className="pipeline-followup">
      <label>
        <input type="checkbox" checked={checked} onChange={(event) => onChange(event.currentTarget.checked)} />
        <Workflow size={17} />
        <span>
          <strong>Update managed Goldsky pipelines</strong>
          <small>{description}</small>
        </span>
      </label>
      <div className="pipeline-targets">
        {affectedPipelines.length ? (
          <>
            <span>Affected</span>
            {affectedPipelines.map((pipeline) => <code key={pipeline}>{pipeline}</code>)}
          </>
        ) : <span>No managed pipeline definitions match these targets.</span>}
      </div>
    </div>
  );
}

function SelectionPreview({ selections }: { selections: Selection[] }) {
  return (
    <div className="selection-preview">
      {selections.map((selection) => (
        <div key={`${selection.chain}|${selection.module}`} className="selection-row">
          <code>{selection.base || selection.chain}</code>
          <span>
            {selection.chain} · {selection.module}
            {selection.managed_pipelines.length ? ` · ${selection.managed_pipelines.length} managed pipeline${selection.managed_pipelines.length === 1 ? "" : "s"}` : ""}
          </span>
        </div>
      ))}
    </div>
  );
}
