import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const schema = read("perps/events/schema.graphql");

const releaseOnlyPayloads = {
	AccumulatedFundingStateUpdated: [
		"symbolId",
		"partyB",
		"currentLongRate",
		"currentShortRate",
		"accumulatedLongRate",
		"accumulatedShortRate",
		"lastUpdatedEpoch",
		"lastUpdatedTimeStamp",
		"startEpochTimeStamp",
		"startEpoch",
		"epochDuration",
		"snapshotLongFee",
		"snapshotShortFee",
	],
	CancelAffiliateShutdown: ["affiliate"],
	ClearingHouseAccountSettlement: ["subject", "account", "allocationKey", "amount"],
	ClearingHouseSettlementComponent: ["subject", "account", "symbolId", "allocationKey", "realizedPnl", "funding", "platformFee"],
	CloseAffiliatePositions: ["affiliate", "quoteIds", "closedAmounts", "prices"],
	DistributeFromLiquidationEscrow: ["partyA", "receivers", "allocationKeys", "amounts"],
	LiquidationEscrowCreated: ["partyA", "liquidationId", "amount"],
	LiquidationFundingSettled: [
		"partyA",
		"partyB",
		"allocationKey",
		"rawFunding",
		"settledFunding",
		"rawPnl",
		"settledPnl",
		"scaleNumerator",
		"scaleDenominator",
		"liquidationId",
	],
	LiquidationFundingSettlementAbandoned: ["partyA", "partyB", "rawFunding", "liquidationId"],
	OperationalFeeAllowanceReductionRequested: ["payer", "charger", "newAllowance", "readyAt"],
	OperationalFeeAllowanceSet: ["payer", "charger", "newAllowance"],
	OperationalFeeCharged: ["payer", "charger", "receiver", "amount"],
	OperationalFeeChargerRegistered: ["charger"],
	OperationalFeeChargerUnregistered: ["charger"],
	OperationalFeeMultiplierSet: ["payer", "charger", "feeMultiplier"],
	OperationalFeeReductionDelaySet: ["oldDelay", "newDelay"],
	PauseWithdrawAdvance: [],
	PartyALiquidationOvershootUsed: ["quoteId", "partyA", "partyB", "symbolId", "rate", "allowedShortfall", "actualShortfall"],
	QuoteFundingSettled: ["quoteId", "symbolId", "partyB", "partyA", "allocationKey", "funding"],
	QuoteLiquidationFundingCalculated: ["partyA", "partyB", "quoteId", "symbolId", "rawFunding", "rawPnl", "liquidationId"],
	RestatementFundingRestorationProgress: ["symbolId", "epoch", "finalizing", "processedPartyBs", "remainingPartyBs"],
	RestatementFundingRestorationStarted: ["symbolId", "epoch", "finalizing", "pendingPartyBs"],
	RestatementInventoryConsumed: ["symbolId", "epoch", "quoteId", "partyB", "positionType", "consumedAmount"],
	RestatementInventoryPrepared: [
		"symbolId",
		"epoch",
		"partyB",
		"partyBRemainingLongAmount",
		"partyBRemainingShortAmount",
		"totalRemainingLongAmount",
		"totalRemainingShortAmount",
	],
	RestatementPreparationCompleted: ["symbolId", "epoch", "totalRemainingLongAmount", "totalRemainingShortAmount", "pendingFundingPartyBCount"],
	RestatementPreparationProgress: [
		"symbolId",
		"epoch",
		"submittedPartyBCount",
		"newlyPreparedPartyBCount",
		"fundingCheckpointedPartyBCount",
		"totalRemainingLongAmount",
		"totalRemainingShortAmount",
		"pendingFundingPartyBCount",
	],
	ScheduleAffiliateShutdown: ["affiliate", "shutdownTime"],
	SendQuoteSolverFeeCaps: ["partyA", "quoteId", "openRateCap", "closeRateCap"],
	SetDeactiveInstantActionModeCooldown: ["oldCooldown", "newCooldown"],
	SetLegacyPartyALiquidationDeprecated: ["oldValue", "newValue"],
	SetMuonFunctionUpnlValidTime: ["func", "upnlValidTime"],
	SetOperationalFeeReceiver: ["charger", "receiver"],
	SetPartyALiquidationSnapshot: [
		"liquidator",
		"partyA",
		"partyBs",
		"symbolIds",
		"prices",
		"cumulativeLongFees",
		"cumulativeShortFees",
		"liquidationId",
	],
	SetPartyBOpenPositionsPausedForPartyB: ["partyB", "status"],
	SetPartyBLiquidationOvershootRate: ["partyB", "symbolId", "oldRate", "newRate", "hasOverride"],
	SetSolverFeeReceiverForTag: ["partyB", "receiver", "tag"],
	SetSymbolMinAcceptableNotionalLFRate: ["symbolId", "oldMinAcceptableNotionalLFRate", "newMinAcceptableNotionalLFRate", "hasOverride"],
	SolverFeeCharged: ["quoteId", "partyA", "partyB", "receiver", "symbolId", "feeType", "amount", "tag"],
	UnpauseWithdrawAdvance: [],
	WithdrawAdvanced: ["requestId", "user", "amount"],
};

