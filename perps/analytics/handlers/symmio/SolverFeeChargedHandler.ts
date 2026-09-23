import { BigInt, ethereum, log } from "@graphprotocol/graph-ts"
import { Quote, QuoteSolverFee } from "../../../../generated/schema"
import { BaseHandler, Version } from "../../../common/BaseHandler"
import { updatePartyALatestBalance } from "../../utils/latestAccountBalance"

export class SolverFeeChargedHandler<T> extends BaseHandler {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		updatePartyALatestBalance(_event, version, event.params.receiver)

		// Contract SolverFeeType: OPEN = 0, CLOSE = 1. Keep the tag opaque.
		let feeType = event.params.feeType
		if (feeType != 0 && feeType != 1) {
			log.warning("SolverFeeCharged: unsupported feeType {}", [feeType.toString()])
			return
		}

		let quoteId = event.params.quoteId.toString() + "-" + event.address.toHexString()
		let quote = Quote.load(quoteId)
		if (!quote) {
			log.warning("SolverFeeCharged: quote {} not indexed", [quoteId])
			return
		}

		let id = quoteId + "-" + event.params.tag.toHexString()
		let fee = QuoteSolverFee.load(id)
		if (!fee) {
			fee = new QuoteSolverFee(id)
			fee.quote = quote.id
			fee.tag = event.params.tag
			fee.openFeePaid = BigInt.zero()
			fee.closeFeePaid = BigInt.zero()
		}

		if (feeType == 0) {
			fee.openFeePaid = fee.openFeePaid.plus(event.params.amount)
		} else {
			fee.closeFeePaid = fee.closeFeePaid.plus(event.params.amount)
		}
		fee.save()
	}
}
