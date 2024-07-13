import { Address, BigInt, ethereum, log } from "@graphprotocol/graph-ts";
import { Version } from "../../../common/BaseHandler";

import { SettlePartyALiquidation, symmio_0_8_2 } from "../../../generated/symmio_0_8_2/symmio_0_8_2";
import { Liquidator, PartyALiquidator } from "../../../generated/schema";
import { getAllocatedBalance } from "./utils";

export class SettlePartyALiquidationHandler<T> {

	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event);
		switch (version) {
			case Version.v_0_8_2: {
				// @ts-ignore
				const e = changetype<SettlePartyALiquidation>(_event);
				let partyALiquidator = PartyALiquidator.load(e.params.partyA.toHexString());
				if (!partyALiquidator) {
					log.error("partyALiquidator not found", []);
					return;
				}
				let contract = symmio_0_8_2.bind(e.address);
				let liquidators = partyALiquidator.Liquidators!;
				for (let i = 0; i < liquidators.length; i++) {
					let liquidator = Liquidator.load(liquidators[i])!;
					let newBalance = contract.allocatedBalanceOfPartyA(Address.fromBytes(liquidator.liquidatorAddress));
					if (newBalance.lt(liquidator.balance)) {
						log.error("newBalance:{} oldBalance:{}", [newBalance.toString(), liquidator.balance.toString()]);
					}
					liquidator.profit = liquidator.profit.plus(newBalance.minus(liquidator.balance));
					liquidator.balance = newBalance;
					liquidator.save();
				}
				partyALiquidator.Liquidators = null;
				break;
			}
			case Version.v_0_8_0: {

			}
		}

	}
}