test("every release-only v0.8.6 event has a full raw schema and handler payload", () => {
	for (const [eventName, fields] of Object.entries(releaseOnlyPayloads)) {
		const handler = read(`perps/events/handlers/symmio/${eventName}Handler.ts`);
		const schemaType = schema.match(new RegExp(`type ${eventName} @entity\\(immutable: true\\) \\{([\\s\\S]*?)\\n\\}`))?.[1];

		assert.ok(schemaType, `missing ${eventName} schema`);
		assert.match(handler, /setRawEventMetadata\(entity, _event\)/, `${eventName} must use shared immutable metadata`);
		for (const field of fields) {
			assert.match(schemaType, new RegExp(`\\n\\s*${field}:`), `${eventName}.${field} missing from schema`);
			assert.match(handler, new RegExp(`entity\\.${field}\\s*=`), `${eventName}.${field} is never stored`);
		}
	}
});

test("the shared raw-event adapter sets the complete immutable ordering metadata", () => {
	const helper = read("perps/events/handlers/symmio/rawEvent.ts");
	for (const field of ["source", "counterId", "blockNumber", "blockTimestamp", "transactionHash", "transactionIndex", "logIndex", "blockHash"]) {
		assert.match(helper, new RegExp(`entity\\.set\\(\"${field}\"`), `metadata adapter must set ${field}`);
	}
});

test("v0.8.6 canonical close and liquidation payloads retain ids, amounts, prices, and locked values", () => {
	const fill = read("perps/events/handlers/symmio/FillCloseRequestHandler.ts");
	const partyA = read("perps/events/handlers/symmio/LiquidatePositionsPartyAHandler.ts");
	const partyB = read("perps/events/handlers/symmio/LiquidatePositionsPartyBHandler.ts");
	const source = read("perps/events/src_symmio_0_8_6.ts");

	assert.match(fill, /parameters\.length >= 7[\s\S]*parameters\[6\]\.value\.toBigInt\(\)/);
	assert.match(fill, /parameters\.length >= 8[\s\S]*parameters\[7\]\.value\.toTuple\(\)/);
	assert.match(partyA, /entity\.closeIds = _event\.parameters\[4\]\.value\.toBigIntArray\(\)/);
	assert.match(partyA, /entity\.averageClosedPrices = _event\.parameters\[5\]\.value\.toBigIntArray\(\)/);
	assert.match(partyB, /entity\.closeIds = _event\.parameters\[5\]\.value\.toBigIntArray\(\)/);
	assert.match(partyB, /entity\.averageClosedPrices = _event\.parameters\[6\]\.value\.toBigIntArray\(\)/);
	for (const handler of ["FillCloseRequest1", "LiquidatePositionsPartyA1", "LiquidatePositionsPartyB1"]) {
		assert.match(source, new RegExp(`export function handle${handler}\\(event: ${handler}\\)`), `missing canonical ${handler}`);
	}
});

test("version-varying payloads use stable parameter adapters instead of brittle version switches", () => {
	const adaptedHandlers = [
		"AcceptCancelCloseRequest",
		"EmergencyClosePosition",
		"ForceCancelCloseRequest",
		"ForceClosePosition",
		"RequestToCancelCloseRequest",
		"RequestToClosePosition",
		"AddSymbol",
		"AllocateForPartyB",
		"AllocatePartyA",
		"DeallocateForPartyB",
		"DeallocatePartyA",
		"SetFeeCollector",
		"SetForceCloseGapRatio",
		"SetSymbolFundingState",
		"SetSymbolValidationState",
		"TransferAllocation",
		"DisputeForLiquidation",
		"FullyLiquidatedPartyA",
		"LiquidationDisputed",
		"ResolveLiquidationDispute",
		"SetSymbolsPrices",
		"LiquidatePartyA",
		"LiquidatePartyB",
		"LiquidatePendingPositionsPartyA",
		"SettlePartyALiquidation",
	];

	for (const eventName of adaptedHandlers) {
		const handler = read(`perps/events/handlers/symmio/${eventName}Handler.ts`);
		assert.match(handler, /_event\.parameters/, `${eventName} must read its stable raw parameter positions`);
		assert.doesNotMatch(handler, /switch \(version\)/, `${eventName} must not require a new branch for every release`);
	}
});

