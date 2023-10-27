import {Address, BigInt} from "@graphprotocol/graph-ts";
import {
	symmio,
	symmio__getLiquidatedStateOfPartyAResultValue0Struct,
	symmio__getQuoteResultValue0Struct
} from "../generated/symmio/symmio";

export function getQuote(address: Address, id: BigInt): symmio__getQuoteResultValue0Struct | null {
	const contract = symmio.bind(address);
	let result = contract.try_getQuote(id);
	return result.reverted ? null : result.value;
}

export function getLiquidatedStateOfPartyA(address: Address, partyA: Address): symmio__getLiquidatedStateOfPartyAResultValue0Struct | null {
	const contract = symmio.bind(address);
	let result = contract.try_getLiquidatedStateOfPartyA(partyA);
	return result.reverted ? null : result.value;
}