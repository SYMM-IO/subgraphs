import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import test from "node:test";

const read = path => readFileSync(new URL(`../${path}`, import.meta.url));
const readText = path => read(path).toString("utf8");

function hierarchy(virtualAccountIds = []) {
	const subAccount = {
		id: "sub",
		owner: "old-owner",
		ownerRef: "old-owner",
		user: "old-owner",
		userRef: "old-owner",
	};
	return {
		users: new Set(["old-owner"]),
		subAccount,
		virtualAccounts: virtualAccountIds.map(id => ({ id, owner: "old-owner", ownerRef: "old-owner" })),
		virtualAccountProfiles: virtualAccountIds.map(id => ({
			id,
			owner: "old-owner",
			user: "old-owner",
			userRef: "old-owner",
		})),
	};
}

function transferHierarchy(state, newOwner) {
	state.users.add(newOwner);
	state.subAccount.owner = newOwner;
	state.subAccount.ownerRef = newOwner;
	state.subAccount.user = newOwner;
	state.subAccount.userRef = newOwner;
	for (const virtualAccount of state.virtualAccounts) {
		virtualAccount.owner = newOwner;
		virtualAccount.ownerRef = newOwner;
	}
	for (const account of state.virtualAccountProfiles) {
		account.owner = newOwner;
		account.user = newOwner;
		account.userRef = newOwner;
	}
	return state;
}

test("AccountLayer v2 ABI is byte-for-byte pinned and exposes ownership enumeration", () => {
	const abiBytes = read("configs/abis/accountLayer_2.json");
	assert.equal(createHash("sha256").update(abiBytes).digest("hex"), "c8d08e7237aaadc86a7fdf776466912d0efabd47cd138ce62fd261c781804e41");

	const abi = JSON.parse(abiBytes.toString("utf8"));
	const transfer = abi.find(entry => entry.type === "event" && entry.name === "SubAccountOwnershipTransferred");
	assert.deepEqual(
		transfer.inputs.map(({ name, type, indexed }) => ({ name, type, indexed })),
		[
			{ name: "account", type: "address", indexed: true },
			{ name: "oldOwner", type: "address", indexed: true },
			{ name: "newOwner", type: "address", indexed: true },
		],
	);

	for (const getter of ["getVirtualAccountsCountOfSubAccount", "getVirtualAccountsAddressesOfSubAccount"]) {
		assert.ok(
			abi.some(entry => entry.type === "function" && entry.name === getter),
			`missing ${getter}`,
		);
	}
});

test("AccountLayer v3 ABI matches the fresh Arbitrum surface", () => {
	const abiBytes = read("configs/abis/accountLayer_3.json");
	assert.equal(createHash("sha256").update(abiBytes).digest("hex"), "aaefaff7bd24b80836007b204412796d8cec9fc14472909d36d155db023a6736");

	const abi = JSON.parse(abiBytes.toString("utf8"));
	const eventNames = new Set(abi.filter(entry => entry.type === "event").map(entry => entry.name));
	assert.ok(eventNames.has("SignerScopeUpdated"));
	assert.ok(eventNames.has("OwnershipTransferred"));
	assert.equal(eventNames.has("ExpressRateSet"), false);
	assert.equal(eventNames.has("VirtualProviderSet"), false);
});

test("Arbitrum Vibe uses receipt-backed deployment boundaries and dedicated endpoints", () => {
	const config = JSON.parse(readText("configs/perps/arbitrum_vibe.json"));
	assert.equal(config.network, "arbitrum-one");
	assert.deepEqual(config.deploy_urls, {
		"perps/analytics": "arbitrum-vibe-analytics",
		"perps/events": "arbitrum-vibe-events",
	});
	assert.deepEqual(
		config.contracts.map(({ address, abi, version, startBlock }) => ({ address, abi, version, startBlock })),
		[
			{
				address: "0x573310dB6d160B26026B8706EBe9831c7dEF1D09",
				abi: "symmio",
				version: "0_8_6",
				startBlock: "492379174",
			},
			{
				address: "0x5733107211B2801Acd39933a54d482FE303c4907",
				abi: "accountLayer",
				version: "3",
				startBlock: "492379761",
			},
		],
	);
});

