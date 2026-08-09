import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import test from "node:test";

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const overloads = [
	{
		name: "Deposit",
		// v0.8.6 wires the 4-param isVirtual overload (generated class Deposit1) so virtual
		// deposits can be excluded; the 3-param compat event dual-fires for virtual deposits too.
		signature: "Deposit(address,address,uint256,bool)",
		generatedClass: "Deposit1",
	},
	{
		name: "SendQuote",
		signature: "SendQuote(address,uint256,address[],uint256,uint8,uint8,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256)",
	},
	{
		name: "OpenPosition",
		signature: "OpenPosition(uint256,address,address,uint256,uint256)",
	},
	{
		name: "FillCloseRequest",
		signature: "FillCloseRequest(uint256,address,address,uint256,uint256,uint8,uint256)",
	},
	{
		name: "LiquidatePositionsPartyA",
		signature: "LiquidatePositionsPartyA(address,address,uint256[],uint256[],uint256[],bytes)",
	},
	{
		name: "LiquidatePositionsPartyB",
		signature: "LiquidatePositionsPartyB(address,address,address,uint256[],uint256[],uint256[])",
	},
];

const eventOverloads = [
	{
		name: "Deposit",
		signature: "Deposit(address,address,uint256,bool)",
	},
	{
		name: "SendQuote",
		signature: "SendQuote(address,uint256,address[],address,bytes,bytes)",
	},
	{
		name: "OpenPosition",
		signature: "OpenPosition(uint256,address,address,uint256,uint256,(uint256,uint256,uint256,uint256))",
	},
	{
		name: "FillCloseRequest",
		signature: "FillCloseRequest(uint256,address,address,uint256,uint256,uint8,uint256,(uint256,uint256,uint256,uint256))",
	},
	{
		name: "LiquidatePositionsPartyA",
		signature: "LiquidatePositionsPartyA(address,address,uint256[],uint256[],uint256[],uint256[],bytes)",
	},
	{
		name: "LiquidatePositionsPartyB",
		signature: "LiquidatePositionsPartyB(address,address,address,uint256[],uint256[],uint256[],uint256[])",
	},
];

const v086OnlyEventNames = [
	"AccumulatedFundingStateUpdated",
	"AdjustmentCancelled",
	"AdjustmentScheduled",
	"CancelAffiliateShutdown",
	"CloseAffiliatePositions",
	"DistributeFromLiquidationEscrow",
	"LiquidationEscrowCreated",
	"OperationalFeeAllowanceReductionRequested",
	"OperationalFeeAllowanceSet",
	"OperationalFeeCharged",
	"OperationalFeeChargerRegistered",
	"OperationalFeeChargerUnregistered",
	"OperationalFeeMultiplierSet",
	"OperationalFeeReductionDelaySet",
	"PauseWithdrawAdvance",
	"PartyAReimbursementChange",
	"PendingQuoteCancelledByAdjustment",
	"PriceAdjustmentConfirmed",
	"QuoteAdjusted",
	"RestatementAborted",
	"RestatementFinalized",
	"RestatementStarted",
	"ScheduleAffiliateShutdown",
	"SendQuoteSolverFeeCaps",
	"SetDeactiveInstantActionModeCooldown",
	"SetLegacyPartyALiquidationDeprecated",
	"SetMuonFunctionUpnlValidTime",
	"SetOperationalFeeReceiver",
	"SetPartyALiquidationSnapshot",
	"SetPartyBStrictDeallocation",
	"SetPartyBOpenPositionsPausedForPartyB",
	"SetSolverFeeReceiver",
	"UnpauseWithdrawAdvance",
	"WithdrawAdvanced",
];

test("v0.8.6 dependency files inherit their complete v0.8.5 model coverage", () => {
	for (const area of ["common", "analytics", "events"]) {
		const deps = JSON.parse(read(`perps/${area}/deps_symmio_0_8_6.json`));
		assert.equal(deps.__extends, "deps_symmio_0_8_5.json", `${area} must explicitly inherit v0.8.5`);
	}
});

test("v0.8.6 analytics dependencies select new overloaded core event signatures only", () => {
	const deps = JSON.parse(read("perps/analytics/deps_symmio_0_8_6.json"));
	const events = new Set(Object.values(deps).flat());

	for (const { name, signature } of overloads) {
		assert.ok(events.has(signature), `v0.8.6 deps must include ${signature}`);
		assert.equal(events.has(name), false, `v0.8.6 deps must not use bare overloaded ${name}`);
	}
});

test("v0.8.6 raw events select the richer payload overloads and every release-only event", () => {
	const deps = JSON.parse(read("perps/events/deps_symmio_0_8_6.json"));

	assert.deepEqual(deps.SettlePartyBUpnlForLiquidation, ["SettlePartyBUpnlForLiquidation"], "Party B liquidation settlements must not be dropped");
	for (const { name, signature } of eventOverloads) {
		assert.deepEqual(deps[name], [signature], `${name} must map to its full-fidelity overload`);
	}
	for (const eventName of v086OnlyEventNames) {
		assert.deepEqual(deps[eventName], [eventName], `missing release-only ${eventName}`);
	}
	assert.deepEqual(deps.SettlePartyALiquidation, ["SettlePartyALiquidation(address,address[],address[],int256[],uint256[],bytes)"]);
	assert.deepEqual(deps.OpenSolverFeeCharged, ["OpenSolverFeeCharged(uint256,address,address,address,uint256,uint256)"]);
	assert.deepEqual(deps.CloseSolverFeeCharged, ["CloseSolverFeeCharged(uint256,address,address,address,uint256,uint256)"]);
});

