import {BaseHandler, Version} from "../../BaseHandler"
import {ethereum} from "@graphprotocol/graph-ts/chain/ethereum";
import {Account} from "../../../generated/schema";

export class DeallocatePartyAHandler<T> extends BaseHandler {
	handleAccount(_event: ethereum.Event, version: Version):void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let account = Account.load(event.params.user.toHexString())
		if (account == null)
			return
		account.deallocated = account.deallocated.plus(event.params.amount)
		account.updateTimestamp = event.block.timestamp
		account.save()
	}
}