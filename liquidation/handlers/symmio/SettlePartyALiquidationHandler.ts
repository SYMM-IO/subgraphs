import { ethereum, log } from "@graphprotocol/graph-ts";
import { Version } from "../../../common/BaseHandler";

import { SettlePartyALiquidation } from "../../../generated/symmio_0_8_2/symmio_0_8_2";
import { PartyALiquidator } from "../../../generated/schema";
import { update_liquidator } from "./utils";

export class SettlePartyALiquidationHandler<T> {

	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event);
		switch (version) {
			case Version.v_0_8_2: {
				// @ts-ignore
				const e = changetype<SettlePartyALiquidation>(_event);

				let partyALiquidator = PartyALiquidator.load(e.params.partyA.toHexString())!;
				let liquidators = partyALiquidator.Liquidators!;
				for (let i = 0; i < liquidators.length; i++) {
					update_liquidator(liquidators[i], e.address)
				}
				partyALiquidator.Liquidators = null;
				partyALiquidator.save()
				break;
			}
			case Version.v_0_8_0: {

			}
		}

	}
}
