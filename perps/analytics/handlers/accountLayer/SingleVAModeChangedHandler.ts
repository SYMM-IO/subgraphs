import { ethereum } from "@graphprotocol/graph-ts"
import { SingleVAModeChangedHandler as CommonSingleVAModeChangedHandler } from "../../../common/handlers/accountLayer/SingleVAModeChangedHandler"
import { AccountLayerVersion } from "../../../common/BaseHandler"

export class SingleVAModeChangedHandler<T> extends CommonSingleVAModeChangedHandler<T> {
	handle(_event: ethereum.Event, version: AccountLayerVersion): void {
		super.handleAccount(_event, version)
	}
}