test("only HyperEVM main and stage use AccountLayer v2, preserving their original start blocks", () => {
	const v2Sources = [];
	for (const file of readdirSync(new URL("../configs/perps/", import.meta.url))) {
		if (!file.endsWith(".json")) continue;
		const config = JSON.parse(readText(`configs/perps/${file}`));
		for (const contract of config.contracts ?? []) {
			if (contract.abi === "accountLayer" && contract.version === "2") {
				v2Sources.push({ file, address: contract.address, startBlock: contract.startBlock });
			}
		}
	}
	v2Sources.sort((left, right) => (left.file < right.file ? -1 : left.file > right.file ? 1 : 0));

	assert.deepEqual(v2Sources, [
		{
			file: "hyperevm.json",
			address: "0x46493c376758Da47823D7E3Ae5d417eA6546eEB3",
			startBlock: "32015874",
		},
		{
			file: "hyperevm_stage.json",
			address: "0x812e98F31A4EfFC09dD82e6e87ff7456151a0dFB",
			startBlock: "28309746",
		},
	]);
});

test("ownership transfer supports zero and multiple child virtual accounts", () => {
	const withoutChildren = transferHierarchy(hierarchy(), "new-owner");
	assert.equal(withoutChildren.subAccount.owner, "new-owner");
	assert.equal(withoutChildren.subAccount.userRef, "new-owner");
	assert.deepEqual(withoutChildren.virtualAccounts, []);

	const withChildren = transferHierarchy(hierarchy(["va-1", "va-2", "va-3"]), "new-owner");
	assert.ok(withChildren.virtualAccounts.every(({ owner, ownerRef }) => owner === "new-owner" && ownerRef === "new-owner"));
	assert.ok(
		withChildren.virtualAccountProfiles.every(
			({ owner, user, userRef }) => owner === "new-owner" && user === "new-owner" && userRef === "new-owner",
		),
	);
});

