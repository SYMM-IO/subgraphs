import {SetSymbolFundingState as SetSymbolFundingStateEntity} from "../../../generated/schema";
import {BigInt, ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class SetSymbolFundingStateHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new SetSymbolFundingStateEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString());
		if (version == Version.v_0_8_2) {
			entity.symbolId = event.params.id;
		} else {
			entity.symbolId = BigInt.zero();
		}
		entity.fundingRateEpochDuration = event.params.fundingRateEpochDuration;
		entity.fundingRateWindowTime = event.params.fundingRateWindowTime;

		entity.blockTimestamp = event.block.timestamp;
		entity.transactionHash = event.transaction.hash;
		entity.save();
	}
}
