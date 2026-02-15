import { ethereum } from "@graphprotocol/graph-ts"
import { VirtualAccountDeletedHandler as CommonVirtualAccountDeletedHandler } from "../../../common/handlers/accountLayer/VirtualAccountDeletedHandler"
import { AccountLayerVersion } from "../../../common/BaseHandler"

export class VirtualAccountDeletedHandler<T> extends CommonVirtualAccountDeletedHandler<T> {
	handle(_event: ethereum.Event, version: AccountLayerVersion): void {
		super.handleAccount(_event, version)
	}
}
