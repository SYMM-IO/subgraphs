
import { AdminTransferProposedHandler as CommonAdminTransferProposedHandler } from "../../../common/handlers/accountLayer/AdminTransferProposedHandler"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"

export class AdminTransferProposedHandler<T> extends CommonAdminTransferProposedHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		super.handle(_event, version)
	}
}
