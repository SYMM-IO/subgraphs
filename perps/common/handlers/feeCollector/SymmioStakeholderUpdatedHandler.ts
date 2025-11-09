import { BaseFeeCollectorHandler, FeeCollectorVersion } from "../../BaseHandler"
import { ethereum } from "@graphprotocol/graph-ts"
import { FeeCollectorShare } from "../../../../generated/schema"

export class SymmioStakeholderUpdatedHandler<T> extends BaseFeeCollectorHandler {
	handle(_event: ethereum.Event, version: FeeCollectorVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let feeColShare = new FeeCollectorShare(event.address.toHexString())
		feeColShare.symmioShare = event.params.newShare
		feeColShare.save()
	}
}
