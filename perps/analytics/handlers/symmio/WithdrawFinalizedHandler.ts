import { BaseHandler, Version } from "../../../common/BaseHandler"
import { ethereum } from "@graphprotocol/graph-ts"

export class WithdrawFinalizedHandler<T> extends BaseHandler {
	handle(_event: ethereum.Event, version: Version): void {
	}
}
