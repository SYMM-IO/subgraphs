
import { FeeUpdateCancelledHandler as CommonFeeUpdateCancelledHandler } from "../../../common/handlers/accountLayer/FeeUpdateCancelledHandler"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"

export class FeeUpdateCancelledHandler<T> extends CommonFeeUpdateCancelledHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		super.handle(_event, version)
	}
}
