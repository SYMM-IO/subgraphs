import { ethereum } from "@graphprotocol/graph-ts"
import { SymmVestingVersion } from "../../BaseHandler"
import { User } from "../../../generated/schema"

export class VestingPlanSetupHandler<T> {
	handle(_event: ethereum.Event, version: SymmVestingVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new User(event.params.user.toHexString())
		entity.user = event.params.user
		entity.save()
	}
}
