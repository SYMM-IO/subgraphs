import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { parse } from "graphql";

const root = process.cwd();

function read(relativePath) {
	return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function getType(document, name) {
	return document.definitions.find(definition => definition.kind === "ObjectTypeDefinition" && definition.name.value === name);
}

function getField(type, name) {
	return type.fields.find(field => field.name.value === name);
}

test("LiquidationDetail stores liquidation-start reserve buckets and loss rest level", () => {
	const schema = parse(read("perps/analytics/schema.graphql"), { noLocation: true });
	const type = getType(schema, "LiquidationDetail");
	const loader = read("perps/common/VersionedQuoteLoader.ts");

	for (const fieldName of ["freeBalance", "freeMarginAtStart", "lockedCva", "lockedLf", "lockedPartyAmm", "lockedPartyBmm", "lossRestsAt"]) {
		const field = getField(type, fieldName);
		assert.ok(field, `LiquidationDetail.${fieldName} should exist`);
		assert.equal(field.type.kind, "NamedType", `${fieldName} should be nullable for historical rows`);
		assert.equal(field.type.name.value, "BigInt");
	}

	assert.match(loader, /export function getPartyABalanceInfoData/);
	assert.match(loader, /case Version\.v_0_8_6:/);

	for (const path of [
		"perps/common/handlers/symmio/LiquidatePartyAHandlerWithAccount.ts",
		"perps/common/handlers/symmio/DeferredLiquidatePartyAHandler.ts",
	]) {
		const source = read(path);
		assert.match(source, /getPartyABalanceInfoData/, `${path} should read PartyA balance buckets`);
		assert.match(source, /entity\.lockedCva\s*=\s*balanceInfo\.lockedCva/, `${path} should persist locked CVA`);
		assert.match(source, /entity\.lockedLf\s*=\s*balanceInfo\.lockedLf/, `${path} should persist locked LF`);
		assert.match(source, /entity\.lossRestsAt\s*=\s*calculateLossRestsAt/, `${path} should persist the signed loss rest level`);
	}
});

test("LiquidationDetail stores per-PartyB settlement ledger snapshots", () => {
	const schema = parse(read("perps/analytics/schema.graphql"), { noLocation: true });
	const type = getType(schema, "LiquidationDetail");
	const liquidatePositions = read("perps/analytics/handlers/symmio/LiquidatePositionsPartyAHandler.ts");
	const settle = read("perps/common/handlers/symmio/SettlePartyALiquidationHandler.ts");
	const utility = read("perps/common/utils/liquidationDetail.ts");

	for (const fieldName of [
		"settlementPartyBs",
		"settlementModes",
		"settlementExpectedAmounts",
		"settlementActualAmounts",
		"settlementCvaReturned",
		"settlementReserveContributions",
		"settlementStates",
	]) {
		assert.ok(getField(type, fieldName), `LiquidationDetail.${fieldName} should exist`);
	}

	assert.match(liquidatePositions, /upsertSettlementSnapshot/);
	assert.match(liquidatePositions, /calculateQuoteSettlementActualAmount/);
	assert.match(liquidatePositions, /calculateQuoteSettlementCva/);
	assert.match(liquidatePositions, /getPartyBSettlementMode/);
	assert.match(liquidatePositions, /"pending"/);

	assert.match(settle, /upsertSettlementSnapshot/);
	assert.match(settle, /getPartyBSettlementMode/);
	assert.match(settle, /"settled"/);
	assert.match(utility, /getPositiveCrossReserveContribution/);
});

test("LiquidationDetail stores PartyA settlement balance accounting", () => {
	const schema = parse(read("perps/analytics/schema.graphql"), { noLocation: true });
	const type = getType(schema, "LiquidationDetail");
	const loader = read("perps/common/VersionedQuoteLoader.ts");
	const settle = read("perps/common/handlers/symmio/SettlePartyALiquidationHandler.ts");

	for (const fieldName of ["reimbursement", "deferredBalance", "liquidationEscrow"]) {
		const field = getField(type, fieldName);
		assert.ok(field, `LiquidationDetail.${fieldName} should exist`);
		assert.equal(field.type.kind, "NamedType", `${fieldName} should be nullable for versions without a safe read surface`);
		assert.equal(field.type.name.value, "BigInt");
	}

	assert.match(loader, /export function getPartyASettlementBalanceData/);
	assert.match(loader, /partyAReimbursement_0_8_6/);
	assert.match(loader, /getPartyADeferredBalance_0_8_6/);
	assert.match(loader, /getLiquidationEscrow_0_8_6/);
	assert.match(settle, /getPartyASettlementBalanceData/);
	assert.match(settle, /applyPartyASettlementBalanceData/);
});

test("LiquidationEvent stores account-level liquidation lifecycle steps", () => {
	const schema = parse(read("perps/analytics/schema.graphql"), { noLocation: true });
	const liquidationDetail = getType(schema, "LiquidationDetail");
	const eventType = getType(schema, "LiquidationEvent");
	assert.ok(eventType, "LiquidationEvent type should exist");

	for (const fieldName of ["id", "source", "liquidationId", "liquidationDetail", "type", "metadata", "timestamp", "blockNumber", "transaction"]) {
		assert.ok(getField(eventType, fieldName), `LiquidationEvent.${fieldName} should exist`);
	}

	const eventsField = getField(liquidationDetail, "events");
	assert.ok(eventsField, "LiquidationDetail.events should exist");
	assert.ok(
		eventsField.directives.some(directive => directive.name.value === "derivedFrom"),
		"LiquidationDetail.events should be derived",
	);

	const utility = read("perps/analytics/utils/liquidationEvent.ts");
	assert.match(utility, /export function createLiquidationEvent/);
	assert.match(utility, /new LiquidationEvent/);

	const handlers = [
		["perps/analytics/handlers/symmio/LiquidatePartyAHandler.ts", "LIQUIDATE_PARTY_A"],
		["perps/analytics/handlers/symmio/DeferredLiquidatePartyAHandler.ts", "LIQUIDATE_PARTY_A"],
		["perps/analytics/handlers/symmio/SetSymbolsPricesHandler.ts", "SET_SYMBOLS_PRICE"],
		["perps/analytics/handlers/symmio/LiquidatePendingPositionsPartyAHandler.ts", "LIQUIDATE_PENDING_POSITIONS"],
		["perps/analytics/handlers/symmio/LiquidatePositionsPartyAHandler.ts", "LIQUIDATE_POSITIONS"],
		["perps/analytics/handlers/symmio/LiquidationDisputedHandler.ts", "LIQUIDATION_DISPUTED"],
		["perps/analytics/handlers/symmio/ResolveLiquidationDisputeHandler.ts", "RESOLVE_DISPUTE"],
		["perps/analytics/handlers/symmio/TakeoverPartyALiquidationHandler.ts", "TAKEOVER"],
		["perps/analytics/handlers/symmio/AutoTakeoverPartyALiquidationHandler.ts", "AUTO_TAKEOVER"],
		["perps/analytics/handlers/symmio/SettlePartyALiquidationHandler.ts", "SETTLE_PARTY_A"],
		["perps/analytics/handlers/symmio/FullyLiquidatedPartyAHandler.ts", "FULLY_LIQUIDATED"],
	];

	for (const [handlerPath, eventTypeName] of handlers) {
		const source = read(handlerPath);
		assert.match(source, /createPartyALiquidationEvent/, `${handlerPath} should append a LiquidationEvent`);
		assert.match(source, new RegExp(`"${eventTypeName}"`), `${handlerPath} should write ${eventTypeName}`);
	}
});
