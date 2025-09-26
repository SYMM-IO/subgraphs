import { BaseHandler, Version } from "../../BaseHandler";
import { ethereum } from "@graphprotocol/graph-ts";
import { AffiliateFeeCollector, FeeCollectorShare } from "../../../../generated/schema";
import { getSymmioSharePercent } from "../../../analytics/utils/common";

export class SetFeeCollectorHandler<T> extends BaseHandler {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let affFeeCol = new AffiliateFeeCollector(event.params.affiliate.toHexString())
		affFeeCol.feeCollector = event.params.newFeeCollector
		affFeeCol.save()

		let feeColShare = FeeCollectorShare.load(event.params.newFeeCollector.toHexString())
		if (!feeColShare) {
			feeColShare = new FeeCollectorShare(event.params.newFeeCollector.toHexString())
			feeColShare.symmioShare = getSymmioSharePercent(event.params.newFeeCollector)
			feeColShare.save()
		}
		
	}
}