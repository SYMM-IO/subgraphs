import { ethereum } from "@graphprotocol/graph-ts"
import { TimelockVersion } from "../../../common/BaseHandler"
import { CallScheduledHandler as CommonCallScheduledHandler } from "../common/CallScheduledHandler"

export class CallScheduledHandler<T> extends CommonCallScheduledHandler<T> {
	handle(_event: ethereum.Event, version: TimelockVersion): void {
		super.handle(_event, version)
	}
}
