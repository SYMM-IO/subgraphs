import { Activity, CheckCircle2, CircleDashed, XCircle } from "lucide-react";
import clsx from "clsx";
import type { JobView } from "../types/fleet";
import { Pill } from "./ui";

function statusIcon(status: JobView["status"]) {
  if (status === "running") return <CircleDashed size={16} className="spin-slow" aria-hidden="true" />;
  if (status === "done") return <CheckCircle2 size={16} aria-hidden="true" />;
  if (status === "failed") return <XCircle size={16} aria-hidden="true" />;
  return <Activity size={16} aria-hidden="true" />;
}

export function ActivityRail({ jobs, compact = false }: { jobs: JobView[]; compact?: boolean }) {
  const running = jobs.filter((job) => job.status === "running").length;
  return (
    <section className={clsx("activity-rail", compact && "activity-modal-list")}>
      <header className="rail-header">
        <div>
          <span className="eyebrow">Activity</span>
          <h2>Action history</h2>
        </div>
        <span className="rail-count">{running ? `${running} running · ` : ""}{jobs.length} total</span>
      </header>
      <div className="rail-list">
        {jobs.length === 0 ? (
          <div className="rail-empty">
            <Activity size={22} aria-hidden="true" />
            <strong>No activity yet</strong>
            <span>Deployment, promotion, and cleanup progress will appear here.</span>
          </div>
        ) : (
          jobs.map((job) => (
            <article key={job.id} className={clsx("job-card", `job-${job.status}`)}>
              <div className="job-icon">{statusIcon(job.status)}</div>
              <div className="job-body">
                <div className="job-title">{job.label}</div>
                <div className="job-meta">
                  <Pill tone={job.kind === "delete" || job.kind === "untag" ? "red" : job.status === "running" ? "yellow" : "gray"}>
                    {job.kind}
                  </Pill>
                  <span>{job.status === "running" ? `running · ${job.elapsed}` : `${job.status} · ${job.elapsed}`}</span>
                  {job.ago ? <span>{job.ago}</span> : null}
                </div>
                {job.step_total ? (
                  <div className="job-progress">
                    <div className="job-progress-top">
                      <span>Step {job.step_current} of {job.step_total}</span>
                      <span>{job.completed_steps}/{job.step_total} done</span>
                    </div>
                    <div
                      className="job-progress-bar"
                      role="progressbar"
                      aria-label={`Progress for ${job.label}`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={job.progress_percent}
                    >
                      <div style={{ width: `${job.progress_percent}%` }} />
                    </div>
                    {job.current_step_label ? <div className="job-step">{job.current_step_label}</div> : null}
                  </div>
                ) : null}
                {job.tail_text ? (
                  <details className="job-log">
                    <summary>{job.line_count} log lines</summary>
                    <pre>{job.tail_text}</pre>
                  </details>
                ) : null}
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
