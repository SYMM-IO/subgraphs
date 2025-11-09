import { ethereum } from "@graphprotocol/graph-ts"
import { BaseMultiAccountHandler, MultiAccountVersion } from "../../BaseHandler"
import { AccountType, createNewAccountIfNotExists } from "../../utils/builders"
import { SymmioEntity } from "../../../../generated/schema"
import { getSource } from "../../utils/get_source"
import { AFFILIATES } from "../../../analytics/utils/constants"

export class AddAccountHandler<T> extends BaseMultiAccountHandler {
	handleAccount(_event: ethereum.Event, version: MultiAccountVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let account = createNewAccountIfNotExists(
			event.params.account,
			event.params.user,
			event.address,
			AccountType.NORMAL,
			event.block,
			event.transaction,
			event.params.name,
			true,
		)
		account.source = getSource<T>(event, version)
		account.save()

		const affId = event.address.toHexString()
		let player = SymmioEntity.load(affId)
		if (!player) {
			player = new SymmioEntity(affId)
			player.address = event.address
			player.type = "Affiliate"
			player.name = AFFILIATES.get(affId)
			player.save()
		}
	}
}
