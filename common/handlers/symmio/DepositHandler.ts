import {BaseHandler, Version} from "../../BaseHandler"
import {ethereum} from "@graphprotocol/graph-ts/chain/ethereum";

export class DepositHandler<T> extends BaseHandler {
	handleAccount(_event: ethereum.Event, version: Version): void {
		super.handleSymbol(_event, version)
	}
}