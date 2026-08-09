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

	for (const fieldName of [
		"liquidationAllocatedBalance",
		"freeBalance",
		"freeMarginAtStart",
		"lockedCva",
		"lockedLf",
		"lockedPartyAmm",
		"lockedPartyBmm",
		"lossRestsAt",
	]) {
		const field = getField(type, fieldName);
		assert.ok(field, `LiquidationDetail.${fieldName} should exist`);
		assert.equal(field.type.kind, "NamedType", `${fieldName} should be nullable for historical rows`);
		assert.equal(field.type.name.value, "BigInt");
	}
	const startTransaction = getField(type, "liquidationStartTransaction");
	assert.ok(startTransaction, "LiquidationDetail.liquidationStartTransaction should exist");
	assert.equal(startTransaction.type.kind, "NamedType");
	assert.equal(startTransaction.type.name.value, "Bytes");

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

test("single-step snapshot liquidation reconstructs classification from event-sourced start values", () => {
	const schema = parse(read("perps/analytics/schema.graphql"), { noLocation: true });
	const deferred = read("perps/common/handlers/symmio/DeferredLiquidatePartyAHandler.ts");
	const prices = read("perps/common/handlers/symmio/SetSymbolsPricesHandler.ts");
	const analyticsPrices = read("perps/analytics/handlers/symmio/SetSymbolsPricesHandler.ts");
	const positions = read("perps/analytics/handlers/symmio/LiquidatePositionsPartyAHandler.ts");
	const pending = read("perps/analytics/handlers/symmio/LiquidatePendingPositionsPartyAHandler.ts");
	const tracking = read("perps/analytics/utils/partyALiquidation.ts");
	const balanceChange = read("perps/analytics/handlers/symmio/BalanceChangePartyAHandler.ts");
	const reimbursementChange = read("perps/analytics/handlers/symmio/PartyAReimbursementChangeHandler.ts");
	const escrow = read("perps/analytics/handlers/symmio/LiquidationEscrowCreatedHandler.ts");
	const fully = read("perps/analytics/handlers/symmio/FullyLiquidatedPartyAHandler.ts");
	const takeover = read("perps/analytics/handlers/symmio/SettlePartyATakeoverHandler.ts");
	const commonFully = read("perps/common/handlers/symmio/FullyLiquidatedPartyAHandler.ts");
	const commonTakeover = read("perps/common/handlers/symmio/SettlePartyATakeoverHandler.ts");
	const utility = read("perps/common/utils/liquidationDetail.ts");

	assert.match(deferred, /entity\.liquidationAllocatedBalance\s*=\s*event\.params\.liquidationAllocatedBalance/);
	assert.match(deferred, /entity\.liquidationStartTransaction\s*=\s*event\.transaction\.hash/);
	assert.match(deferred, /PARTY_A_LIQUIDATION_TYPE_OVERDUE/);
	assert.match(prices, /liqState\.liquidationId\.toHexString\(\) != liquidationId\.toHexString\(\)/);
	assert.match(prices, /liqState\.liquidationType == PARTY_A_LIQUIDATION_TYPE_NONE/);
	assert.match(analyticsPrices, /_event\.parameters\[4\]\.value\.toBytes\(\)/);
	assert.match(analyticsPrices, /createPartyALiquidationEvent\(_event,\s*event\.params\.partyA,\s*liquidationId/);
	const liquidatePartyA = read("perps/analytics/handlers/symmio/LiquidatePartyAHandler.ts");
	assert.match(liquidatePartyA, /let liquidationId = _event\.parameters\[5\]\.value\.toBytes\(\)/);
	assert.doesNotMatch(liquidatePartyA, /event\.params\.liquidationId/);

	const captureIndex = positions.lastIndexOf("capturePartyALiquidationQuoteValues(");
	const closeIndex = positions.indexOf("super.handleQuote(_event, version)");
	const accumulateIndex = positions.lastIndexOf("accumulatePartyALiquidationLockedValues(");
	const resolveIndex = positions.lastIndexOf("resolvePartyALiquidationSettlementTerms(");
	const settlementIndex = positions.indexOf("let cvaReturned = calculateQuoteSettlementCva");
	assert.ok(captureIndex >= 0 && captureIndex < closeIndex, "locked values must be captured before quote close handling");
	assert.ok(
		accumulateIndex >= 0 && accumulateIndex < resolveIndex,
		"event-sourced locked values must be accumulated before nullable state resolution",
	);
	assert.ok(resolveIndex >= 0 && resolveIndex < settlementIndex, "immutable settlement terms must be resolved before settlement math");
	assert.match(positions, /liqState: LiquidationStateData \| null/);
	assert.match(tracking, /getQuoteData\(version,\s*event\.address,\s*quoteId\)/);
	assert.match(tracking, /partyB === null && !changetype<Address>\(contractQuote\.partyB\)\.equals\(Address\.zero\(\)\)/);
	assert.match(tracking, /quote\.partyB = partyB/);
	assert.match(positions, /accumulatePartyALiquidationLockedValues/);
	assert.match(positions, /active\.capturedLockedCva/);
	assert.match(positions, /let lockedCva = netBalance\.plus\(authoritativeDeficit\)/);
	assert.match(positions, /stateMatchesEvent/);
	assert.match(positions, /entity\.liquidationAllocatedBalance === null/);
	assert.match(positions, /calculateQuoteSettlementCva\(settlementTerms, quoteCapture\.lockedCvas\[i\]\)/);
	assert.doesNotMatch(positions, /calculateQuoteSettlementCva\(liqState/);

	const activeType = getType(schema, "ActivePartyALiquidation");
	for (const fieldName of [
		"capturedLockedCva",
		"capturedLockedLf",
		"cvaComplete",
		"lfComplete",
		"partyAmmComplete",
		"partyBmmComplete",
		"capturedQuotePartyBs",
		"capturedQuoteCvas",
	]) {
		assert.ok(getField(activeType, fieldName), `ActivePartyALiquidation.${fieldName} should exist`);
	}
	assert.match(tracking, /entity\.capturedLockedCva = entity\.capturedLockedCva\.plus\(lockedCva\)/);
	assert.match(tracking, /entity\.cvaComplete = entity\.cvaComplete && cvaComplete/);
	assert.match(tracking, /entity\.lfComplete = entity\.lfComplete && lfComplete/);
	assert.match(tracking, /entity\.partyAmmComplete = entity\.partyAmmComplete && partyAmmComplete/);
	assert.match(tracking, /entity\.partyBmmComplete = entity\.partyBmmComplete && partyBmmComplete/);
	assert.match(tracking, /entity\.partyBComplete = entity\.partyBComplete && partyBComplete/);
	assert.match(tracking, /capturedQuotePartyBs\.push\(quotePartyBs\[i\]\)/);
	assert.match(tracking, /export function reconcileCompletedPartyALiquidation/);
	assert.match(tracking, /detail\.paidCva = paidCva/);
	assert.match(fully, /reconcileCompletedPartyALiquidation/);
	assert.match(commonFully, /entity\.settled = true/);
	assert.match(takeover, /clearPartyALiquidationTracking/);
	assert.match(commonTakeover, /clearPendingSettlementSnapshotsForTakeover\(entity\)/);
	assert.match(pending, /createPartyALiquidationEvent\(_event, event\.params\.partyA, liquidationId/);

	assert.match(utility, /let netBalance = liquidationAllocatedBalance\.plus\(upnl\)/);
	assert.match(utility, /netBalance\.lt\(BigInt\.zero\(\)\)/);
	assert.match(utility, /netBalance\.le\(lockedCva\)/);
	assert.match(utility, /calculatePartyALiquidationReturnedCva/);
	assert.doesNotMatch(utility, /calculateDeferredBalanceAtStart/);
	assert.match(balanceChange, /recordPartyALiquidationDeferredBalance/);
	assert.doesNotMatch(balanceChange, /addPartyALiquidationReimbursement/);
	assert.match(reimbursementChange, /setPartyALiquidationReimbursement/);
	assert.match(reimbursementChange, /event\.params\.newBalance/);
	assert.match(tracking, /detail\.deferredBalance = hint\.amount/);
	assert.match(tracking, /detail\.liquidationFee = amount/);
	assert.match(tracking, /detail\.paidLf = amount/);
	assert.match(escrow, /detail\.liquidationEscrow = event\.params\.amount/);
	assert.doesNotMatch(escrow, /detail\.reimbursement = event\.params\.amount/);

	function classify(allocation, upnl, lockedCva) {
		const net = allocation + upnl;
		if (net < 0n) return { type: 3, deficit: -net };
		if (net <= lockedCva) return { type: 2, deficit: lockedCva - net };
		return { type: 1, deficit: 0n };
	}

	function returnedCva(type, deficit, lockedCva, quoteCva) {
		if (type === 2) return lockedCva === 0n ? quoteCva : quoteCva - (quoteCva * deficit) / lockedCva;
		if (type === 3) return 0n;
		return quoteCva;
	}

	function adjustedOverdueAmount(pnlWithFunding, deficit, totalUnrealizedLoss) {
		if (pnlWithFunding >= 0n) return pnlWithFunding;
		const loss = -pnlWithFunding;
		return -(loss - (loss * deficit) / -totalUnrealizedLoss);
	}

	assert.deepEqual(classify(100n, -31n, 50n), { type: 1, deficit: 0n }, "N=69, C=50 is NORMAL");
	assert.deepEqual(classify(100n, -70n, 50n), { type: 2, deficit: 20n }, "N=30, C=50 is LATE");
	assert.deepEqual(classify(100n, -50n, 50n), { type: 2, deficit: 0n }, "N=C=50 remains LATE");
	assert.deepEqual(classify(100n, -110n, 50n), { type: 3, deficit: 10n }, "N=-10 is OVERDUE");
	assert.equal(returnedCva(2, 20n, 50n, 20n), 12n);
	assert.equal(returnedCva(2, 20n, 50n, 30n), 18n);
	assert.equal(returnedCva(2, 1n, 3n, 1n), 1n, "CVA haircut rounds independently per quote");
	assert.equal(returnedCva(2, 1n, 3n, 2n), 2n, "CVA haircut uses Solidity integer division");
	assert.equal(adjustedOverdueAmount(-60n, 10n, -100n), -54n);
	assert.equal(adjustedOverdueAmount(-40n, 10n, -100n), -36n);
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
	assert.match(liquidatePositions, /let cvaReturned = calculateQuoteSettlementCva\(settlementTerms, quoteCapture\.lockedCvas\[i\]\)/);
	assert.match(liquidatePositions, /accCva = accCva\.plus\(cvaReturned\)/);
	assert.doesNotMatch(liquidatePositions, /accCva = accCva\.plus\(quote\.cva/);
	assert.match(liquidatePositions, /getPartyBSettlementMode/);
	assert.match(liquidatePositions, /"pending"/);

	assert.match(settle, /upsertSettlementSnapshot/);
	assert.match(settle, /getPartyBSettlementMode/);
	assert.match(settle, /"settled"/);
	assert.match(utility, /getPositiveSettlementReserveContribution/);
	assert.match(utility, /version >= Version\.v_0_8_6 \|\| mode == "cross"/);
	assert.match(utility, /state == "pending" \? getPositiveSettlementReserveContribution/);
	assert.match(utility, /export function clearPendingSettlementSnapshotsForTakeover/);
	assert.match(utility, /states\[i\] = "takeover-cleared"/);
	assert.match(utility, /reserveContributions\[i\] = BigInt\.zero\(\)/);
	assert.match(utility, /entity\.paidCva = paidCva/);
	assert.match(utility, /entity\.involvedPartyBCounts = BigInt\.zero\(\)/);
});

test("settlement reserve and dispute overrides follow versioned core semantics", () => {
	const utility = read("perps/common/utils/liquidationDetail.ts");
	const dispute = read("perps/common/handlers/symmio/ResolveLiquidationDisputeHandler.ts");

	function reserve(version, mode, amount) {
		if (amount <= 0n) return 0n;
		return version >= 6 || mode === "cross" ? amount : 0n;
	}

	assert.equal(reserve(6, "isolated", 9n), 9n);
	assert.equal(reserve(6, "cross", 9n), 9n);
	assert.equal(reserve(6, "cross", -1n), 0n);
	assert.equal(reserve(5, "isolated", 9n), 0n);
	assert.equal(reserve(5, "cross", 9n), 9n);
	assert.equal(reserve(4, "isolated", 9n), 0n);

	assert.match(dispute, /overrideSettlementAmount\(version,\s*entity,\s*event\.params\.partyBs\[i\],\s*event\.params\.amounts\[i\]\)/);
	assert.match(utility, /actualAmounts\[index\] = actualAmount/);
	assert.match(utility, /reserveContributions\[index\] = getPositiveSettlementReserveContribution\(version,\s*modes\[index\],\s*actualAmount\)/);
	const overrideStart = utility.indexOf("export function overrideSettlementAmount");
	const overrideEnd = utility.indexOf("export function upsertSettlementSnapshot", overrideStart);
	const override = utility.slice(overrideStart, overrideEnd);
	assert.doesNotMatch(override, /expectedAmounts|cvaReturnedAmounts|states\[index\]\s*=/, "dispute overrides must preserve aligned history");
});

test("clearing-house takeover reconciles start locks without inventing CVA settlement", () => {
	const ch = read("perps/analytics/handlers/symmio/LiquidatePositionsForClearingHouseHandler.ts");
	const takeover = read("perps/analytics/handlers/symmio/SettlePartyATakeoverHandler.ts");
	const tracking = read("perps/analytics/utils/partyALiquidation.ts");
	const deps = JSON.parse(read("perps/analytics/deps_symmio_0_8_6.json"));

	const captureIndex = ch.indexOf("capturePartyALiquidationQuoteValues");
	const closeIndex = ch.indexOf("super.handle(_event, version)");
	assert.ok(captureIndex >= 0 && captureIndex < closeIndex, "takeover start locks must be captured before quote close mutation");
	assert.match(ch, /loadCurrentPartyALiquidation/);
	assert.match(ch, /accumulatePartyALiquidationLockedValues/);
	assert.match(ch, /let noPartyBs: Bytes\[\] = \[\]/);
	assert.match(ch, /let noCvas: BigInt\[\] = \[\]/);
	assert.match(ch, /detail\.totalPnl = totalPnl\.plus\(pnl\)\.minus\(fundingAmount\)/);
	assert.match(tracking, /if \(active\.lfComplete\) detail\.potentialLf = active\.capturedLockedLf/);

	const handleIndex = takeover.indexOf("handle(_event:");
	const reconcileIndex = takeover.indexOf("reconcileCompletedPartyALiquidation(", handleIndex);
	const superIndex = takeover.indexOf("super.handle(_event, version)", handleIndex);
	const clearIndex = takeover.indexOf("clearPartyALiquidationTracking(", handleIndex);
	assert.ok(
		reconcileIndex >= 0 && reconcileIndex < superIndex && superIndex < clearIndex,
		"takeover must reconcile, clear pending buckets, then remove tracking",
	);
	assert.ok(deps.ActivePartyALiquidation.includes("LiquidatePositionsForClearingHouse"));
	assert.ok(deps.LiquidationDetail.includes("LiquidatePositionsForClearingHouse"));
});

test("clearing-house pending liquidation uses event-sourced type context", () => {
	const model = parse(read("perps/common/models/ClearingHouseLiquidationContext.graphql"), { noLocation: true });
	const contextType = getType(model, "ClearingHouseLiquidationContext");
	const config = JSON.parse(read("perps/analytics/subgraph_config.json"));
	const deps = JSON.parse(read("perps/analytics/deps_symmio_0_8_5.json"));
	const resolver = read("perps/common/utils/clearingHouseLiquidation.ts");
	const quoteUtils = read("perps/common/utils/quote.ts");
	const commonHandler = read("perps/common/handlers/symmio/LiquidatePendingPositionsForClearingHouseHandler.ts");
	const analyticsHandler = read("perps/analytics/handlers/symmio/LiquidatePendingPositionsForClearingHouseHandler.ts");
	const versionSources = [read("perps/analytics/src_symmio_0_8_5.ts"), read("perps/analytics/src_symmio_0_8_6.ts")];

	assert.ok(contextType, "ClearingHouseLiquidationContext should exist");
	for (const fieldName of ["source", "subject", "crossPartyBInProgress", "partyATakeoverInProgress"]) {
		assert.ok(getField(contextType, fieldName), `ClearingHouseLiquidationContext.${fieldName} should exist`);
	}
	assert.ok(config.importModels.includes("ClearingHouseLiquidationContext"));
	assert.deepEqual(deps.ClearingHouseLiquidationContext, [
		"LiquidateCrossPartyB",
		"TakeoverPartyALiquidation",
		"AutoTakeoverPartyALiquidation",
		"SettleCrossPartyBLiquidation",
		"SettlePartyATakeover",
	]);

	const amountProof = resolver.indexOf("if (liquidatedAmountCount > 0)");
	const amountHydration = resolver.indexOf("activatePartyATakeover(source, subject)", amountProof);
	const amountReturn = resolver.indexOf("return ClearingHouseLiquidationType.PARTY_A_TAKEOVER", amountHydration);
	const contextLookup = resolver.indexOf("ClearingHouseLiquidationContext.load", amountProof);
	const contextCross = resolver.indexOf("if (context.crossPartyBInProgress)", contextLookup);
	const contextTakeover = resolver.indexOf("if (context.partyATakeoverInProgress)", contextCross);
	const fallbackCross = resolver.indexOf("try_getCrossLiquidationDetails", contextTakeover);
	const fallbackTakeover = resolver.indexOf("try_getPartyATakeoverDetails", fallbackCross);
	const hydrateCross = resolver.indexOf("activateCrossPartyBLiquidation(source, subject)", fallbackTakeover);
	const hydrateTakeover = resolver.indexOf("activatePartyATakeover(source, subject)", hydrateCross);
	const fallbackReturn = resolver.indexOf("if (crossInProgress) return ClearingHouseLiquidationType.CROSS_PARTY_B", hydrateTakeover);
	assert.ok(
		amountProof >= 0 &&
			amountProof < amountHydration &&
			amountHydration < amountReturn &&
			amountReturn < contextLookup &&
			contextLookup < contextCross &&
			contextCross < contextTakeover &&
			contextTakeover < fallbackCross &&
			fallbackCross < fallbackTakeover &&
			fallbackTakeover < hydrateCross &&
			hydrateCross < hydrateTakeover &&
			hydrateTakeover < fallbackReturn,
		"event proof and fallback state must hydrate context before returning, with cross matching core priority",
	);

	assert.match(quoteUtils, /export function getClearingHouseLiquidatablePendingQuoteIds/);
	assert.match(quoteUtils, /if \(partyATakeover\) return collectLiquidatableQuoteIdsFromIndex\(partyAPendingIndexId/);
	assert.match(quoteUtils, /if \(counterparties\.length == 0\) return quoteIds/);
	assert.doesNotMatch(quoteUtils, /export function getLiquidatablePendingQuoteIds/);

	for (const handler of [commonHandler, analyticsHandler]) {
		assert.match(handler, /resolveClearingHousePendingQuoteIds/);
		assert.match(handler, /event\.params\.liquidatedAmounts\.length/);
		assert.doesNotMatch(handler, /isPartyATakeoverSubject/);
	}
	assert.match(commonHandler, /this\.handleQuoteIds\(_event, quoteIds\)/);
	assert.match(analyticsHandler, /super\.handleQuoteIds\(_event, quoteIds\)/);
	assert.doesNotMatch(analyticsHandler, /super\.handle\(_event, version\)/);
	for (const source of versionSources) {
		assert.match(source, /export function handleLiquidateCrossPartyB/);
		assert.match(source, /export function handleSettleCrossPartyBLiquidation/);
	}

	for (const [handlerPath, helperName] of [
		["perps/analytics/handlers/symmio/LiquidateCrossPartyBHandler.ts", "activateCrossPartyBLiquidation"],
		["perps/analytics/handlers/symmio/TakeoverPartyALiquidationHandler.ts", "activatePartyATakeover"],
		["perps/analytics/handlers/symmio/AutoTakeoverPartyALiquidationHandler.ts", "activatePartyATakeover"],
		["perps/analytics/handlers/symmio/SettleCrossPartyBLiquidationHandler.ts", "settleCrossPartyBLiquidation"],
		["perps/analytics/handlers/symmio/SettlePartyATakeoverHandler.ts", "clearPartyATakeoverContext"],
	]) {
		assert.match(read(handlerPath), new RegExp(`${helperName}\\(`), `${handlerPath} should update the lifecycle context`);
	}
});

test("LiquidationDetail uses ID-scoped or event-sourced PartyA settlement balance accounting", () => {
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
	assert.match(settle, /version == Version\.v_0_8_5 && stateMatchesEvent/);
	assert.match(settle, /applyPartyASettlementBalanceData/);
	assert.doesNotMatch(
		settle,
		/version == Version\.v_0_8_6[\s\S]{0,200}applyPartyASettlementBalanceData/,
		"v0.8.6 cumulative end-of-block balances must not overwrite exact event deltas",
	);
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
