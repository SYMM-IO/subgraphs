import {Address, BigInt} from "@graphprotocol/graph-ts"
import {
	symmio_0_8_0,
	symmio_0_8_0__balanceInfoOfPartyAResult,
	symmio_0_8_0__balanceInfoOfPartyBResult,
	symmio_0_8_0__getQuoteResultValue0Struct,
} from "../generated/symmio_0_8_0/symmio_0_8_0"

export function getQuote(address: Address, id: BigInt): symmio_0_8_0__getQuoteResultValue0Struct | null {
	const contract = symmio_0_8_0.bind(address)
	let result = contract.try_getQuote(id)
	return result.reverted ? null : result.value
}

export function getBalanceInfoOfPartyA(address: Address, partyA: Address): symmio_0_8_0__balanceInfoOfPartyAResult | null {
	const contract = symmio_0_8_0.bind(address)
	let result = contract.try_balanceInfoOfPartyA(partyA)
	return result.reverted ? null : result.value
}

export function getBalanceInfoOfPartyB(address: Address, partyA: Address, partyB: Address): symmio_0_8_0__balanceInfoOfPartyBResult | null {
	const contract = symmio_0_8_0.bind(address)
	let result = contract.try_balanceInfoOfPartyB(partyB, partyA)
	return result.reverted ? null : result.value
}