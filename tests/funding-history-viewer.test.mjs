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

function quote(overrides = {}) {
	return {
		id: "1-0x1111111111111111111111111111111111111111",
		source: "0x1111111111111111111111111111111111111111",
		quoteId: "1",
		partyA: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
		partyB: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
		symbolId: "1",
		positionType: 0,
		quantity: "1000000000000000000",
		closedAmount: "0",
		accumulatedPaidFunding: "0",
		lastFundingPaymentTimestamp: "6000",
		timestampOpenPosition: "6000",
		timestamp: "6000",
		timestampFullyClose: "0",
		...overrides,
	};
}

function checkpoint(overrides = {}) {
	return {
		id: "0xaaa-1-0-SET_LONG",
		eventType: "SET_LONG",
		rawLongRate: "3000000000000000000",
		currentLongRate: "1000000000000000000",
		currentShortRate: "0",
		marketPrice: "1000000000000000000",
		accumulatedLongRate: "0",
		accumulatedShortRate: "0",
		snapshotLongFee: "0",
		snapshotShortFee: "0",
		epochDuration: "600",
		lastUpdatedEpoch: "10",
		startEpoch: "10",
		lastUpdatedTimestamp: "6000",
		timestamp: "6000",
		blockNumber: "1",
		transaction: "0xaaa",
		...overrides,
	};
}

test("authoritative current debt is independent of the displayed row cap", () => {
	const { buildFundingRows } = loadViewerContext();
	const build = buildFundingRows({
		quote: quote(),
		settlements: [],
		quoteEvents: [],
		checkpoints: [checkpoint()],
		asOfTimestamp: 9000,
		maxRows: 2,
	});

	assert.equal(build.totalRowCount.toString(), "5");
	assert.deepEqual(
		Array.from(build.rows, row => row.epoch.toString()),
		["13", "14"],
	);
	assert.equal(build.rows[0].rate.toString(), "1000000000000000000", "stored currentRate is already price-adjusted");
	assert.equal(build.totals.unpaidDebt.toString(), "5000000000000000000");
	assert.equal(build.totals.exactCurrent, true);
	assert.equal(build.warnings.length, 0);
});

test("epoch-duration changes preserve each checkpoint's timestamp grid", () => {
	const { buildFundingRows } = loadViewerContext();
	const build = buildFundingRows({
		quote: quote(),
		settlements: [],
		quoteEvents: [],
		checkpoints: [
			checkpoint(),
			checkpoint({
				id: "0xbbb-2-0-SET_EPOCH_DURATION",
				eventType: "SET_EPOCH_DURATION",
				currentLongRate: "2000000000000000000",
				snapshotLongFee: "6000000000000000000",
				epochDuration: "1200",
				lastUpdatedEpoch: "8",
				startEpoch: "8",
				lastUpdatedTimestamp: "9600",
				timestamp: "9600",
				blockNumber: "2",
				transaction: "0xbbb",
			}),
		],
		asOfTimestamp: 14400,
		maxRows: 100,
	});

	assert.deepEqual(Array.from(build.durationRegimes), ["600", "1200"]);
	assert.equal(build.totalRowCount.toString(), "10");
	assert.equal(build.rows.filter(row => row.epochDuration === 600n).length, 6);
	assert.equal(build.rows.filter(row => row.epochDuration === 1200n).length, 4);
	assert.equal(build.totals.unpaidDebt.toString(), "14000000000000000000");
});

