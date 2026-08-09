import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("legacy funding-rate charges preserve the chain paid-through timestamp", () => {
	const loader = read("perps/common/VersionedQuoteLoader.ts");
	const chargeHandler = read("perps/common/handlers/symmio/ChargeFundingRateHandler.ts");

	for (const version of ["1", "2", "3", "4", "5"]) {
		const caseStart = loader.indexOf(`case Version.v_0_8_${version}:`);
		assert.notEqual(caseStart, -1, `missing v0.8.${version} quote loader case`);
		const nextCase = loader.indexOf("case Version.", caseStart + 1);
		const block = loader.slice(caseStart, nextCase == -1 ? undefined : nextCase);
		assert.match(
			block,
			/data\.lastFundingPaymentTimestamp = q\.lastFundingPaymentTimestamp/,
			`v0.8.${version} must load lastFundingPaymentTimestamp`,
		);
	}

	assert.match(
		chargeHandler,
		/quote\.lastFundingPaymentTimestamp = chainQuote\.lastFundingPaymentTimestamp/,
		"ChargeFundingRate must persist the chain paid-through timestamp",
	);
});

test("liquidations record funding settlements and funding deltas in analytics", () => {
	const commonLiquidation = read("perps/analytics/handlers/commonHandlers/liquidatePositions.ts");
	const partyA = read("perps/analytics/handlers/symmio/LiquidatePositionsPartyAHandler.ts");
	const partyB = read("perps/analytics/handlers/symmio/LiquidatePositionsPartyBHandler.ts");
	const clearingHouse = read("perps/analytics/handlers/symmio/LiquidatePositionsForClearingHouseHandler.ts");
	const fundingHistory = read("perps/analytics/utils/fundingHistory.ts");

	assert.match(fundingHistory, /export function getQuoteFundingSignedAmount/);
	assert.match(commonLiquidation, /FundingSettlementContext/);
	assert.match(commonLiquidation, /recordQuoteFundingSettlement/);
	assert.match(commonLiquidation, /getQuoteFundingSignedAmount/);
	assert.match(commonLiquidation, /\.fundingPaid\(fundingPaid\)/);
	assert.match(commonLiquidation, /\.fundingReceived\(fundingReceived\)/);
	assert.match(commonLiquidation, /syncFundingFeeState/);

	for (const [name, source] of [
		["PartyA liquidation", partyA],
		["PartyB liquidation", partyB],
		["Clearing-house liquidation", clearingHouse],
	]) {
		assert.match(source, /captureQuoteFundingContext/, `${name} must capture funding context before quote mutation`);
		assert.match(
			source,
			/handleLiquidatePosition<T>\(_event, version, .*fundingContexts\[i\], /s,
			`${name} must pass funding context into shared liquidation analytics`,
		);
	}

	assert.match(partyA, /getPartyALiquidationFundingSettlement/);
	assert.match(partyA, /recordTransientQuoteFundingSettlement/);
	assert.match(partyA, /fundingAmounts\[i\]/);
	assert.match(partyA, /accPnl = accPnl\.plus\(pnl\.minus\(fundingAmount\)\)/);
});

test("funding dependency declarations include liquidation funding paths", () => {
	const deps = JSON.parse(read("perps/analytics/deps_symmio_0_8_5.json"));

	for (const eventName of ["LiquidatePositionsPartyA", "LiquidatePositionsPartyB", "LiquidatePositionsForClearingHouse"]) {
		assert.ok(deps.FundingFeeState.includes(eventName), `FundingFeeState missing ${eventName}`);
		assert.ok(deps.QuoteFundingSettlement.includes(eventName), `QuoteFundingSettlement missing ${eventName}`);
	}
});
