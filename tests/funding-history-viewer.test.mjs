import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";

function loadViewerContext() {
	const html = fs.readFileSync(new URL("../docs/funding-history-viewer.html", import.meta.url), "utf8");
	const script = html.match(/<script>([\s\S]*)<\/script>/);
	assert.ok(script, "viewer script should exist");

	const element = () => ({
		value: "",
		textContent: "",
		innerHTML: "",
		addEventListener() {},
		classList: {
			add() {},
			remove() {},
		},
	});

	const context = vm.createContext({
		console,
		Date,
		Math,
		Number,
		BigInt,
		String,
		Set,
		Map,
		JSON,
		document: {
			getElementById: element,
		},
	});

	vm.runInContext(script[1], context);
	return context;
}

test("funding viewer derives price-adjusted checkpoint rates when stage currentRate is raw", () => {
	const { buildFundingRows } = loadViewerContext();

	const build = buildFundingRows({
		quote: {
			id: "7076-0x99641e06d38f327166b3a48f86ca2cbb3b4fb7eb",
			source: "0x99641e06d38f327166b3a48f86ca2cbb3b4fb7eb",
			quoteId: "7076",
			partyA: "0x518fca8aab001c4f3a14c388ba4f821d46d6bf41",
			partyB: "0xf62a670cda28ffae65ee2a42d6cf6cf05ec5e775",
			symbolId: "14",
			positionType: 0,
			quantity: "18776521000000000000",
			closedAmount: "0",
			accumulatedPaidFunding: "626400000000000000",
			lastFundingPaymentTimestamp: "1778504353",
			timestampOpenPosition: "1778504353",
			timestamp: "1778504353",
		},
		settlements: [],
		quoteEvents: [],
		checkpoints: [
			{
				id: "0xae87-0-0-SET_LONG",
				eventType: "SET_LONG",
				rawLongRate: "10000000000000000",
				currentLongRate: "10000000000000000",
				marketPrice: "60000000000000000",
				epochDuration: "600",
				timestamp: "1777877580",
				blockNumber: "34182992",
				transaction: "0xae87f372170cf03c25e98dbcacc86b20a3538728dec05ac3dc27cbbaa5537a29",
			},
		],
		asOfTimestamp: 1778655750,
		maxRows: 500,
	});

	assert.equal(build.rows.length, 253);
	assert.equal(build.totals.unpaidDebt.toString(), "2850275887800000000");
	assert.equal(build.rows[0].rate.toString(), "600000000000000");
	assert.equal(build.warnings.length, 0);
});

test("uPNL calculator combines side-aware price pnl with unpaid funding", () => {
	const { calculateQuoteUpnl, parseDecimalUnits } = loadViewerContext();

	const longResult = calculateQuoteUpnl(
		{
			positionType: 0,
			quantity: "18776521000000000000",
			closedAmount: "0",
			openedPrice: "50626415511838653",
		},
		{
			unpaidDebt: 2850275887800000000n,
			unpaidReceivable: 0n,
		},
		parseDecimalUnits("0.06"),
	);

	assert.equal(longResult.pricePnl.toString(), "176003305987235783");
	assert.equal(longResult.fundingAdjustment.toString(), "-2850275887800000000");
	assert.equal(longResult.netUpnl.toString(), "-2674272581812764217");

	const shortResult = calculateQuoteUpnl(
		{
			positionType: 1,
			quantity: "10000000000000000000",
			closedAmount: "2000000000000000000",
			openedPrice: "2000000000000000000",
		},
		{
			unpaidDebt: 0n,
			unpaidReceivable: 300000000000000000n,
		},
		parseDecimalUnits("1.75"),
	);

	assert.equal(shortResult.openAmount.toString(), "8000000000000000000");
	assert.equal(shortResult.pricePnl.toString(), "2000000000000000000");
	assert.equal(shortResult.fundingAdjustment.toString(), "300000000000000000");
	assert.equal(shortResult.netUpnl.toString(), "2300000000000000000");
});
