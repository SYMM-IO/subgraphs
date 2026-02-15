import { ethereum } from "@graphprotocol/graph-ts"
import { VirtualAccountReusedHandler as CommonVirtualAccountReusedHandler } from "../../../common/handlers/accountLayer/VirtualAccountReusedHandler"
import { AccountLayerVersion } from "../../../common/BaseHandler"

export class VirtualAccountReusedHandler<T> extends CommonVirtualAccountReusedHandler<T> {
	handle(_event: ethereum.Event, version: AccountLayerVersion): void {
		super.handleAccount(_event, version)
	}
}
