import assert from "node:assert/strict"
import fs from "node:fs"
import test from "node:test"

import { decodeLog, encodeEventSignature } from "web3-eth-abi"

const topic = "0x7780f93c971cd1606061c36c86dad2d52adb24ee0b5e4cf13a65db69e6de2569"
const data =
	"0x0000000000000000000000000000000000000000000000000000000000000004" +
	"000000000000000000000000e57703b59878ed53599492cbac7fa34ae4d7b431" +
	"000000000000000000000000ed85c23e307e0f40cc38d6aa42fe25e0a5d07ea7" +
	"000000000000000000000000000000000000000000000000f2dc7d47f1560000" +
	"000000000000000000000000000000000000000000000000008b7d09257e6800" +
	"0000000000000000000000000000000000000000000000000000000000000004"

test("Base block 2272647 OpenPosition log matches the configured v0.8.0 ABI", () => {
	const abi = JSON.parse(fs.readFileSync("configs/abis/symmio_0_8_0.json", "utf8"))
	const event = abi.find((item) => item.type === "event" && encodeEventSignature(item) === topic)
	const handler = fs.readFileSync("perps/events/handlers/symmio/OpenPositionHandler.ts", "utf8")

	assert.ok(event, "the deployed event topic must exist in the configured v0.8.0 ABI")
	assert.doesNotThrow(() => decodeLog(event.inputs, data, []), "the captured event data must decode with that ABI")
	assert.equal(event.inputs[5].type, "uint8", "the captured sixth parameter is the legacy quote status")
	assert.match(handler, /\.value\.kind\s*==\s*ethereum\.ValueKind\.TUPLE/, "the handler must inspect the sixth value's runtime kind before tuple conversion")
})
