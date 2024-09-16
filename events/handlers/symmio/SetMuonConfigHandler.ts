import {SetMuonConfig as SetMuonConfigEntity} from "../../../generated/schema";
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class SetMuonConfigHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new SetMuonConfigEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString());
		entity.upnlValidTime = event.params.upnlValidTime;
		entity.priceValidTime = event.params.priceValidTime;
		entity.priceQuantityValidTime = event.params.priceQuantityValidTime;

		entity.blockTimestamp = event.block.timestamp;
		entity.transactionHash = event.transaction.hash;
		entity.save();
	}
}
