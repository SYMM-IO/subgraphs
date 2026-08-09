import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const entityBlock = (schema, name) => {
	const match = schema.match(new RegExp(`type ${name} @entity\\([^)]*\\) \\{[\\s\\S]*?\\n\\}`));
	assert.ok(match, `missing ${name} entity`);
	return match[0];
};

test("express provider ABI matches the released withdrawal lifecycle events", () => {
	const abi = JSON.parse(read("configs/abis/expressProvider_1.json"));
	const events = new Map(abi.filter(entry => entry.type === "event").map(entry => [entry.name, entry]));

	assert.deepEqual(
		events.get("WithdrawAccepted").inputs.map(({ name, type, indexed }) => ({ name, type, indexed })),
		[
			{ name: "user", type: "address", indexed: true },
			{ name: "requestId", type: "uint256", indexed: true },
			{ name: "optionType", type: "uint8", indexed: false },
		],
	);
	assert.deepEqual(
		events.get("WithdrawAccelerated").inputs.map(({ name, type, indexed }) => ({ name, type, indexed })),
		[
			{ name: "user", type: "address", indexed: true },
			{ name: "requestId", type: "uint256", indexed: true },
			{ name: "affiliate", type: "address", indexed: true },
			{ name: "affiliateAmount", type: "uint256", indexed: false },
			{ name: "creditAmount", type: "uint256", indexed: false },
			{ name: "generalAmount", type: "uint256", indexed: false },
		],
	);
	assert.deepEqual(
		events.get("WithdrawProcessed").inputs.map(({ name, type, indexed }) => ({ name, type, indexed })),
		[
			{ name: "user", type: "address", indexed: true },
			{ name: "requestId", type: "uint256", indexed: true },
		],
	);
	assert.deepEqual(
		events.get("WithdrawUnlockedAndProcessed").inputs.map(({ name, type, indexed }) => ({ name, type, indexed })),
		[
			{ name: "user", type: "address", indexed: true },
			{ name: "requestId", type: "uint256", indexed: true },
		],
	);
});

test("analytics records acceleration values and consumes pre-init provider events safely", () => {
	const schema = read("perps/analytics/schema.graphql");
	const helper = read("perps/analytics/utils/affiliateExpressWithdrawComponents.ts");
	const initiated = read("perps/analytics/handlers/symmio/WithdrawInitiatedHandler.ts");
	const manager = read("scripts/manager.py");
	const withdrawRequest = entityBlock(schema, "WithdrawRequest");

	for (const field of [
		"acceleratedAt: BigInt",
		"accelerationAffiliate: Bytes",
		"accelerationAffiliateAmount: BigInt",
		"accelerationCreditAmount: BigInt",
		"accelerationGeneralAmount: BigInt",
		"providerOptionType: Int",
		"providerStatus: String",
		"providerStatusUpdatedAt: BigInt",
		"providerStatusBlockNumber: BigInt",
		"providerStatusTransaction: Bytes",
		"providerProcessedAt: BigInt",
		"providerProcessedBlockNumber: BigInt",
		"providerProcessedTransaction: Bytes",
		"providerProcessingEvent: String",
	]) {
		assert.match(withdrawRequest, new RegExp(field));
	}
	assert.match(schema, /type ExpressProviderWithdrawLifecycleHint @entity\(immutable: false\)/);
	assert.match(entityBlock(schema, "ExpressProviderWithdrawLifecycleHint"), /providerOptionType: Int/);
	assert.match(entityBlock(schema, "ExpressProviderWithdrawLifecycleHint"), /providerStatus: String/);
	assert.match(manager, /"ExpressProviderWithdrawLifecycleHint"/);

	const idStart = helper.indexOf("function providerWithdrawLifecycleHintId");
	const idEnd = helper.indexOf("function bucketId", idStart);
	const idHelper = helper.slice(idStart, idEnd);
	for (const identity of ["source.toHexString()", "user.toHexString()", "requestId.toString()", "transaction.toHexString()"]) {
		assert.match(idHelper, new RegExp(identity.replace(/[().]/g, "\\$&")), `hint id omits ${identity}`);
	}
	assert.doesNotMatch(idHelper, /provider\.toHexString\(\)/, "core events must resolve the hint without a provider address");

	const applyStart = initiated.indexOf("applyWithdrawRequestToAffiliateExpressWithdrawComponents(");
	const lookupStart = initiated.indexOf("addWithdrawRequestToLookup(wr)");
	const consumeStart = initiated.indexOf("consumeExpressProviderWithdrawLifecycleHint(");
	assert.ok(
		applyStart < lookupStart && lookupStart < consumeStart,
		"pre-init lifecycle must be consumed after pending accounting and lookup creation",
	);
	assert.match(initiated, /consumeExpressProviderWithdrawLifecycleHint\(wr, expressProvider, _event\.transaction\.hash\)/);

	const consumeHelper = helper.slice(helper.indexOf("export function consumeExpressProviderWithdrawLifecycleHint"));
	assert.match(consumeHelper, /hint\.transaction\.toHexString\(\) != transaction\.toHexString\(\)/);
	assert.match(consumeHelper, /store\.remove\("ExpressProviderWithdrawLifecycleHint", id\)/);
});

