import { ethereum } from "@graphprotocol/graph-ts"
import { TimelockVersion } from "../../../common/BaseHandler"
import { CallExecutedHandler as CommonCallExecutedHandler } from "../common/CallExecutedHandler"

export class CallExecutedHandler<T> extends CommonCallExecutedHandler<T> {
	handle(_event: ethereum.Event, version: TimelockVersion): void {
		super.handle(_event, version)
	}
}
