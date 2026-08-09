import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
	return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

test("analytics paidLf uses the exact v0.8.6 LF_OUT event and legacy state-derived payout", () => {
	const handler = read("perps/analytics/handlers/symmio/LiquidatePositionsPartyAHandler.ts");
	const tracking = read("perps/analytics/utils/partyALiquidation.ts");

	assert.doesNotMatch(handler, /accLf\s*=\s*accLf\.plus\(quote\.lf/);
	assert.match(handler, /if \(version < Version\.v_0_8_6\) entity\.paidLf = getLegacyActualPaidLf\(settlementTerms\.liquidationFee\)/);
	assert.match(tracking, /detail\.liquidationFee\s*=\s*amount/);
	assert.match(tracking, /detail\.paidLf\s*=\s*amount/);
});

test("analytics potentialLf tracks the summed quote LF reserve", () => {
	const schema = read("perps/analytics/schema.graphql");
	const handler = read("perps/analytics/handlers/symmio/LiquidatePositionsPartyAHandler.ts");

	assert.match(schema, /potentialLf: BigInt/);
	assert.match(handler, /accPotentialLf\s*=\s*entity\.potentialLf/);
	assert.match(handler, /accPotentialLf\s*=\s*accPotentialLf\.plus\(quoteCapture\.lockedLfs\[i\]\)/);
	assert.match(handler, /entity\.potentialLf\s*=\s*accPotentialLf/);
});

test("LiquidationDetail creation paths initialize potentialLf to zero", () => {
	for (const path of [
		"perps/common/handlers/symmio/LiquidatePartyAHandlerWithAccount.ts",
		"perps/common/handlers/symmio/DeferredLiquidatePartyAHandler.ts",
		"perps/common/handlers/symmio/SetSymbolsPricesHandler.ts",
		"perps/common/handlers/symmio/LiquidatePositionsPartyAHandler.ts",
	]) {
		const source = read(path);
		const creationStart = source.indexOf("new LiquidationDetail");
		assert.notEqual(creationStart, -1, `${path} must create LiquidationDetail`);

		const followingSource = source.slice(creationStart);
		assert.match(followingSource, /entity\.potentialLf\s*=\s*BigInt\.zero\(\)/, `${path} must initialize potentialLf`);
	}
});

test("paidLf follows liquidationFee resets in takeover flows", () => {
	for (const path of [
		"perps/common/handlers/symmio/TakeoverPartyALiquidationHandler.ts",
		"perps/common/handlers/symmio/AutoTakeoverPartyALiquidationHandler.ts",
		"perps/common/handlers/symmio/SettlePartyATakeoverHandler.ts",
	]) {
		const source = read(path);

		assert.match(source, /entity\.liquidationFee\s*=\s*BigInt\.zero\(\)/, `${path} must clear liquidationFee`);
		assert.match(source, /entity\.paidLf\s*=\s*BigInt\.zero\(\)/, `${path} must clear paidLf with liquidationFee`);
	}
});

test("paidLf uses resolved liquidation terms for all state-aware PartyA liquidation versions", () => {
	const loader = read("perps/common/VersionedQuoteLoader.ts");
	const handler = read("perps/analytics/handlers/symmio/LiquidatePositionsPartyAHandler.ts");
	const deps_0_8_4 = JSON.parse(read("perps/analytics/deps_symmio_0_8_4.json"));
	const liquidationLoaderStart = loader.indexOf("export function getLiquidationStateData");
	assert.notEqual(liquidationLoaderStart, -1, "missing liquidation state loader");
	const liquidationLoader = loader.slice(liquidationLoaderStart);

	for (const version of ["1", "2", "3", "4", "5"]) {
		const caseStart = liquidationLoader.indexOf(`case Version.v_0_8_${version}:`);
		assert.notEqual(caseStart, -1, `missing v0.8.${version} liquidation state loader case`);
		const nextCase = liquidationLoader.indexOf("case Version.", caseStart + 1);
		const block = liquidationLoader.slice(caseStart, nextCase == -1 ? undefined : nextCase);

		assert.match(block, /data\.liquidationFee\s*=\s*d\.liquidationFee/, `v0.8.${version} must load liquidationFee`);
	}

	assert.ok(
		Object.values(deps_0_8_4).some(events => events.includes("LiquidatePositionsPartyA")),
		"v0.8.4 must wire PartyA position liquidation handling",
	);
	assert.match(handler, /entity\.paidLf\s*=\s*getLegacyActualPaidLf\(settlementTerms\.liquidationFee\)/);
});

test("paidLf matches branch-specific liquidator payout distribution", () => {
	const handler = read("perps/analytics/handlers/symmio/LiquidatePositionsPartyAHandler.ts");
	const balanceChange = read("perps/analytics/handlers/symmio/BalanceChangePartyAHandler.ts");

	assert.match(handler, /function getLegacyActualPaidLf\(liquidationFee: BigInt\): BigInt/);
	assert.match(handler, /liquidationFee\.div\(BigInt\.fromI32\(2\)\)/);
	assert.match(handler, /return half\.times\(BigInt\.fromI32\(2\)\)/);
	assert.match(balanceChange, /BalanceChangeType\.LF_OUT/);
	assert.match(balanceChange, /setPartyALiquidationPaidLf/);
});
