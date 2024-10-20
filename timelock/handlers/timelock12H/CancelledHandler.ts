import { ethereum } from "@graphprotocol/graph-ts"
import { TimelockVersion } from "../../../common/BaseHandler"
import { CancelledHandler as CommonCancelledHandler } from "../common/CancelledHandler"

export class CancelledHandler<T> extends CommonCancelledHandler<T> {
	handle(_event: ethereum.Event, version: TimelockVersion): void {
		super.handle(_event, version)
	}
}
