import {Version} from "../../BaseHandler"
import {BigInt, ethereum,} from "@graphprotocol/graph-ts"
import {SendQuoteHandler} from "./SendQuoteHandler"
import {Account} from "../../../generated/schema"

export class SendQuoteHandlerWithAccount<T> extends SendQuoteHandler<T> {
	handleAccount(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let account = Account.load(event.params.partyA.toHexString())!
		account.quotesCount = account.quotesCount.plus(BigInt.fromString("1"))
		account.save()
	}
}