export type ToastKind = "ok" | "err"

export type Deployment = {
	base_name: string
	version: string
	status: string
	synced: string
	blocks_from: number | null
	blocks_to: number | null
	chain_network: string
}

export type FleetModule = {
	module: string
	module_short: string
	base: string
	deployments: Deployment[]
	tags: Record<string, string>
}

export type FleetGroup = {
	chain: string
	network: string
	is_prod: boolean
	is_stage: boolean
	is_orphan: boolean
	logo_url: string | null
	modules: FleetModule[]
}

export type FleetSummary = {
	chains: number
	rows: number
	deployments: number
	tags: number
	multi_version: number
	attention: number
}

export type JobStatus = "queued" | "running" | "done" | "failed"

export type JobView = {
	id: string
	label: string
	kind: string
	status: JobStatus
	rc: number | null
	elapsed: string
	ago: string
	step_current: number
	step_total: number
	current_step_label: string
	completed_steps: number
	progress_percent: number
	line_count: number
	tail_text: string
}

export type FleetPayload = {
	groups: FleetGroup[]
	summary: FleetSummary
	modules: string[]
	prodChains: string[]
	stageChains: string[]
	goldskyProject: string
	lastFetchedAt: number
	lastFetchedLabel: string
	lastError: string
	jobs: JobView[]
}

export type ApiToast = {
	kind: ToastKind
	title: string
	body: string
}

export type ApiActionResponse = {
	toast: ApiToast
	fleet: FleetPayload
	jobs: JobView[]
}

export type Selection = {
	chain: string
	module: string
	base: string
	orphan: boolean
}
