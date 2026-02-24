
import { AdminTransferCancelledHandler as CommonAdminTransferCancelledHandler } from "../../../common/handlers/accountLayer/AdminTransferCancelledHandler"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"

export class AdminTransferCancelledHandler<T> extends CommonAdminTransferCancelledHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		super.handle(_event, version)
	}
}
