import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { parse, visit } from "graphql";

const root = process.cwd();

function read(relativePath) {
	return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function parseSchema(relativePath) {
	return parse(read(relativePath), { noLocation: true });
}

function getType(document, name) {
	return document.definitions.find(definition => definition.kind === "ObjectTypeDefinition" && definition.name.value === name);
}

function getField(type, name) {
	return type.fields.find(field => field.name.value === name);
}

function commonModelFiles(product) {
	return fs
		.readdirSync(path.join(root, product, "common/models"))
		.filter(file => file.endsWith(".graphql"))
		.map(file => `${product}/common/models/${file}`);
}

function canonicalSchemaFiles() {
	return [
		...commonModelFiles("perps"),
		"perps/analytics/schema.graphql",
		"perps/events/schema.graphql",
		...commonModelFiles("options"),
		"options/events/schema.graphql",
	];
}

function parseSyncMetaSchema() {
	const manager = read("scripts/manager.py");
	const match = manager.match(/SYNC_META_SCHEMA = """([\s\S]*?)"""/);
	assert.ok(match, "SYNC_META_SCHEMA literal must remain discoverable");
	return parse(match[1].replaceAll('\\"', '"'), { noLocation: true });
}

function collectUndocumented(schemaFile, document) {
	const undocumented = [];
	visit(document, {
		ObjectTypeDefinition(node) {
			if (!node.description) undocumented.push(`${schemaFile}:${node.name.value}`);
			for (const field of node.fields ?? []) {
				if (!field.description) undocumented.push(`${schemaFile}:${node.name.value}.${field.name.value}`);
			}
		},
	});
	return undocumented;
}

test("every canonical perps, options, and manager-injected object type and field is documented", () => {
	const undocumented = canonicalSchemaFiles().flatMap(schemaFile => collectUndocumented(schemaFile, parseSchema(schemaFile)));
	undocumented.push(...collectUndocumented("scripts/manager.py:SYNC_META_SCHEMA", parseSyncMetaSchema()));
	assert.deepEqual(undocumented, []);
});

test("schema descriptions reject tautological and placeholder boilerplate", () => {
	const badDescriptions = [];
	const bannedPatterns = [
		/^Indexed field\b/i,
		/\bassociated with this row\b/i,
		/\bfor this row\b/i,
		/^Stored `[^`]+` value\b/i,
		/^Raw amount associated\b/i,
		/^Array of raw\b/i,
		/^Raw (?:address|numeric|boolean|string|bytes) parameter\b/i,
		/^Raw `[^`]+` value from\b/i,
		/^Subgraph entity id\b/i,
		/^Subgraph or event type label\b/i,
		/^Metadata value indexed\b/i,
		/^Immutable .*snapshot for the `[^`]+` event/i,
		/Immutable protocol log capturing the actors, identifiers, and values for/i,
		/whose protocol state is changed by/i,
		/exact role follows the configured event ABI/i,
		/scale follows the event family/i,
		/Absolute balance or settlement quantity/i,
		/after this configuration change/i,
		/Ordered values emitted during/i,
		/Contract numeric value that quantifies/i,
		/or latest explicit entity update/i,
		/^Protocol (?:symbol|quote) ids? associated\b/i,
		/^(?:PartyA|PartyB|User|Affiliate|Account|Collateral token) .* associated\b/i,
		/^Event sender or transaction sender\b/i,
		/^Subgraph status label\b/i,
		/recorded by .*units and enum interpretation follow/i,
		/address, identifier, or bytes payload used in/i,
		/^Protocol lifecycle occurrence that records/i,
		/^Human-readable or handler-defined/i,
		/TODO|FIXME|TBD/,
	];

	for (const schemaFile of canonicalSchemaFiles()) {
		visit(parseSchema(schemaFile), {
			ObjectTypeDefinition(node) {
				if (node.description && bannedPatterns.some(pattern => pattern.test(node.description.value))) {
					badDescriptions.push(`${schemaFile}:${node.name.value}`);
				}
				for (const field of node.fields ?? []) {
					if (field.description && bannedPatterns.some(pattern => pattern.test(field.description.value))) {
						badDescriptions.push(`${schemaFile}:${node.name.value}.${field.name.value}`);
					}
				}
			},
		});
	}

	assert.deepEqual(badDescriptions, []);
});

test("event envelope docs use block-global log indexes and containing transaction hashes", () => {
	const failures = [];
	for (const schemaFile of ["perps/events/schema.graphql", "options/events/schema.graphql"]) {
		visit(parseSchema(schemaFile), {
			ObjectTypeDefinition(node) {
				const logIndex = node.fields?.find(field => field.name.value === "logIndex");
				if (logIndex && (!/block/i.test(logIndex.description?.value ?? "") || /receipt/i.test(logIndex.description?.value ?? ""))) {
					failures.push(`${schemaFile}:${node.name.value}.logIndex`);
				}
				const transactionHash = node.fields?.find(field => field.name.value === "transactionHash");
				if (transactionHash && !/transaction containing/i.test(transactionHash.description?.value ?? "")) {
					failures.push(`${schemaFile}:${node.name.value}.transactionHash`);
				}
			},
		});
	}
	assert.deepEqual(failures, []);
});

test("aggregate and helper IDs document their actual composite keys", () => {
	const document = parseSchema("perps/analytics/schema.graphql");
	assert.match(getField(getType(document, "DailyHistory"), "id").description.value, /UTC-day-start milliseconds.*SYMMIO core.*account-source/i);
	assert.match(getField(getType(document, "QuoteEvent"), "id").description.value, /transaction hash.*log index.*quote id/i);
	assert.match(getField(getType(document, "LiquidationEvent"), "id").description.value, /transaction hash.*log index.*liquidation-event type/i);
	assert.match(getField(getType(document, "WithdrawRequestLookup"), "id").description.value, /requestId.*SYMMIO core/i);
	assert.match(getField(getType(document, "AffiliateExpressWithdrawComponentBucket"), "id").description.value, /components\.id.*bucket/i);
});

test("allocation event docs identify actors, balance direction, and 18-decimal units", () => {
	const document = parseSchema("perps/events/schema.graphql");
	const allocate = getType(document, "AllocateForPartyB");
	assert.match(getField(allocate, "amount").description.value, /18-decimal.*PartyB free balance.*allocation bucket/i);
	assert.match(getField(allocate, "partyA").description.value, /allocation-bucket key/i);
	assert.match(getField(allocate, "partyB").description.value, /whose funds were allocated/i);
	const deallocate = getType(document, "DeallocatePartyA");
	assert.match(getField(deallocate, "amount").description.value, /18-decimal.*returned.*free balance/i);
	assert.match(getField(deallocate, "newAllocatedBalance").description.value, /resulting allocated balance/i);
});

test("Quote and Liquidation lifecycle relations identify their target aggregates", () => {
	const document = parseSchema("perps/analytics/schema.graphql");
	assert.match(getField(getType(document, "QuoteEvent"), "quote").description.value, /normalized Quote entity changed/i);
	assert.match(getField(getType(document, "LiquidationEvent"), "liquidationDetail").description.value, /LiquidationDetail.*aggregate changed/i);
	const quoteDocument = parseSchema("perps/common/models/Quote.graphql");
	assert.match(getField(getType(quoteDocument, "Quote"), "quoteEvents").description.value, /relation points to this Quote/i);
	assert.match(getField(getType(quoteDocument, "Quote"), "fundingSettlements").description.value, /relation points to this Quote/i);
});

test("timestamps distinguish first creation, latest update, and first terminal quote time", () => {
	const analytics = parseSchema("perps/analytics/schema.graphql");
	const buyback = getType(analytics, "BuybackGatewayStats");
	assert.match(getField(buyback, "firstActivityAt").description.value, /first indexed/i);
	assert.match(getField(buyback, "lastActivityAt").description.value, /latest indexed/i);
	const daily = getType(analytics, "DailyHistory");
	assert.match(getField(daily, "timestamp").description.value, /first created.*neither bucket start nor latest update/i);
	assert.match(getField(daily, "updateTimestamp").description.value, /Most recent/i);
	const quoteDocument = parseSchema("perps/common/models/Quote.graphql");
	assert.match(getField(getType(quoteDocument, "Quote"), "timestampFullyClose").description.value, /First indexed timestamp/i);
});

test("Quote prices, quantities, locked values, and fee rates state 1e18 semantics", () => {
	const document = parseSchema("perps/common/models/Quote.graphql");
	const quote = getType(document, "Quote");
	for (const fieldName of ["requestedOpenPrice", "quantity", "cva", "lf", "partyAmm", "partyBmm"]) {
		assert.match(getField(quote, fieldName).description.value, /1e18|18-decimal/i, fieldName);
	}
	assert.match(getField(quote, "tradingFee").description.value, /Open-fee rate.*1e18.*100%/);
	assert.match(getField(quote, "tradingFee").description.value, /zero when older cores omitted/i);
	assert.match(getField(quote, "closeFee").description.value, /Close-fee rate.*1e18.*100%/);
	assert.match(getField(quote, "closeFee").description.value, /zero for older core versions/);
});

test("analytics aggregate fee fields document charged amount semantics", () => {
	const document = parseSchema("perps/analytics/schema.graphql");
	const dailyHistory = getType(document, "DailyHistory");
	assert.match(getField(dailyHistory, "platformFee").description.value, /openFee \+ closeFee/);
	assert.match(getField(dailyHistory, "openFee").description.value, /charged open-fee amount/);
	assert.match(getField(dailyHistory, "closeFee").description.value, /charged close-fee amount/);
});

test("withdrawal docs distinguish classic, express, virtual, advanced, and finalization roles", () => {
	const analytics = parseSchema("perps/analytics/schema.graphql");
	const request = getType(analytics, "WithdrawRequest");
	assert.match(getField(request, "classicAmount").description.value, /neither virtual nor express provider/i);
	assert.match(getField(request, "expressAmount").description.value, /non-virtual.*express provider/i);
	assert.match(getField(request, "virtualAmount").description.value, /all parts having a virtual provider/i);
	assert.match(getField(request, "advancedAmount").description.value, /transferred early.*provider/i);
	const events = parseSchema("perps/events/schema.graphql");
	assert.match(getField(getType(events, "WithdrawAccepted"), "optionType").description.value, /0 SAME_TX.*1 WINDOWED.*2 STANDARD/i);
	assert.match(getField(getType(events, "WithdrawFinalized"), "user").description.value, /finalizing signer.*differ from the request owner/i);
});

test("component docs preserve no-scaling, hardcoded-decimal, and unavailable bucket-debt semantics", () => {
	const document = parseSchema("perps/analytics/schema.graphql");
	const components = getType(document, "AffiliateExpressWithdrawComponents");
	assert.match(getField(components, "collateralDecimals").description.value, /hardcoded to 0.*not used for scaling/i);
	assert.match(getField(components, "freeBalance18").description.value, /18-decimal.*without token-decimal scaling/i);
	const bucket = getType(document, "AffiliateExpressWithdrawComponentBucket");
	for (const fieldName of ["reservedDebtCollateral", "activeDebtCollateral", "badDebtCollateral"]) {
		assert.match(getField(bucket, fieldName).description.value, /unpopulated.*zero.*not attributed to account buckets/i, fieldName);
	}
});

test("funding docs preserve signs and the PartyA debit-credit perspective", () => {
	const document = parseSchema("perps/analytics/schema.graphql");
	assert.match(getField(getType(document, "FundingRateSnapshot"), "longFee").description.value, /Signed raw 18-decimal/i);
	const settlement = getType(document, "QuoteFundingSettlement");
	assert.match(getField(settlement, "signedAmount").description.value, /positive means PartyA owes PartyB/i);
	assert.match(getField(settlement, "paidByPartyA").description.value, /max\(signedAmount, 0\)/i);
	assert.match(getField(settlement, "receivedByPartyA").description.value, /max\(-signedAmount, 0\)/i);
});

test("embedded event payload helper types are not documented as standalone events", () => {
	const document = parseSchema("perps/events/schema.graphql");
	for (const typeName of ["QuoteSettlementData", "UnifiedQuoteSettlementData", "WithdrawPart", "PartyBQuoteSettlementData"]) {
		const type = getType(document, typeName);
		assert.ok(type.description);
		assert.doesNotMatch(type.description.value, /event snapshot/i);
	}
});

test("known raw-event fidelity exceptions are explicit in descriptions", () => {
	const document = parseSchema("perps/events/schema.graphql");
	assert.match(getType(document, "DiamondCut").description.value, /payload.*not indexed/i);
	assert.match(getField(getType(document, "BindToPartyB"), "partyA").description.value, /PartyB/i);
	assert.match(getField(getType(document, "WithdrawFinalized"), "user").description.value, /finalizing signer/i);
	assert.match(getField(getType(document, "AddSymbol"), "maxLeverage").description.value, /legacy.*omit/i);
});

test("options docs preserve configured-ABI uncertainty instead of inventing semantics", () => {
	const document = parseSchema("options/events/schema.graphql");
	assert.match(getField(getType(document, "PartyBConfig"), "lossCoverage").description.value, /version-specific.*unresolved/i);
	assert.match(getField(getType(document, "SendOpenIntent"), "partyBsWhiteList").description.value, /permitted/i);
	assert.match(
		getField(getType(document, "InternalTransfer"), "amount").description.value,
		/configured ABI.*differs from current options-core.*unresolved/i,
	);
});

test("options pause and emergency docs state control transitions without inventing custody", () => {
	const document = parseSchema("options/events/schema.graphql");
	assert.match(getType(document, "DepositPaused").description.value, /entered the paused state.*does not move or take custody/i);
	assert.match(getType(document, "WithdrawPaused").description.value, /entered the paused state.*does not move or take custody/i);
	assert.match(getType(document, "DepositUnpaused").description.value, /returned to the enabled state/i);
	assert.match(getType(document, "EmergencyModeActivated").description.value, /emergency mode entered the active state.*no custody transfer/i);
	assert.match(getType(document, "PartyBEmergencyStatusDeactivated").description.value, /inactive state.*PartyB/i);
});

test("schema terminology keeps PartyA, PartyB, UPNL, and withdrawal words intact", () => {
	const malformed = /party bwithdrawal|party aupdated|party adeallocate|party bemergency|new tlement/;
	for (const schemaFile of canonicalSchemaFiles()) {
		visit(parseSchema(schemaFile), {
			StringValue(node) {
				assert.doesNotMatch(node.value, malformed, schemaFile);
			},
		});
	}
	assert.match(getField(getType(parseSchema("options/events/schema.graphql"), "Liquidate"), "upnl").description.value, /UPNL/);
});

test("reviewed edge-case descriptions preserve actor, sign, legacy, and identifier semantics", () => {
	const events = parseSchema("perps/events/schema.graphql");
	assert.match(getField(getType(events, "SetSpeedUpUser"), "speedUp").description.value, /user.*reduced withdrawal cooldown/i);
	assert.match(getField(getType(events, "CompleteUnbindRequest"), "partyB").description.value, /logical signer.*PartyA after cooldown/i);
	assert.match(getField(getType(events, "WithdrawPart"), "receiver").description.value, /opaque.*not necessarily an EVM address/i);
	assert.match(getField(getType(events, "WithdrawPart"), "chainId").description.value, /signed.*sentinel/i);

	const analytics = parseSchema("perps/analytics/schema.graphql");
	assert.match(getType(analytics, "SymbolTradeHistory").description.value, /all-time/i);
	for (const typeName of [
		"DailyUserHistory",
		"TotalUserHistory",
		"DailyAccountOwnerHistory",
		"TotalAccountOwnerHistory",
		"DailySubAccountHistory",
		"TotalSubAccountHistory",
		"DailyVirtualAccountHistory",
		"TotalVirtualAccountHistory",
		"DailySymbolTradesHistory",
		"TotalSymbolTradesHistory",
	]) {
		assert.match(getField(getType(analytics, typeName), "loss").description.value, /negative.*non-positive.*excludes funding/i);
	}

	const quoteModels = parseSchema("perps/common/models/Quote.graphql");
	for (const typeName of ["PartyA", "PartyBPartyA", "PartyASymbolPrice"]) {
		assert.match(getType(quoteModels, typeName).description.value, /unused legacy.*no current.*handler/i);
	}
	assert.match(
		getField(getType(quoteModels, "GlobalFee"), "globalFee").description.value,
		/funding received minus funding paid.*not a protocol-fee total/i,
	);

	const options = parseSchema("options/events/schema.graphql");
	for (const typeName of ["RoleGranted", "RoleRevoked"]) {
		assert.match(getField(getType(options, typeName), "source").description.value, /contract that emitted/i);
		assert.ok(getField(getType(options, typeName), "account"));
		assert.ok(getField(getType(options, typeName), "sender"));
	}
	assert.equal(getField(getType(options, "SendOpenIntent"), "partyBsWhiteList").type.kind, "NonNullType");
});

test("schema documentation guide identifies canonical generation and provenance rules", () => {
	const docs = read("docs/perps-subgraph-schema-docs.md");
	assert.match(docs, /Do not edit generated root `schema\.graphql`/);
	assert.match(docs, /options\/events\/schema\.graphql/);
	assert.match(docs, /SYNC_META_SCHEMA/);
	assert.match(docs, /block-global/);
	assert.match(docs, /Do not\s+use descriptions that merely restate/);
});
