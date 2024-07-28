import { BaseHandler, Version } from "../../BaseHandler"
import { ethereum } from "@graphprotocol/graph-ts/chain/ethereum";
import { Account, DebugEntity } from "../../../generated/schema";

export class AllocateForPartyBHandler<T> extends BaseHandler {
	handleAccount(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let account = Account.load(event.params.partyB.toHexString())
		if (account) {
			account.allocated = account.allocated.plus(event.params.amount)
			account.updateTimestamp = event.block.timestamp
			account.save()
		} else {
			let db = new DebugEntity("allocateForPartyB")
			db.message = `in version ${version.toString()} partyB: ${event.params.partyB.toHexString()} not found`
			db.save()
		}
	}
}