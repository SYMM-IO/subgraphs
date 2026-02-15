import { ethereum } from "@graphprotocol/graph-ts"
import { EditAccountNameHandler as CommonEditAccountNameHandler } from "../../../common/handlers/accountLayer/EditAccountNameHandler"
import { AccountLayerVersion } from "../../../common/BaseHandler"

export class EditAccountNameHandler<T> extends CommonEditAccountNameHandler<T> {
	handle(_event: ethereum.Event, version: AccountLayerVersion): void {
		super.handleAccount(_event, version)
	}
}
