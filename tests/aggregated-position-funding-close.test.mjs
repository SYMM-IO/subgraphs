import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const aggregatedPosition = readFileSync("perps/analytics/utils/aggregatedPosition.ts", "utf8");
const closeHandler = readFileSync("perps/analytics/handlers/commonHandlers/close.ts", "utf8");
const liquidationHandler = readFileSync("perps/analytics/handlers/commonHandlers/liquidatePositions.ts", "utf8");

const FACTOR = 10n ** 18n;

function transition(existing, preCloseOpenAmount, closedAmount, previousFunding, newFunding) {
	return (
		existing -
		(preCloseOpenAmount * previousFunding) / FACTOR +
		(preCloseOpenAmount * newFunding) / FACTOR -
		(closedAmount * newFunding) / FACTOR
	);
}

test("funding-and-close transition preserves the remaining quote contribution", () => {
	const amount = 5n * FACTOR;
	const closed = 2n * FACTOR;
	const oldFunding = 3n * 10n ** 15n;
	const newFunding = 7n * 10n ** 15n;
	const otherQuotes = 41n;
	const existing = otherQuotes + (amount * oldFunding) / FACTOR;

	assert.equal(
		transition(existing, amount, closed, oldFunding, newFunding),
		otherQuotes + ((amount - closed) * newFunding) / FACTOR,
	);
});

test("full close removes positive and negative funding contributions without residue", () => {
	const amount = 9n * FACTOR;
	for (const [oldFunding, newFunding] of [
		[4n * 10n ** 15n, 8n * 10n ** 15n],
		[-4n * 10n ** 15n, -8n * 10n ** 15n],
		[-4n * 10n ** 15n, 8n * 10n ** 15n],
	]) {
		const otherQuotes = -17n;
		const existing = otherQuotes + (amount * oldFunding) / FACTOR;
		assert.equal(transition(existing, amount, amount, oldFunding, newFunding), otherQuotes);
	}
});

test("partial close preserves the core's independent integer-division rounding", () => {
	const newFunding = 6n * 10n ** 17n;

	assert.equal(transition(0n, 2n, 1n, 0n, newFunding), 1n);
	assert.equal(((2n - 1n) * newFunding) / FACTOR, 0n, "collapsed remaining-amount math would lose one wei");
});

test("close and liquidation handlers use the atomic funding-and-close transition", () => {
	assert.match(aggregatedPosition, /export function onFundingSettlementAndPositionClose/);
	assert.match(
		aggregatedPosition,
		/minus\(previousContribution\)[\s\S]*plus\(updatedContribution\)[\s\S]*minus\(closedContribution\)/,
	);

	for (const source of [closeHandler, liquidationHandler]) {
		assert.match(source, /fundingContext\.previousAccumulatedPaidFunding/);
		assert.match(source, /fundingContext\.openAmount/);
		assert.match(source, /onFundingSettlementAndPositionClose\(/);
		assert.doesNotMatch(source, /\bonPositionClose\(/);
	}
});
