import {
	SetSymbolsPricesHandler as CommonHandler
} from "../../../common/handlers/symmio/SetSymbolsPricesHandler"

import { ethereum } from "@graphprotocol/graph-ts";
import { Version } from "../../../common/BaseHandler";
import { addLiquidator } from "./utils";

export class SetSymbolsPricesHandler<T> extends CommonHandler<T> {

	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		super.handleGlobalCounter()
		addLiquidator(_event)
	}
}
