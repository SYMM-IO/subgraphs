import {Address, BigInt} from "@graphprotocol/graph-ts"
import {
	symmio_0_8_2,
	symmio_0_8_2__balanceInfoOfPartyAResult,
	symmio_0_8_2__balanceInfoOfPartyBResult,
	symmio_0_8_2__getLiquidatedStateOfPartyAResultValue0Struct,
	symmio_0_8_2__getQuoteResultValue0Struct,
} from "../generated/symmio_0_8_2/symmio_0_8_2"

export function getQuote(address: Address, id: BigInt): symmio_0_8_2__getQuoteResultValue0Struct | null {
	const contract = symmio_0_8_2.bind(address)
	let result = contract.try_getQuote(id)
	return result.reverted ? null : result.value
}

export function getLiquidatedStateOfPartyA(address: Address, partyA: Address): symmio_0_8_2__getLiquidatedStateOfPartyAResultValue0Struct | null {
	const contract = symmio_0_8_2.bind(address)
	let result = contract.try_getLiquidatedStateOfPartyA(partyA)
	return result.reverted ? null : result.value
}

export function getBalanceInfoOfPartyA(address: Address, partyA: Address): symmio_0_8_2__balanceInfoOfPartyAResult | null {
	const contract = symmio_0_8_2.bind(address)
	let result = contract.try_balanceInfoOfPartyA(partyA)
	return result.reverted ? null : result.value
}

export function getBalanceInfoOfPartyB(address: Address, partyA: Address, partyB: Address): symmio_0_8_2__balanceInfoOfPartyBResult | null {
	const contract = symmio_0_8_2.bind(address)
	let result = contract.try_balanceInfoOfPartyB(partyB, partyA)
	return result.reverted ? null : result.value
}