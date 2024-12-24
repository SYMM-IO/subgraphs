import {BaseHandler, Version} from "../../BaseHandler"
import {ethereum} from "@graphprotocol/graph-ts";
import {AccountType, createNewAccountIfNotExists} from "../../utils/builders";

export class LiquidatePartyAHandlerWithAccount<T> extends BaseHandler {
	handleAccount(_event: ethereum.Event, version: Version): void {
		super.handleAccount(_event, version);
		// @ts-ignore
		const event = changetype<T>(_event)
		createNewAccountIfNotExists(event.params.liquidator, event.params.liquidator, null, AccountType.LIQUIDATOR, event.block, event.transaction)
	}
}