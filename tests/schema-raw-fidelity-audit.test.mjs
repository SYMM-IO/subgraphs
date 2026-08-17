import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { parse } from "graphql";

const root = process.cwd();
const read = relativePath => fs.readFileSync(path.join(root, relativePath), "utf8");

const rawPayloadExceptions = new Map([["perps/symmio/DiamondCut", new Set(["_diamondCut", "_init", "_calldata"])]]);

const rawPayloadFieldAliases = new Map([
	["options/options/CancelWithdraw.id", ["withdrawId"]],
	["options/options/CompleteWithdraw.id", ["withdrawId"]],
	["options/options/InitiateWithdraw.id", ["withdrawId"]],
	["perps/buybackGateway/Deposited.source", ["depositSource"]],
	["perps/symmio/AcceptVirtualExternalTransfer.id", ["transferId"]],
	["perps/symmio/AddSymbol.id", ["symbolId"]],
	["perps/symmio/CancelVirtualExternalTransfer.id", ["transferId"]],
	["perps/symmio/FillCloseRequest.lockedValues", ["lockedValuesCva", "lockedValuesLf", "lockedValuesPartyAmm", "lockedValuesPartyBmm"]],
	["perps/symmio/InitiateVirtualExternalTransfer.id", ["transferId"]],
	["perps/symmio/OpenPosition.lockedValues", ["lockedValuesCva", "lockedValuesLf", "lockedValuesPartyAmm", "lockedValuesPartyBmm"]],
	["perps/symmio/SendQuote.mm", ["partyAmm", "partyBmm"]],
	[
		"perps/symmio/SendQuote.paramsData",
		["symbolId", "positionType", "orderType", "price", "marketPrice", "quantity", "cva", "lf", "partyAmm", "partyBmm", "tradingFee", "deadline"],
	],
	["perps/symmio/SetEntityMetadata.entity", ["entity_"]],
	["perps/symmio/SetSymbolFundingState.id", ["symbolId"]],
	["perps/symmio/SetSymbolValidationState.id", ["symbolId"]],
]);

const rawHandlerEntityAliases = new Map([
	["perps/buybackGateway/BuybackExecuted", "Buyback"],
	["perps/buybackGateway/Deposited", "BuybackDeposit"],
]);

function stripTypeScriptComments(source) {
	return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
}

function consumesEventInput(source, inputName, inputIndex) {
	return (
		new RegExp(`\\bevent\\.params\\.${inputName}\\b`).test(source) ||
		new RegExp(`\\b(?:_event|event)\\.parameters\\s*\\[\\s*${inputIndex}\\s*\\]`).test(source)
	);
}

function assignsEntityField(source, fieldName) {
	return new RegExp(`\\bentity\\.${fieldName}\\s*=`).test(source);
}

