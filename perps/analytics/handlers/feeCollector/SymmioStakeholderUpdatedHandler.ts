import { SymmioStakeholderUpdatedHandler as CommonSymmioStakeholderUpdatedHandler } from "../../../common/handlers/feeCollector/SymmioStakeholderUpdatedHandler"
import { ethereum } from "@graphprotocol/graph-ts"
import { FeeCollectorVersion } from "../../../common/BaseHandler"

export class SymmioStakeholderUpdatedHandler<T> extends CommonSymmioStakeholderUpdatedHandler<T> {
	handle(_event: ethereum.Event, version: FeeCollectorVersion): void {
		super.handle(_event, version)
	}
}
