
import { FeesDistributedHandler as CommonFeesDistributedHandler } from "../../../common/handlers/accountLayer/FeesDistributedHandler"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"

export class FeesDistributedHandler<T> extends CommonFeesDistributedHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		super.handle(_event, version)
	}
}
