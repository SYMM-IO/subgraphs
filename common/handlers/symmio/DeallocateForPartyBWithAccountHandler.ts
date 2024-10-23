import {BaseHandler, Version} from "../../BaseHandler"
import {ethereum} from "@graphprotocol/graph-ts/chain/ethereum";
import {Account} from "../../../generated/schema";

export class DeallocateForPartyBHandler<T> extends BaseHandler {
	handleAccount(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let account = Account.load(event.params.partyB.toHexString())!
		account.deallocated = account.deallocated.plus(event.params.amount)
		account.updateTimestamp = event.block.timestamp
		account.save()
	}
}