function rawEntityName(handlerSource, handlerPath) {
	const constructor = handlerSource.match(/\b(?:let|const)\s+entity\s*=\s*new\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/)?.[1];
	assert.ok(constructor, `${handlerPath}: expected the primary raw entity to be assigned to entity`);
	for (const schemaImport of handlerSource.matchAll(/import\s*\{([^}]*)\}\s*from\s*["']\.\.\/\.\.\/\.\.\/\.\.\/generated\/schema["']/g)) {
		for (const importedName of schemaImport[1].split(",")) {
			const [schemaName, localName = schemaName] = importedName.trim().split(/\s+as\s+/);
			if (localName === constructor) return schemaName;
		}
	}
	assert.fail(`${handlerPath}: ${constructor} must come from the generated schema`);
}

test("each indexed raw-event handler persists every configured ABI payload field or declares an explicit seam", () => {
	const failures = [];
	const encounteredExceptions = new Set();
	const encounteredAliases = new Set();
	const encounteredEntityAliases = new Set();
	for (const product of ["perps", "options"]) {
		const schema = parse(read(`${product}/events/schema.graphql`));
		const schemaEntities = new Map(
			schema.definitions
				.filter(definition => definition.kind === "ObjectTypeDefinition")
				.map(definition => [definition.name.value, new Set(definition.fields.map(field => field.name.value))]),
		);
		const handlersRoot = path.join(root, product, "events/handlers");
		const handlerGroups = fs
			.readdirSync(handlersRoot, { withFileTypes: true })
			.filter(entry => entry.isDirectory())
			.map(entry => entry.name)
			.sort();
		for (const handlerGroup of handlerGroups) {
			const dependencyFiles = fs
				.readdirSync(path.join(root, product, "events"))
				.filter(fileName => fileName.startsWith(`deps_${handlerGroup}_`) && fileName.endsWith(".json"))
				.sort();
			const indexedEvents = new Set(
				dependencyFiles.flatMap(fileName =>
					Object.entries(JSON.parse(read(`${product}/events/${fileName}`)))
						.filter(([entityName]) => entityName !== "__extends")
						.flatMap(([, eventNames]) => eventNames)
						.map(eventName => eventName.split("(")[0]),
				),
			);
			const abiFiles = fs
				.readdirSync(path.join(root, "configs/abis"))
				.filter(fileName => fileName.startsWith(`${handlerGroup}_`) && fileName.endsWith(".json"))
				.sort();
			assert.ok(abiFiles.length > 0, `${product}/${handlerGroup}: expected at least one configured ABI`);

			const handlerFiles = fs
				.readdirSync(path.join(handlersRoot, handlerGroup))
				.filter(fileName => fileName.endsWith("Handler.ts"))
				.sort();
			for (const eventName of indexedEvents) {
				if (!handlerFiles.includes(`${eventName}Handler.ts`)) {
					failures.push(`${product}/${handlerGroup}: indexed event ${eventName} has no raw handler`);
				}
			}
			for (const handlerFile of handlerFiles) {
				const eventName = handlerFile.slice(0, -"Handler.ts".length);
				const eventKey = `${product}/${handlerGroup}/${eventName}`;
				const handlerPath = `${product}/events/handlers/${handlerGroup}/${handlerFile}`;
				const handlerSource = read(handlerPath);
				const entityName = rawEntityName(handlerSource, handlerPath);
				const expectedEntityName = rawHandlerEntityAliases.get(eventKey) ?? eventName;
				assert.equal(entityName, expectedEntityName, `${eventKey}: declare intentional handler-to-entity aliases explicitly`);
				if (rawHandlerEntityAliases.has(eventKey)) encounteredEntityAliases.add(eventKey);
				const entityFields = schemaEntities.get(entityName);
				assert.ok(entityFields, `${eventKey}: expected schema entity ${entityName}`);
				const source = stripTypeScriptComments(handlerSource);

				let configuredEventCount = 0;
				for (const abiFile of abiFiles) {
					const abi = JSON.parse(read(`configs/abis/${abiFile}`));
					const events = abi.filter(item => item.type === "event" && item.name === eventName);
					configuredEventCount += events.length;
					for (const [overloadIndex, event] of events.entries()) {
						for (const [inputIndex, input] of event.inputs.entries()) {
							const inputKey = `${eventKey}.${input.name}`;
							const isConsumed = consumesEventInput(source, input.name, inputIndex);
							if (!isConsumed && rawPayloadExceptions.get(eventKey)?.has(input.name)) {
								if (entityFields.has(input.name)) {
									failures.push(`${inputKey} has a schema field, so its raw-payload exception is stale`);
								}
								encounteredExceptions.add(`${eventKey}.${input.name}`);
								continue;
							}
							if (!isConsumed) {
								failures.push(
									`${product}/${handlerGroup}/${handlerFile} omits ${abiFile} overload ${overloadIndex} input ${input.name}:${input.type}`,
								);
								continue;
							}

							const aliases = rawPayloadFieldAliases.get(inputKey);
							const targetFields = aliases ?? (entityFields.has(input.name) ? [input.name] : null);
							if (!targetFields) {
								failures.push(`${inputKey} is consumed but has neither a same-name schema field nor a declared alias seam`);
								continue;
							}
							if (aliases) encounteredAliases.add(inputKey);
							for (const targetField of targetFields) {
								if (!entityFields.has(targetField)) {
									failures.push(`${inputKey} maps to missing schema field ${entityName}.${targetField}`);
								} else if (!assignsEntityField(source, targetField)) {
									failures.push(`${inputKey} never persists to entity.${targetField}`);
								}
							}
						}
					}
				}
				if (configuredEventCount === 0) {
					failures.push(`${eventKey}: handler has no matching event in configured ${handlerGroup} ABIs`);
				}
			}
		}
	}

	for (const [eventKey, inputs] of rawPayloadExceptions) {
		for (const inputName of inputs) {
			assert.ok(encounteredExceptions.has(`${eventKey}.${inputName}`), `stale raw-payload exception: ${eventKey}.${inputName}`);
		}
	}
	for (const inputKey of rawPayloadFieldAliases.keys()) {
		assert.ok(encounteredAliases.has(inputKey), `stale raw-payload alias seam: ${inputKey}`);
	}
	for (const eventKey of rawHandlerEntityAliases.keys()) {
		assert.ok(encounteredEntityAliases.has(eventKey), `stale raw handler-to-entity alias: ${eventKey}`);
	}
	assert.equal(failures.length, 0, `Raw event payload omissions:\n${failures.join("\n")}`);
});

test("perps raw schema changes publish matching sync metadata", () => {
	const versions = JSON.parse(read("perps/events/sync_versions.json"));
	const generated = read("perps/events/src_sync_meta.ts");
	const versionsHash = Object.entries(versions.entities)
		.sort(([left], [right]) => left.localeCompare(right))
		.map(([entity, version]) => `${entity}:${version}`)
		.join("|");

	assert.equal(versions.entities.send_quote, "v2");
	assert.match(generated, new RegExp(`const GLOBAL_VERSION = ${JSON.stringify(versions.global)}`));
	assert.match(generated, new RegExp(`const VERSIONS_HASH = ${JSON.stringify(versionsHash)}`));
});

test("MultiAccount role handlers preserve source, grantee compatibility, account, and sender", () => {
	for (const eventName of ["RoleGranted", "RoleRevoked"]) {
		const source = read(`perps/events/handlers/symmioMultiAccount/${eventName}Handler.ts`);
		assert.match(source, /entity\.source = event\.address/);
		assert.match(source, /entity\.user = event\.params\.account/);
		assert.match(source, /entity\.account = event\.params\.account/);
		assert.match(source, /entity\.sender = event\.params\.sender/);
	}
});

test("options MultiAccount role handlers preserve source, grantee compatibility, account, and sender", () => {
	for (const eventName of ["RoleGranted", "RoleRevoked"]) {
		const multiAccount = read(`options/events/handlers/optionsMultiAccount/${eventName}Handler.ts`);
		assert.match(multiAccount, /entity\.source = event\.address/);
		assert.match(multiAccount, /entity\.user = event\.params\.account/);
		assert.match(multiAccount, /entity\.account = event\.params\.account/);
		assert.match(multiAccount, /entity\.sender = event\.params\.sender/);

		const optionsCore = read(`options/events/handlers/options/${eventName}Handler.ts`);
		assert.match(optionsCore, /entity\.source = event\.address/);
	}

	const document = parse(read("options/events/schema.graphql"));
	for (const eventName of ["RoleGranted", "RoleRevoked"]) {
		const roleEvent = document.definitions.find(definition => definition.name?.value === eventName);
		assert.equal(roleEvent.fields.find(field => field.name.value === "source").type.kind, "NonNullType");
		assert.ok(roleEvent.fields.find(field => field.name.value === "account"));
		assert.ok(roleEvent.fields.find(field => field.name.value === "sender"));
	}
});

test("perps and options AddAccount entities preserve the emitted name", () => {
	const perpsSchema = parse(read("perps/events/schema.graphql"));
	const optionsSchema = parse(read("options/events/schema.graphql"));
	for (const [label, document] of [
		["perps", perpsSchema],
		["options", optionsSchema],
	]) {
		const addAccount = document.definitions.find(definition => definition.name?.value === "AddAccount");
		const name = addAccount.fields.find(field => field.name.value === "name");
		assert.equal(name.type.kind, "NonNullType", `${label} AddAccount.name must be required`);
		assert.equal(name.type.type.name.value, "String");
	}
	assert.match(read("perps/events/handlers/symmioMultiAccount/AddAccountHandler.ts"), /entity\.name = event\.params\.name/);
	assert.match(read("options/events/handlers/optionsMultiAccount/AddAccountHandler.ts"), /entity\.name = event\.params\.name/);
});

test("options intent and PartyB config handlers preserve configured ABI cardinality", () => {
	const intentHandler = read("options/events/handlers/options/SendOpenIntentHandler.ts");
	assert.match(intentHandler, /partyBsWhiteList\.push\(event\.params\.partyBsWhiteList\[i\]\)/);
	assert.match(intentHandler, /entity\.partyBsWhiteList = partyBsWhiteList/);

	const document = parse(read("options/events/schema.graphql"));
	const sendOpenIntent = document.definitions.find(definition => definition.name?.value === "SendOpenIntent");
	const whitelist = sendOpenIntent.fields.find(field => field.name.value === "partyBsWhiteList");
	assert.equal(whitelist.type.kind, "NonNullType");
	assert.equal(whitelist.type.type.kind, "ListType");

	const update = document.definitions.find(definition => definition.name?.value === "PartyBConfigUpdated");
	const config = update.fields.find(field => field.name.value === "config");
	assert.equal(config.type.kind, "NonNullType");
	assert.equal(config.type.type.kind, "NamedType");
	assert.equal(config.type.type.name.value, "PartyBConfig");

	const handler = read("options/events/handlers/options/PartyBConfigUpdatedHandler.ts");
	assert.match(handler, /entity\.config = configId/);
	assert.doesNotMatch(handler, /partyBConfigDataArray|entity\.config = \[/);
});

test("version-specific perps event fields remain nullable when other ABI versions omit them", () => {
	const document = parse(read("perps/events/schema.graphql"));
	const cases = [
		["LockQuote", "quoteStatus", "Int"],
		["OpenPosition", "quoteStatus", "Int"],
		["SendQuote", "maxInterestRate", "BigInt"],
		["SendQuote", "quoteStatus", "Int"],
		["SetMuonConfig", "priceQuantityValidTime", "BigInt"],
	];
	for (const [typeName, fieldName, scalarName] of cases) {
		const entity = document.definitions.find(definition => definition.name?.value === typeName);
		const field = entity.fields.find(candidate => candidate.name.value === fieldName);
		assert.equal(field.type.kind, "NamedType", `${typeName}.${fieldName} must stay nullable for later ABI versions`);
		assert.equal(field.type.name.value, scalarName);
	}
});

test("AccountLayer raw event sources are non-null where handlers always assign event.address", () => {
	const document = parse(read("perps/events/schema.graphql"));
	const definitions = new Map(
		document.definitions.filter(definition => definition.kind === "ObjectTypeDefinition").map(definition => [definition.name.value, definition]),
	);
	const handlerDirectory = "perps/events/handlers/accountLayer";
	const handlerFiles = fs
		.readdirSync(path.join(root, handlerDirectory))
		.filter(fileName => fileName.endsWith("Handler.ts"))
		.sort();

	// Keep deliberate filename-to-entity differences visible instead of silently
	// excluding them from this audit.
	const entityNameOverrides = new Map();
	assert.ok(handlerFiles.length > 0, `${handlerDirectory}: expected AccountLayer event handlers`);
	for (const handlerName of entityNameOverrides.keys()) {
		assert.ok(handlerFiles.includes(`${handlerName}Handler.ts`), `stale AccountLayer entity-name override: ${handlerName}`);
	}

	const failures = [];
	for (const fileName of handlerFiles) {
		const handlerName = fileName.slice(0, -"Handler.ts".length);
		const entityName = entityNameOverrides.get(handlerName) ?? handlerName;
		const handlerPath = `${handlerDirectory}/${fileName}`;
		const handler = read(handlerPath);
		const schemaImport = handler.match(
			/import\s*\{\s*([A-Za-z_][A-Za-z0-9_]*)\s+as\s+[A-Za-z_][A-Za-z0-9_]*\s*\}\s*from\s*["']\.\.\/\.\.\/\.\.\/\.\.\/generated\/schema["']/,
		);

		if (!schemaImport) {
			failures.push(`${handlerPath}: expected one aliased generated-schema entity import`);
		} else if (schemaImport[1] !== entityName) {
			failures.push(`${handlerPath}: filename maps to ${entityName}, but the handler imports ${schemaImport[1]}`);
		}
		if (!/\bentity\.source\s*=\s*event\.address\b/.test(handler)) {
			failures.push(`${handlerPath}: must assign entity.source = event.address`);
		}

		const definition = definitions.get(entityName);
		if (!definition) {
			failures.push(`${handlerPath}: schema entity ${entityName} is missing`);
			continue;
		}
		const source = definition.fields.find(field => field.name.value === "source");
		if (!source) {
			failures.push(`${handlerPath}: schema entity ${entityName} is missing source`);
		} else if (source.type.kind !== "NonNullType") {
			failures.push(`${handlerPath}: schema field ${entityName}.source must be non-null`);
		}
	}
	assert.equal(failures.length, 0, `AccountLayer source invariant failures:\n${failures.join("\n")}`);
});
