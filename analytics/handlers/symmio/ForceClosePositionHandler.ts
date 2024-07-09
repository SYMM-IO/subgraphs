import {
	ForceClosePositionHandler as CommonForceClosePositionHandler
} from "../../../common/handlers/symmio/ForceClosePositionHandler"
import {handleClose} from "../../utils"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

import {ForceClosePosition as ForceClosePosition_0_8_2} from "../../../generated/symmio_0_8_2/symmio_0_8_2";
import {ForceClosePosition as ForceClosePosition_0_8_0} from "../../../generated/symmio_0_8_0/symmio_0_8_0";

export class ForceClosePositionHandler<T> extends CommonForceClosePositionHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		super.handleQuote(_event, version)
		super.handleSymbol(_event, version)
		super.handleAccount(_event, version)

		switch (version) {
			case Version.v_0_8_2: {
				handleClose<ForceClosePosition_0_8_2>(event, "ForceClosePosition")
				break
			}
			case Version.v_0_8_0: {
				handleClose<ForceClosePosition_0_8_0>(event, "ForceClosePosition")
				break
			}
		}
	}
}
