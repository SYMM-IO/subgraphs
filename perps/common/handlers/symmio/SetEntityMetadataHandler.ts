import { ethereum } from "@graphprotocol/graph-ts"
import { BaseHandler, Version } from "../../BaseHandler"
import { SymmioEntity } from "../../../../generated/schema"
import { AFFILIATES, SOLVERS } from "../../../analytics/utils/constants"

export class SetEntityMetadataHandler<T> extends BaseHandler {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		const id = event.params.entity.toHexString()
		let player = SymmioEntity.load(id)
		if (!player) {
			player = new SymmioEntity(id)
			player.address = event.params.entity
			if (SOLVERS.has(id)) {
				player.type = "Solver"
			} else if (AFFILIATES.has(id)) {
				player.type = "Affiliate"
			} else {
				player.type = "Unknown"
			}
		}
		player.name = event.params.metadata.name
		player.brandColor = event.params.metadata.brandColor
		player.metadata = event.params.metadata.metadata
		player.save()
	}
}
