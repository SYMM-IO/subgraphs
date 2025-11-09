import { BaseHandler, Version } from "../../BaseHandler"
import { ethereum } from "@graphprotocol/graph-ts"
import { AccountType, createNewAccountIfNotExists } from "../../utils/builders"
import { SymmioEntity } from "../../../../generated/schema"
import { SOLVERS } from "../../../analytics/utils/constants"

export class RegisterPartyBHandler<T> extends BaseHandler {
	handleAccount(_event: ethereum.Event, version: Version): void {
		super.handleAccount(_event, version)
		// @ts-ignore
		const event = changetype<T>(_event)
		let account = createNewAccountIfNotExists(event.params.partyB, event.params.partyB, null, AccountType.SOLVER, event.block, event.transaction)
		account.source = event.address
		account.save()

		let player = new SymmioEntity(event.params.partyB.toHexString())
		player.address = event.params.partyB
		player.type = "Solver"
		player.name = SOLVERS.get(event.params.partyB.toHexString())
		player.save()
	}
}