test("v0.8.6 analytics selects one exact extended PartyA settlement event", () => {
	const deps = JSON.parse(read("perps/analytics/deps_symmio_0_8_6.json"));
	const events = Object.values(deps).flat();
	const signature = "SettlePartyALiquidation(address,address[],address[],int256[],uint256[],bytes)";
	assert.ok(events.includes(signature));
	assert.equal(events.includes("SettlePartyALiquidation"), false);
	assert.ok(events.includes("PartyAReimbursementChange"));
});

test("v0.8.6 analytics source wires the new overloaded core event handlers", () => {
	const source = read("perps/analytics/src_symmio_0_8_6.ts");

	for (const { name, generatedClass } of overloads) {
		const cls = generatedClass ?? name;
		assert.match(source, new RegExp(`${name}Handler`), `missing ${name} handler import`);
		assert.match(source, new RegExp(`export function handle${cls}\\(event: ${cls}\\)`), `missing handle${cls}`);
		if (!generatedClass) {
			assert.doesNotMatch(source, new RegExp(`${name}1`), `must not wire the other ${name} overload through v0.8.6`);
		}
	}
});

const duplicatedHyperEvmEvents = [
	"BalanceChangePartyA",
	"BalanceChangePartyB",
	"Deposit",
	"SendQuote",
	"OpenPosition",
	"FillCloseRequest",
	"LiquidatePositionsPartyA",
	"LiquidatePositionsPartyB",
];

test("Arbitrum switches directly from v0.8.4 to one full v0.8.6 core source", () => {
	const config = JSON.parse(read("configs/perps/arbitrum.json"));
	const coreSources = config.contracts.filter(contract => contract.abi === "symmio");

	assert.deepEqual(
		coreSources.map(contract => contract.version),
		["0_8_6", "0_8_4", "0_8_3", "0_8_2"],
	);
	assert.equal(
		coreSources.some(contract => contract.version === "0_8_5"),
		false,
		"legacy compatibility shim must be removed",
	);
	assert.equal(coreSources[0].startBlock, "454822977");
	assert.equal(coreSources[1].endBlock, "454822976");
});

test("HyperEVM mainnet analytics keeps the v0.8.5 core source only", () => {
	const config = JSON.parse(read("configs/perps/hyperevm.json"));
	const coreVersions = config.contracts.filter(contract => contract.abi === "symmio").map(contract => contract.version);

	assert.deepEqual(coreVersions, ["0_8_5"]);
	assert.equal(config.deploy_urls["perps/analytics"], "hyperevm_mainnet_analytics");

	const legacyCore = config.contracts.find(contract => contract.abi === "symmio" && contract.version === "0_8_5");
	assert.ok(legacyCore, "missing legacy core data source");
	assert.equal(legacyCore.excludedEvents, undefined, "mainnet v0.8.5 must not drop core lifecycle events");
});

test("HyperEVM v0.8.6 wiring is limited to stage and must suppress duplicated legacy events", () => {
	const mainnet = JSON.parse(read("configs/perps/hyperevm.json"));
	const stage = JSON.parse(read("configs/perps/hyperevm_stage.json"));

	assert.equal(
		mainnet.contracts.some(contract => contract.abi === "symmio" && contract.version === "0_8_6"),
		false,
		"mainnet HyperEVM must not use v0.8.6",
	);

	const stageCore086 = stage.contracts.find(contract => contract.abi === "symmio" && contract.version === "0_8_6");
	if (!stageCore086) return;

	assert.equal(stage.deploy_urls["perps/analytics"], "hyperevm_analytics");

	const stageLegacy = stage.contracts.find(contract => contract.abi === "symmio" && contract.version === "0_8_5");
	assert.ok(stageLegacy, "stage v0.8.6 needs the legacy source for old-only events");
	const excludedEvents = new Set(stageLegacy.excludedEvents);
	for (const eventName of duplicatedHyperEvmEvents) {
		assert.ok(excludedEvents.has(eventName), `stage legacy source must exclude duplicated ${eventName}`);
	}
});

test("every config pairing symmio v0.8.5 and v0.8.6 suppresses duplicated legacy events", () => {
	// v0.8.6 cores dual-emit legacy+new overloads per action (LibPartiesEvents/LibSendQuoteEvents/AccountFacet),
	// so when both data sources watch the same address the legacy source must drop the shared events.
	for (const file of readdirSync(new URL("../configs/perps/", import.meta.url))) {
		if (!file.endsWith(".json")) continue;
		const config = JSON.parse(read(`configs/perps/${file}`));
		const cores = (config.contracts ?? []).filter(contract => contract.abi === "symmio");
		for (const core086 of cores.filter(contract => contract.version === "0_8_6")) {
			const legacySiblings = cores.filter(
				contract => contract.version === "0_8_5" && contract.address.toLowerCase() === core086.address.toLowerCase(),
			);
			for (const legacy of legacySiblings) {
				const excludedEvents = new Set(legacy.excludedEvents);
				for (const eventName of duplicatedHyperEvmEvents) {
					assert.ok(excludedEvents.has(eventName), `${file}: v0.8.5 source at ${legacy.address} must exclude duplicated ${eventName}`);
				}
			}
		}
	}
});
