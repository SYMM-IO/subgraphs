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

test("perps model schemas use GraphQL descriptions, not only comments", () => {
	const modelDir = path.join(root, "perps/common/models");
	const files = fs.readdirSync(modelDir).filter(file => file.endsWith(".graphql"));
	const undocumented = [];

	for (const file of files) {
		const document = parseSchema(`perps/common/models/${file}`);
		for (const definition of document.definitions) {
			if (definition.kind === "ObjectTypeDefinition" && !definition.description) {
				undocumented.push(`${file}:${definition.name.value}`);
			}
		}
	}

	assert.deepEqual(undocumented, []);
});

test("perps schemas document every object type and field", () => {
	const schemaFiles = [
		...fs
			.readdirSync(path.join(root, "perps/common/models"))
			.filter(file => file.endsWith(".graphql"))
			.map(file => `perps/common/models/${file}`),
		"perps/analytics/schema.graphql",
		"perps/events/schema.graphql",
	];
	const undocumented = [];

	for (const schemaFile of schemaFiles) {
		const document = parseSchema(schemaFile);
		visit(document, {
			ObjectTypeDefinition(node) {
				if (!node.description) undocumented.push(`${schemaFile}:${node.name.value}`);
				for (const field of node.fields ?? []) {
					if (!field.description) undocumented.push(`${schemaFile}:${node.name.value}.${field.name.value}`);
				}
			},
		});
	}

	assert.deepEqual(undocumented, []);
});

test("perps schema descriptions do not contain stale placeholder wording", () => {
	const schemaFiles = [
		...fs
			.readdirSync(path.join(root, "perps/common/models"))
			.filter(file => file.endsWith(".graphql"))
			.map(file => `perps/common/models/${file}`),
		"perps/analytics/schema.graphql",
		"perps/events/schema.graphql",
	];
	const staleDescriptions = [];
	const stalePatterns = [
		/Subgraph-maintained/,
		/TODO|FIXME|TBD/,
		/event snapshot for the `QuoteSettlementData`/,
		/event snapshot for the `UnifiedQuoteSettlementData`/,
		/event snapshot for the `WithdrawPart`/,
	];

	for (const schemaFile of schemaFiles) {
		const document = parseSchema(schemaFile);
		visit(document, {
			ObjectTypeDefinition(node) {
				if (node.description && stalePatterns.some(pattern => pattern.test(node.description.value))) {
					staleDescriptions.push(`${schemaFile}:${node.name.value}`);
				}
				for (const field of node.fields ?? []) {
					if (field.description && stalePatterns.some(pattern => pattern.test(field.description.value))) {
						staleDescriptions.push(`${schemaFile}:${node.name.value}.${field.name.value}`);
					}
				}
			},
		});
	}

	assert.deepEqual(staleDescriptions, []);
});

test("critical Quote fee fields document rate semantics and version fallback", () => {
	const document = parseSchema("perps/common/models/Quote.graphql");
	const quote = getType(document, "Quote");
	const tradingFee = getField(quote, "tradingFee");
	const closeFee = getField(quote, "closeFee");

	assert.match(tradingFee.description.value, /Open-fee rate/);
	assert.match(closeFee.description.value, /Close-fee rate/);
	assert.match(closeFee.description.value, /zero for older core versions/);
});

test("analytics aggregate fee fields document charged amount semantics", () => {
	const document = parseSchema("perps/analytics/schema.graphql");
	const dailyHistory = getType(document, "DailyHistory");

	assert.match(getField(dailyHistory, "platformFee").description.value, /openFee \+ closeFee/);
	assert.match(getField(dailyHistory, "openFee").description.value, /charged open-fee amount/);
	assert.match(getField(dailyHistory, "closeFee").description.value, /charged close-fee amount/);
});

test("analytics schema has descriptions for every object type", () => {
	const document = parseSchema("perps/analytics/schema.graphql");
	const undocumented = [];

	visit(document, {
		ObjectTypeDefinition(node) {
			if (!node.description) undocumented.push(node.name.value);
		},
	});

	assert.deepEqual(undocumented, []);
});

test("embedded event payload helper types are not documented as standalone events", () => {
	const document = parseSchema("perps/events/schema.graphql");

	for (const typeName of ["QuoteSettlementData", "UnifiedQuoteSettlementData", "WithdrawPart"]) {
		const type = getType(document, typeName);
		assert.ok(type.description);
		assert.doesNotMatch(type.description.value, /event snapshot/);
	}
});

test("event schema descriptions match their containing event type", () => {
	const document = parseSchema("perps/events/schema.graphql");
	const mismatches = [];

	visit(document, {
		ObjectTypeDefinition(node) {
			const typeDescription = node.description?.value ?? "";
			const typeMatch = typeDescription.match(/Immutable event snapshot for the `([^`]+)` event\./);
			if (typeMatch && typeMatch[1] !== node.name.value) {
				mismatches.push(`${node.name.value}: type description says ${typeMatch[1]}`);
			}

			for (const field of node.fields ?? []) {
				const fieldMatch = field.description?.value.match(/from the `([^`]+)` event/);
				if (fieldMatch && fieldMatch[1] !== node.name.value) {
					mismatches.push(`${node.name.value}.${field.name.value}: field description says ${fieldMatch[1]}`);
				}
			}
		},
	});

	assert.deepEqual(mismatches, []);
});

test("perps schema documentation guide explains generated root schema and raw event scope", () => {
	const docs = read("docs/perps-subgraph-schema-docs.md");

	assert.match(docs, /Do not edit the generated root `schema\.graphql`/);
	assert.match(docs, /Quote fee-rate fields/);
	assert.match(docs, /Event Schema Scope/);
});
