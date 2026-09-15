import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import test from "node:test";
import { parse, print } from "graphql";

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const bytes = value => ({ toHex: () => value, toHexString: () => value });

function loadSource(path, dependencies) {
	const exports = [];
	const source = stripTypeScriptTypes(read(path))
		.replace(
			/import\s*\{([^}]+)\}\s*from\s*["']([^"']+)["']/g,
			(_, bindings, module) => `const {${bindings.replace(/\bas\b/g, ":")}} = require(${JSON.stringify(module)});`,
		)
		.replace(/export (class|function) (\w+)/g, (_, kind, name) => {
			exports.push(name);
			return `${kind} ${name}`;
		});
	return new Function("require", "changetype", `${source}\nreturn {${exports.join(",")}};`)(
		name => {
			assert.ok(name in dependencies, `unexpected dependency ${name}`);
			return dependencies[name];
		},
		value => value,
	);
}

function field(module, entity, name) {
	const document = parse(read(`perps/${module}/schema.graphql`));
	const definition = document.definitions.find(definition => definition.name?.value === entity);
	const result = definition.fields.find(field => field.name.value === name);
	assert.ok(result, `${entity}.${name} must remain queryable`);
	return result;
}

test("legacy provider fields remain queryable with explicit deprecation", () => {
	for (const [name, type] of [
		["providerSource", "ExpressProviderSource!"],
		["provider", "Bytes!"],
	]) {
		const definition = field("analytics", "ExpressProviderSourceByCore", name);
		assert.equal(print(definition.type), type);
		assert.ok(definition.directives.some(directive => directive.name.value === "deprecated"));
	}
});

test("provider compatibility fields track discovery without losing other providers", () => {
	const providers = new Map();
	const cores = new Map();
	const entityClass = records =>
		class {
			constructor(id) {
				this.id = id;
			}
			static load(id) {
				return records.get(id) ?? null;
			}
			save() {
				records.set(this.id, this);
			}
		};
	const helper = loadSource("perps/analytics/utils/affiliateExpressWithdrawComponents.ts", {
		"@graphprotocol/graph-ts": {},
		"../../../generated/schema": {
			ExpressProviderSource: entityClass(providers),
			ExpressProviderSourceByCore: entityClass(cores),
		},
		"../../../generated/templates/ExpressProvider/expressProvider_1": {},
		"../../common/utils/profile": {},
		"../../common/utils/account_layer_resolver": {},
		"../../common/utils/deploymentContext": { currentDeploymentId: () => "test" },
		"./constants": {},
		"./withdrawRequest": {},
	});
	const source = bytes("0xcore");
	const collateral = bytes("0xcollateral");
	const first = bytes("0xprovider1");
	const second = bytes("0xprovider2");
	assert.equal(helper.ensureExpressProviderSource(first, source, collateral, 1n, 10n), true);
	assert.equal(helper.ensureExpressProviderSource(second, source, collateral, 2n, 20n), true);
	assert.equal(providers.size, 2);
	assert.equal(providers.get("0xprovider1").provider, first);
	assert.equal(providers.get("0xprovider2").provider, second);
	assert.equal(cores.get("0xcore").provider, second);
	assert.equal(cores.get("0xcore").providerSource, "0xprovider2");
	assert.equal(helper.ensureExpressProviderSource(first, source, collateral, 3n, 30n), false);
	assert.equal(providers.size, 2);
	assert.equal(cores.get("0xcore").provider, first);
	assert.equal(cores.get("0xcore").providerSource, "0xprovider1");
});

for (const eventName of ["RoleGranted", "RoleRevoked"]) {
	test(`${eventName} preserves the non-null user alias for every event family`, () => {
		assert.equal(print(field("events", eventName, "user").type), "Bytes!");
		for (const family of ["symmio", "symmioMultiAccount", "accountLayer"]) {
			const rows = [];
			const entity = class {
				constructor(id) {
					this.id = id;
				}
				save() {
					rows.push(this);
				}
			};
			const module = loadSource(`perps/events/handlers/${family}/${eventName}Handler.ts`, {
				"../../../../generated/schema": { [eventName]: entity },
				"@graphprotocol/graph-ts": {},
				"../../../common/BaseHandler": {},
				"../../../common/utils": { getGlobalCounterAndInc: () => 1n },
			});
			const grantee = bytes("0xgrantee"),
				sender = bytes("0xsender");
			const params = family === "symmio" ? { role: bytes("0xrole"), user: grantee } : { role: bytes("0xrole"), account: grantee, sender };
			const event = {
				params,
				address: bytes("0xsource"),
				transaction: { hash: bytes("0xtx"), index: 2n },
				logIndex: 3n,
				block: { timestamp: 4n, number: 5n, hash: bytes("0xblock") },
			};
			new module[`${eventName}Handler`]().handle(event, 1);
			assert.equal(rows.length, 1);
			assert.equal(rows[0].user, grantee, `${family} must preserve the grantee alias`);
			assert.equal(rows[0].source, event.address);
			if (family !== "symmio") {
				assert.equal(rows[0].account, grantee);
				assert.equal(rows[0].sender, sender);
			}
		}
	});
}

test("Muon legacy values remain exact and modern logs do not invent missing values", () => {
	const rows = [];
	const module = loadSource("perps/events/handlers/symmio/SetMuonIdsHandler.ts", {
		"../../../../generated/schema": {
			SetMuonIds: class {
				constructor(id) {
					this.id = id;
				}
				save() {
					rows.push(this);
				}
			},
		},
		"@graphprotocol/graph-ts": {},
		"../../../common/BaseHandler": { Version: { v_0_8_5: 5 } },
		"../../../common/utils": { getGlobalCounterAndInc: () => 1n },
	});
	for (const version of [1, 2, 3, 4, 5, 6]) {
		const gateway = bytes("0xgateway");
		const parameters = [{ value: { toBigInt: () => 7n } }];
		if (version < 5) parameters.push({ value: { toAddress: () => gateway } }, { value: { toBigInt: () => 42n } }, { value: { toI32: () => 1 } });
		const event = {
			params: { muonAppId: 7n },
			parameters,
			address: bytes("0xsource"),
			transaction: { hash: bytes("0xtx"), index: 0n },
			logIndex: 1n,
			block: { timestamp: 2n, number: 3n, hash: bytes("0xblock") },
		};
		new module.SetMuonIdsHandler().handle(event, version);
		const row = rows.at(-1);
		assert.equal(row.muonAppId, 7n);
		for (const [name, value] of [
			["gateway", gateway],
			["x", 42n],
			["parity", 1],
		]) {
			assert.equal(row[name], version < 5 ? value : undefined);
			assert.notEqual(field("events", "SetMuonIds", name).type.kind, "NonNullType");
		}
	}
});
