import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

function read(path) {
	return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

test("quote model stores the close fee rate from normalized quote data", () => {
	const quoteModel = read("perps/common/models/Quote.graphql");
	const loader = read("perps/common/VersionedQuoteLoader.ts");
	const sendQuoteHandler = read("perps/common/handlers/symmio/SendQuoteHandler.ts");
	const acceptCancelRequestHandler = read("perps/common/handlers/symmio/AcceptCancelRequestHandler.ts");
	const contractUtils = read("perps/common/contract_utils_0_8_6.ts");

	assert.match(quoteModel, /\bcloseFee:\s*BigInt!/);
	assert.match(loader, /\bcloseFee:\s*BigInt\b/);
	assert.match(loader, /getQuote as getQuote_0_8_6/);
	assert.match(loader, /case Version\.v_0_8_6:/);
	assert.match(loader, /data\.closeFee\s*=\s*q\.closeFee/);
	assert.match(sendQuoteHandler, /quote\.closeFee\s*=\s*BigInt\.zero\(\)/);
	assert.match(sendQuoteHandler, /quote\.closeFee\s*=\s*q\.closeFee/);
	assert.match(acceptCancelRequestHandler, /quote\.closeFee\s*=\s*BigInt\.zero\(\)/);
	assert.match(acceptCancelRequestHandler, /quote\.closeFee\s*=\s*q\.closeFee/);
	assert.match(contractUtils, /symmio_0_8_6__getQuoteResultValue0Struct/);
});
