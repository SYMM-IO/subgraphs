import { readFileSync } from "node:fs"
import { test } from "node:test"
import assert from "node:assert/strict"

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8")

test("analytics WithdrawRequest persists providerData from WithdrawInitiated", () => {
	const schema = read("perps/analytics/schema.graphql")
	const handler = read("perps/analytics/handlers/symmio/WithdrawInitiatedHandler.ts")

	assert.match(schema, /providerData: Bytes!/, "WithdrawRequest should expose providerData")
	assert.match(handler, /wr\.providerData = event\.params\.providerData/, "WithdrawInitiated should persist providerData")
})