test("AcceptCancelRequest stores only the real log and never fabricates lifecycle rows", () => {
	const handler = read("perps/events/handlers/symmio/AcceptCancelRequestHandler.ts");

	assert.match(handler, /new AcceptCancelRequestEntity/);
	for (const fabricated of ["SendQuoteEntity", "LockQuoteEntity", "RequestToCancelQuoteEntity", "getQuote_0_8_"]) {
		assert.doesNotMatch(handler, new RegExp(fabricated), `AcceptCancelRequest must not synthesize ${fabricated}`);
	}
});

test("funding-rate amounts use position direction and only the still-open quantity", () => {
	const handler = read("perps/events/handlers/symmio/ChargeFundingRateHandler.ts");
	const factor = 10n ** 18n;
	const abs = value => (value < 0n ? -value : value);
	const derive = ({ updatedPrice, quantity, closedAmount, positionType, rate }) => {
		const denominator = positionType === 0 ? factor + rate : factor - rate;
		const originalPrice = (updatedPrice * factor) / denominator;
		return (abs(updatedPrice - originalPrice) * (quantity - closedAmount)) / factor;
	};
	const applyCoreRate = ({ originalPrice, positionType, rate }) => {
		const priceAdjustment = (originalPrice * abs(rate)) / factor;
		const priceIncreases = (positionType === 0 && rate >= 0n) || (positionType === 1 && rate < 0n);
		return priceIncreases ? originalPrice + priceAdjustment : originalPrice - priceAdjustment;
	};

	const originalPrice = 1_000n * factor;
	const quantity = 5n * factor;
	const closedAmount = 2n * factor;
	for (const positionType of [0, 1]) {
		for (const rate of [10n ** 16n, -(2n * 10n ** 16n)]) {
			const updatedPrice = applyCoreRate({ originalPrice, positionType, rate });
			const expected = (abs(updatedPrice - originalPrice) * (quantity - closedAmount)) / factor;
			assert.equal(derive({ updatedPrice, quantity, closedAmount, positionType, rate }), expected);
		}
	}

	assert.match(handler, /case Version\.v_0_8_6:[\s\S]*getQuote_0_8_6/);
	assert.match(handler, /case Version\.v_0_8_5:[\s\S]*getQuote_0_8_5/);
	assert.match(handler, /positionType == 0 \? FACTOR\.plus\(rate\) : FACTOR\.minus\(rate\)/);
	assert.match(handler, /updatedPrice\.minus\(originalPrice\)\.abs\(\)/);
	assert.match(handler, /quantity\.minus\(closedAmount\)/);
	assert.doesNotMatch(handler, /chainQuote == null\) return/, "a reverted enrichment call must not drop the raw event");
});

test("Party B liquidation settlement tuples are normalized into immutable child rows", () => {
	const handler = read("perps/events/handlers/symmio/SettlePartyBUpnlForLiquidationHandler.ts");

	assert.match(schema, /type PartyBQuoteSettlementData @entity\(immutable: true\)/);
	assert.match(schema, /type SettlePartyBUpnlForLiquidation @entity\(immutable: true\)/);
	for (const field of ["quoteId", "currentPrice", "partyAIndex"]) {
		assert.match(handler, new RegExp(`dataEntity\\.${field}\\s*=`), `settlement child must retain ${field}`);
	}
	assert.match(handler, /entity\.settlementData = settlementDataIds/);
});

test("release ABI drops the removed affiliate pause event", () => {
	const abiJson = read("configs/abis/symmio_0_8_6.json");
	const abi = JSON.parse(abiJson);
	const names = abi.filter(item => item.type === "event").map(item => item.name);

	assert.equal(names.includes("SetAffiliateOpenPositionsPaused"), false);
	assert.equal(
		createHash("sha256").update(abiJson).digest("hex"),
		"3aa3394af3c4ddbb34c54aa7cd40873b6e001608a6cf55493a2c49f52cfe3043",
		"v0.8.6 ABI must remain byte-for-byte identical to the release artifact",
	);
});
