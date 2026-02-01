import { BaseHandler, Version } from "../../BaseHandler"
import { LiquidationDetail, Quote } from "../../../../generated/schema"
import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { getQuote as getQuote_0_8_0 } from "../../contract_utils_0_8_0"
import { getLiquidatedStateOfPartyA as getLiquidatedStateOfPartyA_0_8_1, getQuote as getQuote_0_8_1 } from "../../contract_utils_0_8_1"
import { getLiquidatedStateOfPartyA as getLiquidatedStateOfPartyA_0_8_2, getQuote as getQuote_0_8_2 } from "../../contract_utils_0_8_2"
import { getLiquidatedStateOfPartyA as getLiquidatedStateOfPartyA_0_8_3, getQuote as getQuote_0_8_3 } from "../../contract_utils_0_8_3"
import { getLiquidatedStateOfPartyA as getLiquidatedStateOfPartyA_0_8_4, getQuote as getQuote_0_8_4 } from "../../contract_utils_0_8_4"
import { setEventTimestampAndTransactionHashAndAction } from "../../utils/quote"
import { AccountType, createNewAccountIfNotExists } from "../../utils/builders"
import { LiquidatePositionsPartyA as LiquidatePositionsPartyA_0_8_4 } from "../../../../generated/symmio_0_8_4/symmio_0_8_4"
import { LiquidatePositionsPartyA as LiquidatePositionsPartyA_0_8_3 } from "../../../../generated/symmio_0_8_3/symmio_0_8_3"

export class LiquidatePositionsPartyAHandler<T> extends BaseHandler {
	handleAccount(_event: ethereum.Event, version: Version): void {
		super.handleAccount(_event, version)
		// @ts-ignore
		const event = changetype<T>(_event)
		let account = createNewAccountIfNotExists(
			event.params.liquidator,
			event.params.liquidator,
			null,
			AccountType.LIQUIDATOR,
			event.block,
			event.transaction,
		)
		account.source = event.address
		account.save()
	}

