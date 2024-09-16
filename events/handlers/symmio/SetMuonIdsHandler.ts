import {SetMuonIds as SetMuonIdsEntity} from "../../../generated/schema";
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class SetMuonIdsHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new SetMuonIdsEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString());
		entity.muonAppId = event.params.muonAppId;
		entity.gateway = event.params.gateway;
		entity.x = event.params.x;
		entity.parity = event.params.parity;

		entity.blockTimestamp = event.block.timestamp;
		entity.transactionHash = event.transaction.hash;
		entity.save();
	}
}
