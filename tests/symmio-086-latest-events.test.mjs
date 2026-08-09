import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const latestEventSignatures = [
	"AdjustmentCancelled(uint256,uint256)",
	"AdjustmentScheduled(uint256,uint256,uint256,uint256)",
	"CloseSolverFeeCharged(uint256,address,address,address,uint256,uint256)",
	"OpenSolverFeeCharged(uint256,address,address,address,uint256,uint256)",
	"PartyAReimbursementChange(address,uint256,uint256,uint8)",
	"PendingQuoteCancelledByAdjustment(uint256,uint256)",
	"PriceAdjustmentConfirmed(uint256,uint256,uint256)",
	"QuoteAdjusted(uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256)",
	"RestatementAborted(uint256,uint256)",
	"RestatementFinalized(uint256,uint256)",
	"RestatementStarted(uint256,uint256,uint256)",
	"SetPartyBStrictDeallocation(address,bool)",
	"SetSolverFeeReceiver(address,address)",
	"SettlePartyALiquidation(address,address[],address[],int256[],uint256[],bytes)",
];

function canonicalType(input) {
	if (!input.type.startsWith("tuple")) return input.type;
	return `(${(input.components ?? []).map(canonicalType).join(",")})${input.type.slice(5)}`;
}

function eventSignature(entry) {
	return `${entry.name}(${entry.inputs.map(canonicalType).join(",")})`;
}

test("checked-in v0.8.6 ABI contains the latest event surface and drops obsolete solver-fee payloads", () => {
	const abi = JSON.parse(read("configs/abis/symmio_0_8_6.json"));
	const signatures = new Set(abi.filter(entry => entry.type === "event").map(eventSignature));
	for (const signature of latestEventSignatures) assert.ok(signatures.has(signature), `missing ${signature}`);
	assert.equal(signatures.has("OpenSolverFeeCharged(uint256,address,address,uint256,uint256)"), false);
	assert.equal(signatures.has("CloseSolverFeeCharged(uint256,address,address,uint256,uint256)"), false);
});

test("analytics tracks settlement reasons and exact reimbursement state", () => {
	const constants = read("perps/analytics/utils/constants.ts");
	const reimbursement = read("perps/analytics/handlers/symmio/PartyAReimbursementChangeHandler.ts");
	const balanceHandler = read("perps/analytics/handlers/symmio/BalanceChangePartyAHandler.ts");
	assert.match(constants, /SETTLEMENT_PNL_IN/);
	assert.match(constants, /SETTLEMENT_PNL_OUT/);
	assert.match(reimbursement, /event\.params\.newBalance/);
	assert.doesNotMatch(balanceHandler, /addPartyALiquidationReimbursement/);
});

test("analytics persists symbol restatements and refreshes rewritten quote state", () => {
	const quoteHandler = read("perps/analytics/handlers/symmio/QuoteAdjustedHandler.ts");
	const pendingHandler = read("perps/analytics/handlers/symmio/PendingQuoteCancelledByAdjustmentHandler.ts");
	const settleHandler = read("perps/common/handlers/symmio/SettlePartyALiquidationHandler.ts");
	assert.match(quoteHandler, /getQuoteData/);
	assert.match(quoteHandler, /onQuoteAdjustment/);
	assert.match(quoteHandler, /quote\.lastAdjustmentEpoch/);
	assert.match(pendingHandler, /QuoteStatus\.EXPIRED/);
	assert.match(settleHandler, /allocationKeys/);
	assert.match(settleHandler, /cvaAmounts/);
	assert.match(read("perps/analytics/handlers/symmio/RestatementStartedHandler.ts"), /adjustmentEffectiveTimestamp/);
	assert.match(read("perps/analytics/handlers/symmio/RestatementFinalizedHandler.ts"), /ADJUSTMENT_STATE_PRICE_ADJUSTED/);
});

test("analytics mirrors every core pending-quote removal during a restatement", () => {
	const adjustmentUtils = read("perps/analytics/utils/symbolAdjustment.ts");
	assert.match(adjustmentUtils, /symbol\.restating != true/);

	for (const eventName of ["ExpireQuoteOpen", "AcceptCancelRequest", "ForceCancelQuote"]) {
		const handler = read(`perps/analytics/handlers/symmio/${eventName}Handler.ts`);
		assert.match(handler, /markSymbolRestatementMutation\(_event, quote\.symbolId!\)/, `${eventName} must mark quote removal`);
	}

	const requestHandler = read("perps/analytics/handlers/symmio/RequestToCancelQuoteHandler.ts");
	assert.match(requestHandler, /event\.params\.quoteStatus == QuoteStatus\.CANCELED/);
	assert.match(requestHandler, /markSymbolRestatementMutation\(_event, quote\.symbolId!\)/);
});

test("analytics refreshes the exact solver-fee receiver balance", () => {
	const deps = read("perps/analytics/deps_symmio_0_8_6.json");
	for (const eventName of ["OpenSolverFeeCharged", "CloseSolverFeeCharged"]) {
		const handler = read(`perps/analytics/handlers/symmio/${eventName}Handler.ts`);
		assert.match(handler, /event\.params\.receiver/);
		assert.match(handler, /updatePartyALatestBalance/);
		assert.equal(deps.includes(`${eventName}(uint256,address,address,address,uint256,uint256)`), true);
	}
});

test("raw events retain new receiver and extended settlement payload fields", () => {
	const schema = read("perps/events/schema.graphql");
	const settle = read("perps/events/handlers/symmio/SettlePartyALiquidationHandler.ts");
	const openFee = read("perps/events/handlers/symmio/OpenSolverFeeChargedHandler.ts");
	assert.match(schema, /type PartyAReimbursementChange @entity/);
	assert.match(schema, /type QuoteAdjusted @entity/);
	assert.match(schema, /allocationKeys: \[Bytes!\]/);
	assert.match(schema, /cvaAmounts: \[BigInt!\]/);
	assert.match(settle, /parameters\[4\]\.value\.toBigIntArray/);
	assert.match(openFee, /entity\.receiver = event\.params\.receiver/);
});
