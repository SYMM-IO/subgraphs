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
