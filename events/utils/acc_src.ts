import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import { AddAccount, SendQuote } from "../../generated/schema"

const ZERO_ADDRESS = Bytes.fromHexString("0x0000000000000000000000000000000000000000")

export function findAccountSource(quoteId: BigInt): Bytes {
	let quote = SendQuote.load(quoteId.toString())!
	let account = AddAccount.load(quote.partyA.toString())!
	return account.accountSource === null ? ZERO_ADDRESS : account.accountSource
}
