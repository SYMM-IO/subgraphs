import {SetSymbolValidationState as SetSymbolValidationStateEntity} from "../../../generated/schema";
import {BigInt, ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class SetSymbolValidationStateHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new SetSymbolValidationStateEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString());
		if (version == Version.v_0_8_2) {
			entity.symbolId = event.params.id;
		} else {
			entity.symbolId = BigInt.zero();
		}
		entity.oldState = event.params.oldState;
		entity.isValid = event.params.isValid;

		entity.blockTimestamp = event.block.timestamp;
		entity.transactionHash = event.transaction.hash;
		entity.save();
	}
}
