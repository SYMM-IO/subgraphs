import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { parse } from "graphql";

const read = path => readFileSync(path, "utf8");

test("Base events config indexes the deployed BuyBack Gateway from its V2 upgrade block", () => {
	const config = JSON.parse(read("configs/perps/base.json"));
	const gateway = config.contracts.find(contract => contract.abi === "buybackGateway");

	assert.deepEqual(gateway, {
		address: "0x9EB845715461832eF9b063e47187dE9312dD6550",
		abi: "buybackGateway",
		version: "1",
		startBlock: "48786721",
		name: "symmio_buyback_gateway",
	});
});

test("BuyBack Gateway ABI exposes only V2 funnel events", () => {
	const abi = JSON.parse(read("configs/abis/buybackGateway_1.json"));
	const events = new Map(abi.filter(entry => entry.type === "event").map(entry => [entry.name, entry]));

	assert.deepEqual([...events.keys()].sort(), ["BuybackExecuted", "Deposited"]);
	assert.equal(events.has("SwapExecuted"), false);
});

test("BuyBack Gateway schema exposes recent activity and funnel aggregates", () => {
	const document = parse(read("perps/events/schema.graphql"), { noLocation: true });
	const types = new Map(
		document.definitions
			.filter(definition => definition.kind === "ObjectTypeDefinition")
			.map(definition => [definition.name.value, new Set(definition.fields.map(field => field.name.value))]),
	);

	assert.ok(types.get("BuybackDeposit").has("depositSource"));
	assert.ok(types.get("Buyback").has("settlementMode"));
	assert.ok(types.get("BuybackGatewayStats").has("totalDeposited"));
	assert.ok(types.get("BuybackGatewayStats").has("totalAmountIn"));
	assert.ok(types.get("BuybackGatewayStats").has("totalAmountOut"));
	assert.ok(types.get("BuybackDay").has("dayStart"));
});

test("V2 handler updates normalized buyback aggregates", () => {
	const v2Handler = read("perps/events/handlers/buybackGateway/BuybackExecutedHandler.ts");

	assert.match(v2Handler, /new Buyback\(/);
	assert.match(v2Handler, /stats\.totalAmountIn/);
	assert.match(v2Handler, /stats\.totalAmountOut/);
	assert.match(v2Handler, /day\.buybackCount/);
	assert.doesNotMatch(v2Handler, /eventVersion/);
});

test("analytics exposes the same BuyBack Gateway funnel models and V2 handlers", () => {
	const document = parse(read("perps/analytics/schema.graphql"), { noLocation: true });
	const typeNames = new Set(
		document.definitions.filter(definition => definition.kind === "ObjectTypeDefinition").map(definition => definition.name.value),
	);
	const deps = JSON.parse(read("perps/analytics/deps_buybackGateway_1.json"));
	const source = read("perps/analytics/src_buybackGateway_1.ts");

	assert.ok(typeNames.has("BuybackDeposit"));
	assert.ok(typeNames.has("Buyback"));
	assert.ok(typeNames.has("BuybackGatewayStats"));
	assert.ok(typeNames.has("BuybackDay"));
	assert.deepEqual(deps.Buyback, ["BuybackExecuted"]);
	assert.doesNotMatch(JSON.stringify(deps), /SwapExecuted/);
	assert.match(source, /handleBuybackExecuted/);
	assert.match(source, /handleDeposited/);
});
