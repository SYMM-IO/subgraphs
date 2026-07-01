import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8")

const overloads = [
	{
		name: "Deposit",
		signature: "Deposit(address,address,uint256)",
	},
	{
		name: "SendQuote",
		signature:
			"SendQuote(address,uint256,address[],uint256,uint8,uint8,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256)",
	},
	{
		name: "OpenPosition",
		signature: "OpenPosition(uint256,address,address,uint256,uint256)",
	},
	{
		name: "FillCloseRequest",
		signature: "FillCloseRequest(uint256,address,address,uint256,uint256,uint8,uint256)",
	},
	{
		name: "LiquidatePositionsPartyA",
		signature: "LiquidatePositionsPartyA(address,address,uint256[],uint256[],uint256[],bytes)",
	},
	{
		name: "LiquidatePositionsPartyB",
		signature: "LiquidatePositionsPartyB(address,address,address,uint256[],uint256[],uint256[])",
	},
]

test("v0.8.6 analytics dependencies select new overloaded core event signatures only", () => {
	const deps = JSON.parse(read("perps/analytics/deps_symmio_0_8_6.json"))
	const events = new Set(Object.values(deps).flat())

	for (const { name, signature } of overloads) {
		assert.ok(events.has(signature), `v0.8.6 deps must include ${signature}`)
		assert.equal(events.has(name), false, `v0.8.6 deps must not use bare overloaded ${name}`)
	}
})

test("v0.8.6 analytics source wires the new overloaded core event handlers", () => {
	const source = read("perps/analytics/src_symmio_0_8_6.ts")

	for (const { name } of overloads) {
		assert.match(source, new RegExp(`${name}Handler`), `missing ${name} handler import`)
		assert.match(source, new RegExp(`export function handle${name}\\(event: ${name}\\)`), `missing handle${name}`)
		assert.doesNotMatch(source, new RegExp(`${name}1`), `must not wire legacy ${name} overload through v0.8.6`)
	}
})

const duplicatedHyperEvmEvents = [
	"BalanceChangePartyA",
	"BalanceChangePartyB",
	"Deposit",
	"SendQuote",
	"OpenPosition",
	"FillCloseRequest",
	"LiquidatePositionsPartyA",
	"LiquidatePositionsPartyB",
]

test("HyperEVM mainnet analytics keeps the v0.8.5 core source only", () => {
	const config = JSON.parse(read("configs/perps/hyperevm.json"))
	const coreVersions = config.contracts
		.filter((contract) => contract.abi === "symmio")
		.map((contract) => contract.version)

	assert.deepEqual(coreVersions, ["0_8_5"])
	assert.equal(config.deploy_urls["perps/analytics"], "hyperevm_mainnet_analytics")

	const legacyCore = config.contracts.find((contract) => contract.abi === "symmio" && contract.version === "0_8_5")
	assert.ok(legacyCore, "missing legacy core data source")
	assert.equal(legacyCore.excludedEvents, undefined, "mainnet v0.8.5 must not drop core lifecycle events")
})

test("HyperEVM v0.8.6 wiring is limited to stage and must suppress duplicated legacy events", () => {
	const mainnet = JSON.parse(read("configs/perps/hyperevm.json"))
	const stage = JSON.parse(read("configs/perps/hyperevm_stage.json"))

	assert.equal(
		mainnet.contracts.some((contract) => contract.abi === "symmio" && contract.version === "0_8_6"),
		false,
		"mainnet HyperEVM must not use v0.8.6",
	)

	const stageCore086 = stage.contracts.find((contract) => contract.abi === "symmio" && contract.version === "0_8_6")
	if (!stageCore086) return

	assert.equal(stage.deploy_urls["perps/analytics"], "hyperevm_analytics")

	const stageLegacy = stage.contracts.find((contract) => contract.abi === "symmio" && contract.version === "0_8_5")
	assert.ok(stageLegacy, "stage v0.8.6 needs the legacy source for old-only events")
	const excludedEvents = new Set(stageLegacy.excludedEvents)
	for (const eventName of duplicatedHyperEvmEvents) {
		assert.ok(excludedEvents.has(eventName), `stage legacy source must exclude duplicated ${eventName}`)
	}
})
