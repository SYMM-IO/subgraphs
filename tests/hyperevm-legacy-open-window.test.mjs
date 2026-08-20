import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const readJson = (path) => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), "utf8"))

const LEGACY_OPEN_POSITION_TOPIC = "0xa50f98254710514f60327a4e909cd0be099a62f316299907ef997f3dc4d1cda5"
const ENRICHED_OPEN_POSITION_TOPIC = "0x526b2eb0e326bc3b704377ec9249776a1464d7ac8a4fa8b578ec152e26db8631"

const RECEIPT_FIXTURES = [
	{
		name: "reported quote 31",
		blockNumber: 30183591,
		topics: [LEGACY_OPEN_POSITION_TOPIC, ENRICHED_OPEN_POSITION_TOPIC],
	},
	{
		name: "last dual-emission quote 84",
		blockNumber: 30229945,
		topics: [LEGACY_OPEN_POSITION_TOPIC, ENRICHED_OPEN_POSITION_TOPIC],
	},
	{
		name: "first legacy-only quote 85",
		blockNumber: 30230554,
		topics: [LEGACY_OPEN_POSITION_TOPIC],
	},
	{
		name: "first post-window quote 476",
		blockNumber: 30584860,
		topics: [LEGACY_OPEN_POSITION_TOPIC, ENRICHED_OPEN_POSITION_TOPIC],
	},
]

function sourceIncludesBlock(source, blockNumber) {
	const startsBeforeOrAtBlock = Number(source.startBlock) <= blockNumber
	const endsAfterOrAtBlock = source.endBlock === undefined || blockNumber <= Number(source.endBlock)
	return startsBeforeOrAtBlock && endsAfterOrAtBlock
}

test("HyperEVM stage normalizes each OpenPosition compatibility pair exactly once", () => {
	const config = readJson("configs/perps/hyperevm_stage.json")
	const core = config.contracts.find((contract) => contract.abi === "symmio")
	const legacyOpen = config.contracts.find((contract) => contract.abi === "symmioLegacyOpen")

	assert.ok(core, "expected the primary HyperEVM stage SYMMIO source")
	assert.ok(legacyOpen, "expected the legacy OpenPosition compatibility source")
	assert.equal(legacyOpen.address.toLowerCase(), core.address.toLowerCase())

	for (const fixture of RECEIPT_FIXTURES) {
		const primaryHandlerCalls = fixture.topics.includes(ENRICHED_OPEN_POSITION_TOPIC) ? 1 : 0
		const legacyHandlerCalls =
			sourceIncludesBlock(legacyOpen, fixture.blockNumber) && fixture.topics.includes(LEGACY_OPEN_POSITION_TOPIC) ? 1 : 0

		assert.equal(
			primaryHandlerCalls + legacyHandlerCalls,
			1,
			`${fixture.name} at block ${fixture.blockNumber} would invoke ${primaryHandlerCalls + legacyHandlerCalls} OpenPosition handlers`,
		)
	}

	assert.equal(legacyOpen.startBlock, "30230554", "legacy indexing must begin with the first legacy-only OpenPosition")
	assert.equal(legacyOpen.endBlock, "30584859", "legacy indexing must end before dual emission resumes")
})
