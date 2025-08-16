import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import { AddAccount, SendQuote } from "../../../generated/schema"

const ZERO_ADDRESS = Bytes.fromHexString("0x0000000000000000000000000000000000000000")

export function findAccountSourceForQuote(id: string): Bytes {
	let quote = SendQuote.load(id)
	if (!quote) return ZERO_ADDRESS
	return findAccountSourceForQuoteForAccount(quote.partyA)
}

export function findAccountSourceForQuoteForAccount(acc: Bytes): Bytes {
	let account = AddAccount.load(acc.toHexString())
	return account == null ? ZERO_ADDRESS : account.accountSource
}
