import {BaseHandler, Version} from "../../BaseHandler"
import {ethereum} from "@graphprotocol/graph-ts/chain/ethereum";

export class DepositForPartyBHandler<T> extends BaseHandler {
	handleAccount(_event: ethereum.Event, version: Version): void {
	}
}