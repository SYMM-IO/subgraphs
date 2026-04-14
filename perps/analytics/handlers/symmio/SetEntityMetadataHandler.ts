import { SetEntityMetadataHandler as CommonSetEntityMetadataHandler } from "../../../common/handlers/symmio/SetEntityMetadataHandler"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"

export class SetEntityMetadataHandler<T> extends CommonSetEntityMetadataHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
	}
}
