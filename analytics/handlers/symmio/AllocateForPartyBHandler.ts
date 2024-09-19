import {
	AllocateForPartyBHandler as CommonAllocateForPartyBHandler
} from "../../../common/handlers/symmio/AllocateForPartyBWithAccountHandler"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";
import {BalanceChange} from "../../../generated/schema";
import {BalanceChangeType, balanceChangeTypes} from "../../utils/constants";
import {getConfiguration} from "../../utils/builders";


export class AllocateForPartyBHandler<T> extends CommonAllocateForPartyBHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		super.handle(_event, version)
		super.handleQuote(_event, version)
		super.handleSymbol(_event, version)
		super.handleAccount(_event, version)

		// @ts-ignore
		const event = changetype<T>(_event)

		if (version < Version.v_0_8_3) {
			let allocate = new BalanceChange(
				event.transaction.hash.toHex() + "-" + event.logIndex.toHexString(),
			)
			allocate.type = balanceChangeTypes.get(BalanceChangeType.ALLOCATE)
			allocate.timestamp = event.block.timestamp
			allocate.blockNumber = event.block.number
			allocate.transaction = event.transaction.hash
			allocate.amount = event.params.amount
			allocate.account = event.params.partyB
			allocate.sideAccount = event.params.partyA
			allocate.collateral = getConfiguration(event).collateral
			allocate.save()
		}
	}
}