test("PartyA transient liquidation rows are settled without a balance change", () => {
	const { buildFundingRows } = loadViewerContext();
	const build = buildFundingRows({
		quote: quote({ closedAmount: "1000000000000000000", timestampFullyClose: "7200", timestamp: "7200" }),
		settlements: [
			{
				id: "0xccc-3-1",
				trigger: "LIQUIDATE_PARTY_A",
				signedAmount: "2000000000000000000",
				previousAccumulatedPaidFunding: "0",
				newAccumulatedPaidFunding: "0",
				previousLastFundingPaymentTimestamp: "6000",
				newLastFundingPaymentTimestamp: "6000",
				balanceChanged: false,
				timestamp: "7200",
				blockNumber: "3",
				transaction: "0xccc",
			},
		],
		quoteEvents: [
			{
				id: "0xccc-3-1",
				type: "LIQUIDATE_PARTY_A",
				metadata: '{"amount":"1000000000000000000"}',
				timestamp: "7200",
				blockNumber: "3",
				transaction: "0xccc",
			},
		],
		checkpoints: [checkpoint()],
		asOfTimestamp: 8000,
		maxRows: 100,
	});

	assert.deepEqual(
		Array.from(build.rows, row => row.status),
		["SETTLED_WITHOUT_BALANCE_CHANGE", "SETTLED_WITHOUT_BALANCE_CHANGE"],
	);
	assert.equal(build.totals.paid.toString(), "2000000000000000000");
	assert.equal(build.totals.unpaidDebt.toString(), "0");
	assert.equal(build.totals.openAmount.toString(), "0");
	assert.doesNotMatch(build.warnings.join(" "), /does not match quote\.closedAmount/);
});

test("realized totals use the settlement signed amount instead of rounded virtual rows", () => {
	const { buildFundingRows } = loadViewerContext();
	const build = buildFundingRows({
		quote: quote({ closedAmount: "1", quantity: "1", timestampFullyClose: "7200", timestamp: "7200" }),
		settlements: [
			{
				id: "0xddd-4-1",
				trigger: "LIQUIDATE_CLEARING_HOUSE",
				signedAmount: "1",
				previousAccumulatedPaidFunding: "0",
				newAccumulatedPaidFunding: "2000000000000000000",
				previousLastFundingPaymentTimestamp: "6000",
				newLastFundingPaymentTimestamp: "7200",
				balanceChanged: true,
				timestamp: "7200",
				blockNumber: "4",
				transaction: "0xddd",
			},
		],
		quoteEvents: [
			{
				id: "0xddd-4-1",
				type: "LIQUIDATE_CLEARING_HOUSE",
				metadata: '{"amount":"1"}',
				timestamp: "7200",
				blockNumber: "4",
				transaction: "0xddd",
			},
		],
		checkpoints: [checkpoint({ currentLongRate: "1" })],
		asOfTimestamp: 7200,
		maxRows: 100,
	});

	assert.equal(build.rows.reduce((sum, row) => sum + row.signedAmount, 0n).toString(), "0");
	assert.equal(build.totals.paid.toString(), "1");
});

test("uPNL calculator combines side-aware price pnl with authoritative unpaid funding", () => {
	const { calculateQuoteUpnl, parseDecimalUnits } = loadViewerContext();

	const longResult = calculateQuoteUpnl(
		{
			positionType: 0,
			quantity: "18776521000000000000",
			closedAmount: "0",
			openedPrice: "50626415511838653",
		},
		{
			openAmount: 18776521000000000000n,
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
			openAmount: 8000000000000000000n,
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

test("history queries paginate by stable entity id", () => {
	const context = loadViewerContext();
	const queries = vm.runInContext("[SETTLEMENT_PAGE_QUERY, QUOTE_EVENT_PAGE_QUERY, CHECKPOINT_PAGE_QUERY]", context);
	for (const query of queries) {
		assert.match(query, /orderBy: id/);
		assert.match(query, /id_gt: \$cursor/);
	}
});

test("authoritative funding amounts surface precision and an exact raw value", () => {
	const { formatFundingAmount, exactFundingAmount } = loadViewerContext();
	assert.equal(formatFundingAmount(77940624625078821992n), "77.940624625078…");
	assert.equal(exactFundingAmount(77940624625078821992n), "77.940624625078821992 (77940624625078821992 raw)");
});
