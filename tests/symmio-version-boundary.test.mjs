import assert from "node:assert/strict"
import { readdirSync, readFileSync } from "node:fs"
import test from "node:test"

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8")

// The Graph's endBlock is inclusive. If one version's endBlock equals the next version's
// startBlock on the same address, the boundary block is indexed by BOTH data sources and
// every unchanged-signature event in it double-counts analytics aggregates.
test("chained symmio versions never share a boundary block (endBlock is inclusive)", () => {
	for (const file of readdirSync(new URL("../configs/perps/", import.meta.url))) {
		if (!file.endsWith(".json")) continue
		const config = JSON.parse(read(`configs/perps/${file}`))
		const cores = (config.contracts ?? []).filter((contract) => contract.abi === "symmio")
		const byAddress = new Map()
		for (const core of cores) {
			const key = core.address.toLowerCase()
			if (!byAddress.has(key)) byAddress.set(key, [])
			byAddress.get(key).push(core)
		}
		for (const [address, entries] of byAddress) {
			const starts = new Set(entries.map((entry) => Number(entry.startBlock)))
			for (const entry of entries) {
				if (entry.endBlock === undefined) continue
				assert.ok(
					!starts.has(Number(entry.endBlock)),
					`${file}: symmio ${entry.version} at ${address} ends at ${entry.endBlock}, where another version starts — the boundary block would be double-indexed`,
				)
			}
		}
	}
})
