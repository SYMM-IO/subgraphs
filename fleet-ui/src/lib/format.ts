import type { Deployment, FleetGroup, FleetModule, Selection } from "../types/fleet"

export function rowKey(group: FleetGroup, row: FleetModule): string {
	return `${group.chain}|${row.module}`
}

export function toSelection(group: FleetGroup, row: FleetModule): Selection {
	return {
		chain: group.chain,
		module: row.module,
		base: row.base,
		orphan: group.is_orphan,
		managed_pipelines: row.managed_pipelines,
	}
}

export function deploymentHealth(deployment: Deployment): "healthy" | "warn" | "failed" {
	const status = deployment.status.toLowerCase()
	if (status.includes("failed")) return "failed"
	if (deployment.synced !== "100%" || !status.includes("healthy")) return "warn"
	return "healthy"
}

export function latestSyncedVersion(row: FleetModule): string {
	const synced = row.deployments.filter(deployment => deployment.synced === "100%")
	return (synced.at(-1) ?? row.deployments.at(-1))?.version ?? ""
}

export function searchableText(group: FleetGroup, row: FleetModule): string {
	const deployments = row.deployments.map(d => `${d.version} ${d.status} ${d.synced}`).join(" ")
	const tags = Object.entries(row.tags)
		.map(([tag, version]) => `${tag} ${version}`)
		.join(" ")
	const pipelines = row.managed_pipelines.map(pipeline => pipeline.name).join(" ")
	return `${group.chain} ${group.network} ${row.module} ${row.module_short} ${row.base} ${deployments} ${tags} ${pipelines}`.toLowerCase()
}
