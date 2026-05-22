import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("automatic virtual-account delete returns are tagged as margin-transfer side effects", () => {
	const helper = read("perps/analytics/utils/balanceChange.ts");

	assert.match(helper, /AUTO_RETURN_MARGIN_TRANSFER_TYPE/);
	assert.match(helper, /isVirtualAccountAutoReturnSideEffect/);
	assert.match(helper, /entity\.type == "DEPOSIT"/);
	assert.match(helper, /entity\.type == "WITHDRAW"/);
	assert.match(helper, /entity\.type == "DEALLOCATE"/);
	assert.match(helper, /senderAccount\.virtualAccount == sender/);
	assert.match(helper, /senderAccount\.subAccount == account\.subAccount/);
	assert.match(helper, /return AUTO_RETURN_MARGIN_TRANSFER_TYPE/);
});
