import { ethereum } from "@graphprotocol/graph-ts"
import { SubAccountDeletedHandler as CommonSubAccountDeletedHandler } from "../../../common/handlers/accountLayer/SubAccountDeletedHandler"
import { AccountLayerVersion } from "../../../common/BaseHandler"

export class SubAccountDeletedHandler<T> extends CommonSubAccountDeletedHandler<T> {
	handle(_event: ethereum.Event, version: AccountLayerVersion): void {
		super.handleAccount(_event, version)
	}
}
