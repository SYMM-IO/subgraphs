import {Address, BigInt} from "@graphprotocol/graph-ts";
import {symmio, symmio__getQuoteResultValue0Struct} from "../generated/symmio/symmio";

export function getQuote(id: BigInt): symmio__getQuoteResultValue0Struct | null {
	const contract = symmio.bind(
		Address.fromString("0x762407bEd807184F90F3eDcF2D7Ac9CB9d8901c6")
	);
	let result = contract.try_getQuote(id);
	return result.reverted ? null : result.value;
}
