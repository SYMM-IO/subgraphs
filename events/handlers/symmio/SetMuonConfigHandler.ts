import {SetMuonConfig as SetMuonConfigEntity} from "../../../generated/schema";
import {BigInt, ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";
import {SetMuonConfig as SetMuonConfig_8_2} from "../../../generated/symmio_0_8_2/symmio_0_8_2";
import {getGlobalCounterAndInc} from "../../../common/utils";

export class SetMuonConfigHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new SetMuonConfigEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString());
		entity.globalId = getGlobalCounterAndInc()
		entity.upnlValidTime = event.params.upnlValidTime;
		entity.priceValidTime = event.params.priceValidTime;

		if (version == Version.v_0_8_2) {
			// @ts-ignore
			const e = changetype<SetMuonConfig_8_2>(_event)
			entity.priceQuantityValidTime = e.params.priceQuantityValidTime;
		} else {
			entity.priceQuantityValidTime = BigInt.zero();
		}

		entity.blockTimestamp = event.block.timestamp;
		entity.blockNumber = event.block.number;
		entity.transactionHash = event.transaction.hash;
		entity.save();
	}
}
