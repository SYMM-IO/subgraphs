import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import { AddAccount, SendQuote } from "../../generated/schema"

const ZERO_ADDRESS = Bytes.fromHexString("0x0000000000000000000000000000000000000000")

export function findAccountSourceForQuote(quoteId: BigInt): Bytes {
	let quote = SendQuote.load(quoteId.toString())
	if (!quote) return ZERO_ADDRESS
	return findAccountSourceForQuoteForAccount(quote!.partyA)
}

export function findAccountSourceForQuoteForAccount(acc: Bytes): Bytes {
	let account = AddAccount.load(acc.toString())
	return account == null ? ZERO_ADDRESS : account.accountSource
}