test("repeated transfer intent is idempotent and does not create duplicate owner records", () => {
	const state = hierarchy(["va-1", "va-2"]);
	transferHierarchy(state, "new-owner");
	transferHierarchy(state, "new-owner");

	assert.deepEqual([...state.users].sort(), ["new-owner", "old-owner"]);
	assert.equal(state.subAccount.owner, "new-owner");
	assert.ok(state.virtualAccounts.every(({ owner }) => owner === "new-owner"));

	const handler = readText("perps/common/handlers/accountLayer/SubAccountOwnershipTransferredHandler.ts");
	assert.match(handler, /let newOwner = User\.load\(newOwnerId\)/);
	assert.match(handler, /if \(!newOwner\) \{\s*newOwner = new User\(newOwnerId\)/);
	assert.doesNotMatch(handler, /plus\(|minus\(/, "ownership transfer must not perturb account or VA counters");
});

test("handler resolves the complete hierarchy before the first ownership mutation", () => {
	const handler = readText("perps/common/handlers/accountLayer/SubAccountOwnershipTransferredHandler.ts");
	const countCall = handler.indexOf("try_getVirtualAccountsCountOfSubAccount");
	const addressesCall = handler.indexOf("try_getVirtualAccountsAddressesOfSubAccount");
	const childLoad = handler.indexOf("VirtualAccount.load(virtualAccountId)");
	const firstMutation = handler.indexOf("subAccount.owner = event.params.newOwner");

	assert.ok(countCall !== -1 && addressesCall > countCall);
	assert.ok(childLoad > addressesCall);
	assert.ok(firstMutation > childLoad);
	assert.match(handler, /if \(virtualAccountCountResult\.reverted\)[\s\S]*?return/);
	assert.match(handler, /if \(virtualAccountAddressesResult\.reverted\)[\s\S]*?return/);
	assert.match(handler, /if \(!virtualAccount \|\| !virtualAccountProfile\)[\s\S]*?return/);
	assert.doesNotMatch(handler, /contract\.getVirtualAccounts/, "all contract reads must use try_ calls");

	for (const fieldWrite of [
		"subAccount.owner = event.params.newOwner",
		"subAccount.ownerRef = newOwnerId",
		"subAccountProfile.user = event.params.newOwner",
		"subAccountProfile.userRef = newOwnerId",
		"subAccountProfile.owner = event.params.newOwner",
		"virtualAccount.owner = event.params.newOwner",
		"virtualAccount.ownerRef = newOwnerId",
		"virtualAccountProfile.user = event.params.newOwner",
		"virtualAccountProfile.userRef = newOwnerId",
		"virtualAccountProfile.owner = event.params.newOwner",
	]) {
		assert.ok(handler.includes(fieldWrite), `missing ownership write: ${fieldWrite}`);
	}
});

test("analytics refreshes aggregate membership snapshots for the transferred hierarchy", () => {
	const commonHandler = readText("perps/common/handlers/accountLayer/SubAccountOwnershipTransferredHandler.ts");
	const analyticsHandler = readText("perps/analytics/handlers/accountLayer/SubAccountOwnershipTransferredHandler.ts");

	assert.match(commonHandler, /transferredAccountAddresses: Array<Address> = \[\]/);
	assert.match(commonHandler, /this\.transferredAccountAddresses\.push\(event\.params\.account\)/);
	assert.match(commonHandler, /this\.transferredAccountAddresses\.push\(virtualAccountAddresses\[i\]\)/);
	assert.match(analyticsHandler, /this\.transferredAccountAddresses\.length/);
	assert.match(analyticsHandler, /syncAffiliateExpressWithdrawAccountMembership/);
});

test("v2 deps, source routing, and compatible metadata hydration stay wired", () => {
	for (const depsPath of ["perps/common/deps_accountLayer_2.json", "perps/analytics/deps_accountLayer_2.json"]) {
		const deps = JSON.parse(readText(depsPath));
		assert.equal(deps.__extends, "deps_accountLayer_1.json");
		for (const model of ["Account", "SubAccount", "VirtualAccount"]) {
			assert.ok(deps[model].includes("SubAccountOwnershipTransferred"), `${depsPath} does not wire ${model}`);
		}
	}

	const source = readText("perps/analytics/src_accountLayer_2.ts");
	assert.match(source, /handleSubAccountOwnershipTransferred/);
	assert.match(source, /AccountLayerVersion\.v_2/);
	assert.match(source, /generated\/accountLayer_2\/accountLayer_2/);

	const eventsDeps = JSON.parse(readText("perps/events/deps_accountLayer_2.json"));
	assert.equal(eventsDeps.__extends, "deps_accountLayer_1.json");
	assert.deepEqual(eventsDeps.SubAccountOwnershipTransferred, ["SubAccountOwnershipTransferred"]);
	assert.deepEqual(eventsDeps.SymmioCoreAddedToAffiliate, ["SymmioCoreAddedToAffiliate"]);
	const eventsSource = readText("perps/events/src_accountLayer_2.ts");
	for (const eventName of ["SubAccountOwnershipTransferred", "SymmioCoreAddedToAffiliate"]) {
		assert.match(eventsSource, new RegExp(`handle${eventName}`), `Events v2 does not route ${eventName}`);
	}
	assert.match(eventsSource, /AccountLayerVersion\.v_2/);

	for (const handlerPath of [
		"perps/common/handlers/accountLayer/SubAccountCreatedHandler.ts",
		"perps/common/handlers/accountLayer/LegacyAccountImportedHandler.ts",
		"perps/common/handlers/accountLayer/VirtualAccountCreatedHandler.ts",
		"perps/common/handlers/accountLayer/VirtualAccountReusedHandler.ts",
	]) {
		const handler = readText(handlerPath);
		assert.match(handler, /version == AccountLayerVersion\.v_1 \|\| version == AccountLayerVersion\.v_2/);
		assert.match(handler, /version == AccountLayerVersion\.v_3/, `${handlerPath} must hydrate the compatible v3 getter layout`);
	}
});

test("v3 dependency and generated-source routing matches the current AccountLayer ABI", () => {
	const eventsDeps = JSON.parse(readText("perps/events/deps_accountLayer_3.json"));
	assert.equal(eventsDeps.__extends, "deps_accountLayer_2.json");
	assert.deepEqual(eventsDeps.ExpressRateSet, []);
	assert.deepEqual(eventsDeps.VirtualProviderSet, []);
	assert.deepEqual(eventsDeps.SignerScopeUpdated, ["SignerScopeUpdated"]);

	for (const depsPath of ["perps/common/deps_accountLayer_3.json", "perps/analytics/deps_accountLayer_3.json"]) {
		const deps = JSON.parse(readText(depsPath));
		assert.equal(deps.__extends, "deps_accountLayer_2.json");
		assert.equal(deps.Affiliate.includes("ExpressRateSet"), false);
		assert.equal(deps.Affiliate.includes("VirtualProviderSet"), false);
	}

	const eventsSource = readText("perps/events/src_accountLayer_3.ts");
	assert.match(eventsSource, /handleSignerScopeUpdated/);
	assert.match(eventsSource, /AccountLayerVersion\.v_3/);
	assert.doesNotMatch(eventsSource, /handleExpressRateSet|handleVirtualProviderSet/);

	const analyticsSource = readText("perps/analytics/src_accountLayer_3.ts");
	assert.match(analyticsSource, /AccountLayerVersion\.v_3/);
	assert.match(analyticsSource, /handleSubAccountOwnershipTransferred/);
	assert.doesNotMatch(analyticsSource, /handleExpressRateSet|handleVirtualProviderSet/);
});
