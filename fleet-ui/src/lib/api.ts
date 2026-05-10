import type { ApiActionResponse, FleetPayload, JobView, Selection } from "../types/fleet"

async function readJson<T>(response: Response): Promise<T> {
	const payload = (await response.json()) as T
	if (!response.ok) {
		const maybeDetail = payload as { detail?: string; toast?: { title?: string; body?: string } }
		const message = maybeDetail.toast?.body || maybeDetail.toast?.title || maybeDetail.detail || response.statusText
		throw new Error(message)
	}
	return payload
}

async function apiPost<T>(path: string, body?: unknown): Promise<T> {
	const response = await fetch(path, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body ?? {}),
	})
	return readJson<T>(response)
}

export async function fetchFleet(): Promise<FleetPayload> {
	return readJson<FleetPayload>(await fetch("/api/fleet"))
}

export async function refreshFleet(): Promise<ApiActionResponse> {
	return apiPost<ApiActionResponse>("/api/refresh")
}

export async function fetchJobs(): Promise<JobView[]> {
	const data = await readJson<{ jobs: JobView[] }>(await fetch("/api/jobs"))
	return data.jobs
}

export async function deployChains(input: { module: string; version: string; chains: string[] }): Promise<ApiActionResponse> {
	return apiPost<ApiActionResponse>("/api/deploy", input)
}

export async function bulkDeploy(input: { version: string; selections: Selection[] }): Promise<ApiActionResponse> {
	return apiPost<ApiActionResponse>("/api/bulk-deploy", input)
}

export async function bulkPromote(input: {
	selections: Selection[]
	tags: string[]
	mode: "specific" | "auto"
	version: string
	requireSynced: boolean
	deleteDisplaced: boolean
}): Promise<ApiActionResponse> {
	return apiPost<ApiActionResponse>("/api/bulk-promote", input)
}

export async function removeTag(input: { base: string; version: string; tag: string }): Promise<ApiActionResponse> {
	return apiPost<ApiActionResponse>("/api/remove-tag", input)
}

export async function deleteVersion(input: { base: string; version: string }): Promise<ApiActionResponse> {
	return apiPost<ApiActionResponse>("/api/delete-version", input)
}

export async function rowPromote(input: { base: string; version: string; tags: string[] }): Promise<ApiActionResponse> {
	return apiPost<ApiActionResponse>("/api/row-promote", input)
}

export function endpointUrl(project: string, base: string, versionOrTag: string): string {
	return `https://api.goldsky.com/api/public/${project}/subgraphs/${base}/${versionOrTag}/gn`
}
