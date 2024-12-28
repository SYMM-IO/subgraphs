import {Version} from "../../BaseHandler"
import {BigInt, ethereum} from "@graphprotocol/graph-ts"
import {Account} from "../../../generated/schema"
import {OpenPositionHandler} from "./OpenPositionHandler";

export class OpenPositionHandlerWithAccount<T> extends OpenPositionHandler<T> {
	handleAccount(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let account = Account.load(event.params.partyA.toHexString())!
		account.positionsCount = account.positionsCount.plus(BigInt.fromString("1"))
		account.updateTimestamp = event.block.timestamp
		account.save()
	}
}