import { GitBranch, Rocket, Trash2, UploadCloud } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import type { Selection } from "../types/fleet";
import { Button, Field, Modal } from "./ui";

export type DialogState =
  | { kind: "none" }
  | { kind: "bulk-deploy"; selections: Selection[] }
  | { kind: "bulk-promote"; selections: Selection[] }
  | { kind: "confirm-delete"; base: string; version: string }
  | { kind: "confirm-untag"; base: string; version: string; tag: string }
  | { kind: "row-promote"; base: string; version: string; tags: string[] };

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
  }) => void;
  onDelete: (base: string, version: string) => void;
  onUntag: (base: string, version: string, tag: string) => void;
  onRowPromote: (base: string, version: string, tags: string[]) => void;
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
        icon={<Trash2 size={18} />}
        confirmLabel="Delete"
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
        icon={<GitBranch size={18} />}
        confirmLabel="Remove tag"
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
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button variant={danger ? "danger" : "primary"} onClick={onConfirm} disabled={busy}>{busy ? "Working..." : confirmLabel}</Button>
        </>
      }
    >
      <p className="dialog-copy">This changes Goldsky state immediately. Keep going only if the target looks correct.</p>
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
  onSubmit: (version: string, selections: Selection[]) => void;
}) {
  const [version, setVersion] = useState("");
  return (
    <Modal
      open={open}
      onOpenChange={(next) => !next && onClose?.()}
      title="Sequential batch deploy"
      description={`${selections.length} selected subgraph${selections.length === 1 ? "" : "s"}`}
      icon={<UploadCloud size={18} />}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button variant="primary" onClick={() => onSubmit(version, selections)} disabled={busy || !version.trim()}>
            {busy ? "Queueing..." : "Queue deploy"}
          </Button>
        </>
      }
    >
      <Field label="Version label" hint="Runs fully sequentially in the selected order.">
        <input className="input" value={version} onChange={(event) => setVersion(event.currentTarget.value)} placeholder="v0.1.9" autoFocus />
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
  const tags = useMemo(() => [latest && "latest", stage && "stage"].filter(Boolean) as string[], [latest, stage]);
  return (
    <Modal
      open={open}
      onOpenChange={(next) => !next && onClose?.()}
      title="Bulk promote"
      description={`${selections.length} selected subgraph${selections.length === 1 ? "" : "s"}`}
      icon={<Rocket size={18} />}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button
            variant="primary"
            onClick={() => onSubmit({ selections, tags, mode, version, requireSynced, deleteDisplaced })}
            disabled={busy || tags.length === 0 || (mode === "specific" && !version.trim())}
          >
            {busy ? "Promoting..." : "Promote"}
          </Button>
        </>
      }
    >
      <div className="option-grid">
        <label><input type="checkbox" checked={latest} onChange={(e) => setLatest(e.currentTarget.checked)} /> latest</label>
        <label><input type="checkbox" checked={stage} onChange={(e) => setStage(e.currentTarget.checked)} /> stage</label>
      </div>
      <div className="radio-stack">
        <label><input type="radio" checked={mode === "specific"} onChange={() => setMode("specific")} /> Specific version</label>
        <label><input type="radio" checked={mode === "auto"} onChange={() => setMode("auto")} /> Auto: newest 100% synced per subgraph</label>
      </div>
      <Field label="Version" hint={mode === "auto" ? "Disabled in auto mode." : "The same version label is applied to every selected subgraph."}>
        <input className="input" value={version} disabled={mode === "auto"} onChange={(event) => setVersion(event.currentTarget.value)} placeholder="v0.1.9" />
      </Field>
      <div className="option-grid stacked">
        <label><input type="checkbox" checked={requireSynced} onChange={(e) => setRequireSynced(e.currentTarget.checked)} /> Require 100% sync before tagging</label>
        <label className="danger-text"><input type="checkbox" checked={deleteDisplaced} onChange={(e) => setDeleteDisplaced(e.currentTarget.checked)} /> Delete displaced versions</label>
      </div>
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
  const tags = Array.from(selected);
  return (
    <Modal
      open={open}
      onOpenChange={(next) => !next && onClose?.()}
      title="Promote version"
      description={`${state.base}/${state.version}`}
      icon={<Rocket size={18} />}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button variant="primary" disabled={busy || tags.length === 0} onClick={() => onSubmit(state.base, state.version, tags)}>
            {busy ? "Promoting..." : "Promote"}
          </Button>
        </>
      }
    >
      <div className="option-grid">
        {state.tags.map((tag) => (
          <label key={tag}>
            <input
              type="checkbox"
              checked={selected.has(tag)}
              onChange={(event) => {
                const next = new Set(selected);
                if (event.currentTarget.checked) next.add(tag);
                else next.delete(tag);
                setSelected(next);
              }}
            />
            {tag}
          </label>
        ))}
      </div>
    </Modal>
  );
}

function SelectionPreview({ selections }: { selections: Selection[] }) {
  return (
    <div className="selection-preview">
      {selections.map((selection) => (
        <div key={`${selection.chain}|${selection.module}`} className="selection-row">
          <code>{selection.base || selection.chain}</code>
          <span>{selection.chain} · {selection.module}</span>
        </div>
      ))}
    </div>
  );
}
