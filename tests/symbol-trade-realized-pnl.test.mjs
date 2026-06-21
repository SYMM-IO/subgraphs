import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { parse } from "graphql";

const root = process.cwd();

function read(relativePath) {
	return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function getType(document, name) {
	return document.definitions.find(definition => definition.kind === "ObjectTypeDefinition" && definition.name.value === name);
}

function getField(type, name) {
	return type.fields.find(field => field.name.value === name);
}

test("symbol trade histories store account-level realized pnl by market", () => {
	const schema = parse(read("perps/analytics/schema.graphql"), { noLocation: true });
	const builders = read("perps/analytics/utils/builders.ts");
	const historyHelpers = read("perps/analytics/utils/historyHelpers.ts");

	for (const typeName of ["DailySymbolTradesHistory", "TotalSymbolTradesHistory"]) {
		const type = getType(schema, typeName);
		const loss = getField(type, "loss");
		const profit = getField(type, "profit");

		assert.ok(loss, `${typeName}.loss should exist`);
		assert.ok(profit, `${typeName}.profit should exist`);
		assert.equal(loss.type.kind, "NonNullType");
		assert.equal(profit.type.kind, "NonNullType");
		assert.match(loss.description.value, /Realized loss/);
		assert.match(profit.description.value, /Realized profit/);
	}

	assert.match(builders, /history\.loss\s*=\s*BigInt\.zero\(\)/);
	assert.match(builders, /history\.profit\s*=\s*BigInt\.zero\(\)/);
	assert.match(historyHelpers, /dst\.loss\s*=\s*dst\.loss\.plus\(params\._loss\)/);
	assert.match(historyHelpers, /dst\.profit\s*=\s*dst\.profit\.plus\(params\._profit\)/);
	assert.match(historyHelpers, /tst\.loss\s*=\s*tst\.loss\.plus\(params\._loss\)/);
	assert.match(historyHelpers, /tst\.profit\s*=\s*tst\.profit\.plus\(params\._profit\)/);
});
