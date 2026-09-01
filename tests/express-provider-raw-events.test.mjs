import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const abi = JSON.parse(read("configs/abis/expressProvider_1.json"));
const schema = read("perps/events/schema.graphql");
const deps = JSON.parse(read("perps/events/deps_expressProvider_1.json"));
const source = read("perps/events/src_expressProvider_1.ts");

const events = abi.filter(entry => entry.type === "event");
const eventNames = events.map(event => event.name).sort();
const metadataFields = new Map([
	["id", "ID!"],
	["source", "Bytes!"],
	["counterId", "BigInt!"],
	["blockNumber", "BigInt!"],
	["blockTimestamp", "BigInt!"],
	["transactionHash", "Bytes!"],
	["transactionIndex", "BigInt!"],
	["logIndex", "BigInt!"],
	["blockHash", "Bytes!"],
]);

const schemaTypeFor = input => {
	if (input.type === "address") return "Bytes!";
	if (input.type === "bool") return "Boolean!";
	if (input.type === "uint8") return "Int!";
	if (/^uint\d+$/.test(input.type)) return "BigInt!";
	throw new Error(`unsupported Express Provider event input type: ${input.type}`);
};

const entityBlocks = name =>
	[...schema.matchAll(new RegExp(`^type ${name} @entity\\(immutable: true\\) \\{[\\s\\S]*?^\\}`, "gm"))].map(match => match[0]);

const entityFields = block => {
	const fields = new Map();
	for (const match of block.matchAll(/^\s*([A-Za-z_][A-Za-z0-9_]*):\s*([^\s#]+)/gm)) {
		fields.set(match[1], match[2]);
	}
	return fields;
};

test("Express Provider raw mapping covers every ABI event exactly once", () => {
	assert.equal(events.length, 39);
	assert.equal(new Set(eventNames).size, 39);
	assert.deepEqual(Object.keys(deps).sort(), eventNames);

	const exports = [...source.matchAll(/^export function handle([A-Za-z0-9_]+)\(/gm)].map(match => match[1]).sort();
	assert.deepEqual(exports, eventNames);

	for (const event of events) {
		assert.deepEqual(deps[event.name], [event.name], `${event.name} dependency must route its exact ABI event`);
		assert.equal(entityBlocks(event.name).length, 1, `${event.name} must have exactly one immutable schema entity`);

		const handlerPath = new URL(`../perps/events/handlers/expressProvider/${event.name}Handler.ts`, import.meta.url);
		assert.equal(existsSync(handlerPath), true, `missing ${event.name} handler`);
		const handler = readFileSync(handlerPath, "utf8");

		assert.match(source, new RegExp(`handle${event.name}\\(event: ${event.name}\\)`));
		assert.match(handler, new RegExp(`new EventEntity\\(`));
		assert.match(handler, /setRawExpressProviderEventMetadata\(entity, _event\)/);
		assert.match(handler, /entity\.save\(\)/);

		const fields = entityFields(entityBlocks(event.name)[0]);
		for (const [field, type] of metadataFields) {
			assert.equal(fields.get(field), type, `${event.name}.${field} must be ${type}`);
		}
		for (const input of event.inputs) {
			const expectedType =
				event.name === "WithdrawAccepted" && input.name === "optionType"
					? "Int"
					: event.name === "FeesClaimed" && input.name === "recipient"
						? "Bytes"
						: schemaTypeFor(input);
			assert.equal(fields.get(input.name), expectedType, `${event.name}.${input.name} schema type mismatch`);
			assert.match(
				handler,
				new RegExp(`entity\\.${input.name} = event\\.params\\.${input.name}\\b`),
				`${event.name} handler drops ${input.name}`,
			);
		}
	}
});

test("ownership event signatures match the released ControlFacet ABI", () => {
	const byName = new Map(events.map(event => [event.name, event]));
	const inputs = name =>
		byName.get(name).inputs.map(({ name: inputName, type, indexed }) => ({
			name: inputName,
			type,
			indexed,
		}));

	assert.deepEqual(inputs("OwnershipTransferCanceled"), [{ name: "pendingOwner", type: "address", indexed: true }]);
	assert.deepEqual(inputs("OwnershipTransferStarted"), [
		{ name: "currentOwner", type: "address", indexed: true },
		{ name: "pendingOwner", type: "address", indexed: true },
	]);
	assert.deepEqual(inputs("OwnershipTransferred"), [
		{ name: "previousOwner", type: "address", indexed: true },
		{ name: "newOwner", type: "address", indexed: true },
	]);
});

test("shared raw entity names retain one compatible cross-ABI shape", () => {
	const allTypeNames = [...schema.matchAll(/^type\s+([A-Za-z_][A-Za-z0-9_]*)\b/gm)].map(match => match[1]);
	const duplicateTypes = [...new Set(allTypeNames.filter((name, index) => allTypeNames.indexOf(name) !== index))];
	assert.deepEqual(duplicateTypes, []);

	const feesClaimed = entityFields(entityBlocks("FeesClaimed")[0]);
	assert.equal(feesClaimed.get("symmio"), "Bytes", "Account Layer-only symmio must be nullable for provider logs");

	const withdrawAccepted = entityFields(entityBlocks("WithdrawAccepted")[0]);
	assert.equal(withdrawAccepted.get("optionType"), "Int", "provider-only optionType must be nullable for core logs");
});

test("shared Express Provider metadata helper writes the complete ordering envelope", () => {
	const helper = read("perps/events/handlers/expressProvider/rawEvent.ts");
	for (const field of [...metadataFields.keys()].filter(field => field !== "id")) {
		assert.match(helper, new RegExp(`entity\\.set\\("${field}"`), `metadata helper omits ${field}`);
	}
});