test("same-transaction debt and core advance events survive until WithdrawInitiated", () => {
	const schema = read("perps/analytics/schema.graphql");
	const helper = read("perps/analytics/utils/affiliateExpressWithdrawComponents.ts");
	const withdrawHelper = read("perps/analytics/utils/withdrawRequest.ts");
	const reservedHandler = read("perps/analytics/handlers/expressProvider/DebtReservedHandler.ts");
	const activatedHandler = read("perps/analytics/handlers/expressProvider/DebtActivatedHandler.ts");
	const advancedHandler = read("perps/analytics/handlers/symmio/WithdrawAdvancedHandler.ts");
	const providerHint = entityBlock(schema, "ExpressProviderWithdrawLifecycleHint");
	const coreHint = entityBlock(schema, "WithdrawCoreLifecycleHint");

	for (const field of ["reservedDebtAmount: BigInt!", "activeDebtAmount: BigInt!"]) {
		assert.match(providerHint, new RegExp(field.replace("*", "\\*")));
	}
	assert.doesNotMatch(providerHint, /advancedAmount:/);
	assert.match(coreHint, /advancedAmount: BigInt!/);
	for (const handler of [reservedHandler, activatedHandler, advancedHandler]) {
		assert.match(handler, /_event\.transaction\.hash/, "same-tx deferral must be transaction scoped");
	}

	const consumeStart = helper.indexOf("export function consumeExpressProviderWithdrawLifecycleHint");
	const consumeEnd = helper.indexOf("export function recordReservedCreditLineDebt", consumeStart);
	const consume = helper.slice(consumeStart, consumeEnd);
	assert.match(consume, /request\.reservedDebtAmount = request\.reservedDebtAmount\.plus\(hint\.reservedDebtAmount\)/);
	assert.match(consume, /request\.activeDebtAmount = request\.activeDebtAmount\.plus\(hint\.activeDebtAmount\)/);
	assert.doesNotMatch(consume, /hint\.advancedAmount/);
	assert.match(consume, /applyExpressProviderProcessing\(request, processingEvent, hint\.transaction/);
	assert.doesNotMatch(consume, /removeWithdrawRequestFromLookup|removeWithdrawRequestFromAffiliateExpressWithdrawComponents/);
	assert.match(helper, /recordWithdrawCoreAdvanceHint\(/);
	assert.match(withdrawHelper, /hint\.advancedAmount = hint\.advancedAmount\.plus\(amount\)/);
	assert.match(withdrawHelper, /request\.advancedAmount = request\.advancedAmount\.plus\(hint\.advancedAmount\)/);

	const reservedStart = helper.indexOf("export function recordReservedCreditLineDebt");
	const activatedStart = helper.indexOf("export function recordActivatedCreditLineDebt");
	const settledStart = helper.indexOf("export function recordSettledCreditLineDebt");
	assert.match(helper.slice(reservedStart, activatedStart), /hint\.reservedDebtAmount = hint\.reservedDebtAmount\.plus\(amount\)/);
	assert.match(helper.slice(activatedStart, settledStart), /hint\.reservedDebtAmount = hint\.reservedDebtAmount\.minus\(amount\)/);
	assert.match(helper.slice(activatedStart, settledStart), /hint\.activeDebtAmount = hint\.activeDebtAmount\.plus\(amount\)/);
});

test("provider processing remains distinct from the core request terminal state", () => {
	const helper = read("perps/analytics/utils/affiliateExpressWithdrawComponents.ts");
	const processedHandler = read("perps/analytics/handlers/expressProvider/WithdrawProcessedHandler.ts");
	const unlockedHandler = read("perps/analytics/handlers/expressProvider/WithdrawUnlockedAndProcessedHandler.ts");
	const finalizedHandler = read("perps/analytics/handlers/symmio/WithdrawFinalizedHandler.ts");
	const processingStart = helper.indexOf("function applyExpressProviderProcessing");
	const processingEnd = helper.indexOf("export function recordExpressProviderWithdrawAccepted", processingStart);
	const processing = helper.slice(processingStart, processingEnd);

	assert.match(processing, /request\.providerProcessedAt = timestamp/);
	assert.match(processing, /request\.providerProcessingEvent = processingEvent/);
	assert.match(processing, /applyExpressProviderStatus\(request, "PROCESSED"/);
	assert.doesNotMatch(processing, /request\.status = "PROCESSED"/);
	assert.doesNotMatch(processing, /removeWithdrawRequestFromLookup|removeWithdrawRequestFromAffiliateExpressWithdrawComponents/);
	assert.match(finalizedHandler, /wr\.status = "COMPLETED"/);
	assert.match(finalizedHandler, /removeWithdrawRequestFromAffiliateExpressWithdrawComponents/);
	assert.match(finalizedHandler, /removeWithdrawRequestFromLookup/);
	assert.match(processedHandler, /"WithdrawProcessed"/);
	assert.match(unlockedHandler, /"WithdrawUnlockedAndProcessed"/);
	assert.doesNotMatch(processedHandler, /updatePartyALatestBalance|latestAccountBalance|symmio_/);
});

test("provider acceptance preserves the released option tier even after the core acceptance event", () => {
	const helper = read("perps/analytics/utils/affiliateExpressWithdrawComponents.ts");
	const handler = read("perps/analytics/handlers/expressProvider/WithdrawAcceptedHandler.ts");
	const acceptedStart = helper.indexOf("export function recordExpressProviderWithdrawAccepted");
	const acceleratedStart = helper.indexOf("export function recordExpressProviderWithdrawAccelerated", acceptedStart);
	const accepted = helper.slice(acceptedStart, acceleratedStart);

	assert.match(handler, /event\.params\.optionType/);
	assert.match(accepted, /request\.providerOptionType = optionType/);
	assert.match(accepted, /if \(request\.status == "PENDING"\) request\.status = "PROVIDER_ACCEPTED"/);
	assert.doesNotMatch(accepted, /if \(request\.status != "PENDING"\) return/);
	assert.match(accepted, /hint\.providerOptionType = optionType/);
	assert.match(helper, /if \(hint\.accepted\) request\.providerOptionType = hint\.providerOptionType/);
	assert.doesNotMatch(helper, /hint\.providerOptionType !== null/);
});

test("outer cancel-request events cannot reopen a synchronously cancelled request", () => {
	const handler = read("perps/analytics/handlers/symmio/WithdrawCancelRequestedHandler.ts");
	const load = handler.indexOf("loadWithdrawRequest(");
	const activeGuard = handler.indexOf("if (!isActiveWithdrawRequest(wr)) return");
	const statusWrite = handler.indexOf('wr.status = immediateCancel ? "CANCELLED" : "CANCEL_REQUESTED"');

	assert.ok(load !== -1 && activeGuard > load && statusWrite > activeGuard);
});

test("core lifecycle emitted before initiation is retained for express and pure-virtual requests", () => {
	const schema = read("perps/analytics/schema.graphql");
	const helper = read("perps/analytics/utils/withdrawRequest.ts");
	const accepted = read("perps/analytics/handlers/symmio/WithdrawAcceptedHandler.ts");
	const rejected = read("perps/analytics/handlers/symmio/WithdrawRejectedHandler.ts");
	const advanced = read("perps/analytics/utils/affiliateExpressWithdrawComponents.ts");
	const initiated = read("perps/analytics/handlers/symmio/WithdrawInitiatedHandler.ts");
	const deps = JSON.parse(read("perps/analytics/deps_symmio_0_8_5.json"));
	const releaseDeps = JSON.parse(read("perps/analytics/deps_symmio_0_8_6.json"));

	assert.match(schema, /type WithdrawCoreLifecycleHint @entity\(immutable: false\)/);
	assert.match(accepted, /recordWithdrawCoreStatusHint[\s\S]*"PROVIDER_ACCEPTED"/);
	assert.match(rejected, /recordWithdrawCoreStatusHint[\s\S]*"PROVIDER_REJECTED"/);
	assert.match(advanced, /recordWithdrawCoreAdvanceHint\(/);
	assert.match(initiated, /consumeWithdrawCoreLifecycleHint\(wr, _event\.transaction\.hash\)/);
	assert.match(initiated, /applyWithdrawAdvancedToAffiliateExpressWithdrawComponents\(/);
	assert.match(initiated, /if \(wr\.status == "PROVIDER_REJECTED"\)/);
	assert.match(initiated, /removeWithdrawRequestFromAffiliateExpressWithdrawComponents\(/);
	assert.match(initiated, /removeWithdrawRequestFromLookup\(wr\)/);
	assert.match(helper, /if \(hint\.status !== null\) request\.status = hint\.status!/);
	assert.match(helper, /store\.remove\("WithdrawCoreLifecycleHint", id\)/);
	assert.deepEqual(deps.WithdrawCoreLifecycleHint, ["WithdrawAccepted", "WithdrawRejected", "WithdrawInitiated"]);
	assert.deepEqual(releaseDeps.WithdrawCoreLifecycleHint, ["WithdrawAccepted", "WithdrawAdvanced", "WithdrawRejected", "WithdrawInitiated"]);
	assert.equal(releaseDeps.ExpressProviderWithdrawLifecycleHint, undefined);
});

test("analytics and events templates wire every provider lifecycle completion path", () => {
	const analyticsDeps = read("perps/analytics/deps_expressProvider_1.json");
	const analyticsSrc = read("perps/analytics/src_expressProvider_1.ts");
	const eventsDeps = read("perps/events/deps_expressProvider_1.json");
	const eventsSrc = read("perps/events/src_expressProvider_1.ts");
	const eventsSchema = read("perps/events/schema.graphql");
	const withdrawAccepted = entityBlock(eventsSchema, "WithdrawAccepted");
	const acceptedHandler = read("perps/events/handlers/expressProvider/WithdrawAcceptedHandler.ts");
	const unlockedAndProcessed = entityBlock(eventsSchema, "WithdrawUnlockedAndProcessed");
	const unlockedHandler = read("perps/events/handlers/expressProvider/WithdrawUnlockedAndProcessedHandler.ts");

	for (const eventName of [
		"WithdrawAccepted",
		"WithdrawAccelerated",
		"WithdrawCancelled",
		"WithdrawFinalized",
		"WithdrawLocked",
		"WithdrawProcessed",
		"WithdrawSuspended",
		"WithdrawUnlockedAndProcessed",
	]) {
		assert.match(analyticsDeps, new RegExp(`"${eventName}"`));
		assert.match(eventsDeps, new RegExp(`"${eventName}"`));
		assert.match(analyticsSrc, new RegExp(`handle${eventName}`));
		assert.match(eventsSrc, new RegExp(`handle${eventName}`));
	}

	assert.match(withdrawAccepted, /optionType: Int/);
	assert.match(unlockedAndProcessed, /user: Bytes!/);
	assert.match(unlockedAndProcessed, /requestId: BigInt!/);
	assert.match(acceptedHandler, /entity\.optionType = event\.params\.optionType/);
	assert.match(acceptedHandler, /setRawExpressProviderEventMetadata\(entity, _event\)/);
	assert.match(unlockedHandler, /setRawExpressProviderEventMetadata\(entity, _event\)/);
});

test("v0.8.5 analytics instantiates provider templates on HyperEVM", () => {
	const deps = JSON.parse(read("perps/analytics/deps_symmio_0_8_5.json"));
	const source = read("perps/analytics/src_symmio_0_8_5.ts");

	assert.deepEqual(deps.ExpressProviderSource, ["RegisterExpressProvider"]);
	assert.deepEqual(deps.ExpressProviderSourceByCore, ["RegisterExpressProvider"]);
	assert.match(source, /handleRegisterExpressProvider/);
	assert.match(source, /RegisterExpressProviderHandler/);
});

test("core provider marker never overwrites singular provider metadata", () => {
	const schema = read("perps/analytics/schema.graphql");
	const helper = read("perps/analytics/utils/affiliateExpressWithdrawComponents.ts");
	const registry = entityBlock(schema, "ExpressProviderSourceByCore");
	const ensureStart = helper.indexOf("export function ensureExpressProviderSource");
	const ensureEnd = helper.indexOf("function loadExpressProviderSourceFromProvider", ensureStart);
	const ensure = helper.slice(ensureStart, ensureEnd);

	assert.doesNotMatch(registry, /providerSources:/);
	assert.doesNotMatch(registry, /\n\s*providerSource: ExpressProviderSource!/);
	assert.doesNotMatch(registry, /\n\s*provider: Bytes!/);
	assert.doesNotMatch(ensure, /byCore\.providerSources =|byCore\.providerSource =|byCore\.provider =/);
});

test("raw registration creates each provider template only once", () => {
	const schema = read("perps/events/schema.graphql");
	const handler = read("perps/events/handlers/symmio/RegisterExpressProviderHandler.ts");

	assert.match(schema, /type ExpressProviderTemplateRegistration @entity\(immutable: false\)/);
	assert.match(handler, /ExpressProviderTemplateRegistration\.load\(registrationId\)/);
	assert.match(handler, /if \(registration\) return/);
	assert.match(handler, /new ExpressProviderTemplateRegistration\(registrationId\)/);
	assert.match(handler, /ExpressProvider\.create\(event\.params\.provider\)/);
	assert.ok(
		handler.indexOf("registration.save()") < handler.indexOf("ExpressProvider.create(event.params.provider)"),
		"persist the provider marker before scheduling its dynamic data source",
	);
});
