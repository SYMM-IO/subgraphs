import { ethereum } from "@graphprotocol/graph-ts"
import { VirtualAccountCreatedHandler as CommonVirtualAccountCreatedHandler } from "../../../common/handlers/accountLayer/VirtualAccountCreatedHandler"
import { AccountLayerVersion } from "../../../common/BaseHandler"

export class VirtualAccountCreatedHandler<T> extends CommonVirtualAccountCreatedHandler<T> {
	handle(_event: ethereum.Event, version: AccountLayerVersion): void {
		super.handleAccount(_event, version)
	}
}
