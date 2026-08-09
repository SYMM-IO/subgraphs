import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const fundingHistory = readFileSync("perps/analytics/utils/fundingHistory.ts", "utf8");
const partyAHandler = readFileSync("perps/analytics/handlers/symmio/LiquidatePositionsPartyAHandler.ts", "utf8");
const snapshotHandler = readFileSync("perps/analytics/handlers/symmio/SetPartyALiquidationSnapshotHandler.ts", "utf8");
const accumulatedStateHandler = readFileSync(
	"perps/analytics/handlers/symmio/AccumulatedFundingStateUpdatedHandler.ts",
	"utf8",
);
const escrowHandler = readFileSync("perps/analytics/handlers/symmio/LiquidationEscrowCreatedHandler.ts", "utf8");
const schema = readFileSync("perps/analytics/schema.graphql", "utf8");

const FACTOR = 10n ** 18n;

function snapshotFunding(openAmount, cumulativeFunding, alreadyPaidFunding, liquidationTimestamp, lastPaymentTimestamp) {
	if (liquidationTimestamp <= lastPaymentTimestamp) return 0n;
	return (openAmount * (cumulativeFunding - alreadyPaidFunding)) / FACTOR;
}

function legacyFunding({
	openAmount,
	alreadyPaidFunding,
	timestamp,
	epochDuration,
	lastUpdatedEpoch,
	startEpoch,
	accumulatedRate,
	currentRate,
	snapshot,
}) {
	const currentEpoch = timestamp / epochDuration;
	const cumulative =
		snapshot + accumulatedRate * (lastUpdatedEpoch - startEpoch) + currentRate * (currentEpoch - lastUpdatedEpoch);
	return (openAmount * (cumulative - alreadyPaidFunding)) / FACTOR;
}

test("snapshot liquidation funding matches the core signed formula", () => {
	const openAmount = 6n * FACTOR;
	assert.equal(snapshotFunding(openAmount, 9n, 4n, 200n, 100n), 30n);
	assert.equal(snapshotFunding(openAmount, -9n, -4n, 200n, 100n), -30n);
	assert.equal(snapshotFunding(openAmount, 9n, 4n, 100n, 100n), 0n);
	assert.equal(snapshotFunding(openAmount, 9n, 4n, 99n, 100n), 0n);
});

test("legacy liquidation funding reconstructs the current cumulative index", () => {
	assert.equal(
		legacyFunding({
			openAmount: 3n * FACTOR,
			alreadyPaidFunding: 5n,
			timestamp: 1_000n,
			epochDuration: 100n,
			lastUpdatedEpoch: 8n,
			startEpoch: 3n,
			accumulatedRate: 2n,
			currentRate: 7n,
			snapshot: 11n,
		}),
		90n,
	);
});

test("PartyA liquidation uses snapshot-or-state funding instead of a post-close quote delta", () => {
	assert.match(fundingHistory, /getPartyALiquidationFundingSettlement/);
	assert.match(fundingHistory, /PartyALiquidationFundingSnapshot\.load/);
	assert.match(fundingHistory, /epochsSinceLastUpdate/);
	assert.match(fundingHistory, /recordTransientQuoteFundingSettlement/);
	assert.match(partyAHandler, /getPartyALiquidationFundingSettlement/);
	assert.match(partyAHandler, /fundingOverride = settlement\.signedAmount/);
	assert.match(partyAHandler, /let fundingAmount = fundingAmounts\[i\]/);
});

test("v0.8.6 authoritative funding and escrow events have analytics handlers", () => {
	assert.match(schema, /type PartyALiquidationFundingSnapshot @entity\(immutable: false\)/);
	assert.match(snapshotHandler, /PartyALiquidationFundingSnapshot\.load\(id\)/);
	assert.match(snapshotHandler, /if \(!entity\) entity = new PartyALiquidationFundingSnapshot\(id\)/);
	assert.match(snapshotHandler, /cumulativeLongFee = event\.params\.cumulativeLongFees\[i\]/);
	assert.match(snapshotHandler, /cumulativeShortFee = event\.params\.cumulativeShortFees\[i\]/);
	assert.match(accumulatedStateHandler, /state\.accumulatedLongRate = event\.params\.accumulatedLongRate/);
	assert.match(accumulatedStateHandler, /state\.snapshotShortFee = event\.params\.snapshotShortFee/);
	assert.match(escrowHandler, /detail\.liquidationEscrow = event\.params\.amount/);
});