	handleQuote(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		for (let i = 0, lenQ = event.params.quoteIds.length; i < lenQ; i++) {
			let quoteId = event.params.quoteIds[i]
			let quote = Quote.load(quoteId.toString() + "-" + event.address.toHexString())!
			quote.globalCounter = super.handleGlobalCounter()
			quote.liquidatedSide = 0
			quote.quoteStatus = 8
			let avgClosedPrice: BigInt
			switch (version) {
				case Version.v_0_8_4: {
					let q = getQuote_0_8_4(event.address, quoteId)!
					avgClosedPrice = q.avgClosedPrice
					// @ts-ignore
					let e = changetype<LiquidatePositionsPartyA_0_8_4>(event)
					quote.liquidationId = e.params.liquidationId
					const liquidationDetail = getLiquidatedStateOfPartyA_0_8_4(event.address, event.params.partyA)!
					let entity = LiquidationDetail.load(
						event.params.partyA.toHexString() + "-" + e.params.liquidationId.toHexString() + "-" + event.address.toHexString(),
					)
					if (!entity)
						entity = new LiquidationDetail(
							event.params.partyA.toHexString() + "-" + e.params.liquidationId.toHexString() + "-" + event.address.toHexString(),
						)
					entity.source = event.address
					entity.liquidationId = liquidationDetail.liquidationId
					entity.liquidationType = liquidationDetail.liquidationType
					entity.upnl = liquidationDetail.upnl
					entity.totalUnrealizedLoss = liquidationDetail.totalUnrealizedLoss
					entity.deficit = liquidationDetail.deficit
					entity.liquidationFee = liquidationDetail.liquidationFee
					entity.timestamp = liquidationDetail.timestamp
					entity.involvedPartyBCounts = liquidationDetail.involvedPartyBCounts
					entity.partyAAccumulatedUpnl = liquidationDetail.partyAAccumulatedUpnl
					entity.disputed = liquidationDetail.disputed
					entity.liquidationTimestamp = liquidationDetail.liquidationTimestamp
					entity.save()
					break
				}
				case Version.v_0_8_3: {
					let q = getQuote_0_8_3(event.address, quoteId)!
					avgClosedPrice = q.avgClosedPrice
					// @ts-ignore
					let e = changetype<LiquidatePositionsPartyA_0_8_3>(event)
					quote.liquidationId = e.params.liquidationId
					const liquidationDetail = getLiquidatedStateOfPartyA_0_8_3(event.address, event.params.partyA)!
					let entity = LiquidationDetail.load(
						event.params.partyA.toHexString() + "-" + e.params.liquidationId.toHexString() + "-" + event.address.toHexString(),
					)
					if (!entity)
						entity = new LiquidationDetail(
							event.params.partyA.toHexString() + "-" + e.params.liquidationId.toHexString() + "-" + event.address.toHexString(),
						)
					entity.source = event.address
					entity.liquidationId = liquidationDetail.liquidationId
					entity.liquidationType = liquidationDetail.liquidationType
					entity.upnl = liquidationDetail.upnl
					entity.totalUnrealizedLoss = liquidationDetail.totalUnrealizedLoss
					entity.deficit = liquidationDetail.deficit
					entity.liquidationFee = liquidationDetail.liquidationFee
					entity.timestamp = liquidationDetail.timestamp
					entity.involvedPartyBCounts = liquidationDetail.involvedPartyBCounts
					entity.partyAAccumulatedUpnl = liquidationDetail.partyAAccumulatedUpnl
					entity.disputed = liquidationDetail.disputed
					entity.liquidationTimestamp = liquidationDetail.liquidationTimestamp
					entity.save()
					break
				}
				case Version.v_0_8_2: {
					let q = getQuote_0_8_2(event.address, quoteId)!
					avgClosedPrice = q.avgClosedPrice
					const liquidationDetail = getLiquidatedStateOfPartyA_0_8_2(event.address, event.params.partyA)!
					let entity = LiquidationDetail.load(
						event.params.partyA.toHexString() + "-" + liquidationDetail.liquidationId.toHexString() + "-" + event.address.toHexString(),
					)
					if (!entity)
						entity = new LiquidationDetail(
							event.params.partyA.toHexString() + "-" + liquidationDetail.liquidationId.toHexString() + "-" + event.address.toHexString(),
						)
					entity.source = event.address
					entity.liquidationId = liquidationDetail.liquidationId
					entity.liquidationType = liquidationDetail.liquidationType
					entity.upnl = liquidationDetail.upnl
					entity.totalUnrealizedLoss = liquidationDetail.totalUnrealizedLoss
					entity.deficit = liquidationDetail.deficit
					entity.liquidationFee = liquidationDetail.liquidationFee
					entity.timestamp = liquidationDetail.timestamp
					entity.involvedPartyBCounts = liquidationDetail.involvedPartyBCounts
					entity.partyAAccumulatedUpnl = liquidationDetail.partyAAccumulatedUpnl
					entity.disputed = liquidationDetail.disputed
					entity.save()
					break
				}
				case Version.v_0_8_1: {
					let q = getQuote_0_8_1(event.address, quoteId)!
					avgClosedPrice = q.avgClosedPrice
					const liquidationDetail = getLiquidatedStateOfPartyA_0_8_1(event.address, event.params.partyA)!
					let entity = LiquidationDetail.load(
						event.params.partyA.toHexString() + "-" + liquidationDetail.liquidationId.toHexString() + "-" + event.address.toHexString(),
					)
					if (!entity)
						entity = new LiquidationDetail(
							event.params.partyA.toHexString() + "-" + liquidationDetail.liquidationId.toHexString() + "-" + event.address.toHexString(),
						)
					entity.source = event.address
					entity.liquidationId = liquidationDetail.liquidationId
					entity.liquidationType = liquidationDetail.liquidationType
					entity.upnl = liquidationDetail.upnl
					entity.totalUnrealizedLoss = liquidationDetail.totalUnrealizedLoss
					entity.deficit = liquidationDetail.deficit
					entity.liquidationFee = liquidationDetail.liquidationFee
					entity.timestamp = liquidationDetail.timestamp
					entity.involvedPartyBCounts = liquidationDetail.involvedPartyBCounts
					entity.partyAAccumulatedUpnl = liquidationDetail.partyAAccumulatedUpnl
					entity.disputed = liquidationDetail.disputed
					entity.save()
					break
				}
				case Version.v_0_8_0: {
					let q = getQuote_0_8_0(event.address, quoteId)!
					avgClosedPrice = q.avgClosedPrice
					break
				}
			}
			quote.liquidateAmount = quote.quantity!.minus(quote.closedAmount!)
			quote.liquidatePrice = avgClosedPrice
				.times(quote.quantity!)
				.minus(quote.averageClosedPrice!.times(quote.closedAmount!))
				.div(quote.liquidateAmount!)
			quote.averageClosedPrice = avgClosedPrice
			quote.closedAmount = quote.quantity
			quote.save()
			setEventTimestampAndTransactionHashAndAction(quote, "LiquidatePositionsPartyA", _event)
		}
	}
}
