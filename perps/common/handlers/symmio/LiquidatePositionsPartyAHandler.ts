import { BaseHandler, Version } from "../../BaseHandler"
import { Account, DebugEntity, LiquidationDetail, Quote, SubAccount, VirtualAccount } from "../../../../generated/schema"
import { BigInt, ethereum, log } from "@graphprotocol/graph-ts"
import { getQuoteData, getLiquidationStateData } from "../../VersionedQuoteLoader"
import { setEventTimestampAndTransactionHashAndAction } from "../../utils/quote"
import { AccountType, createNewAccountIfNotExists } from "../../utils/builders"
import { setLiquidationDetailProfileRefs, updateQuoteHierarchyCounters } from "../../utils/profile"
import { updateQuoteBucketHierarchyHistoriesForQuote } from "../../../analytics/utils/historyHelpers"
import { LiquidatePositionsPartyA as LiquidatePositionsPartyA_0_8_3 } from "../../../../generated/symmio_0_8_3/symmio_0_8_3"
import { LiquidatePositionsPartyA as LiquidatePositionsPartyA_0_8_4 } from "../../../../generated/symmio_0_8_4/symmio_0_8_4"
import { LiquidatePositionsPartyA as LiquidatePositionsPartyA_0_8_5 } from "../../../../generated/symmio_0_8_5/symmio_0_8_5"

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
			let quote = Quote.load(quoteId.toString() + "-" + event.address.toHexString())
			if (!quote) {
				log.debug("quote not exist. quoteId {}", [quoteId.toString()])
				let db = new DebugEntity("LiqPositionsPartyA-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString() + "-" + i.toString())
				db.message = `quoteId ${quoteId.toString()} not exist`
				db.save()
				continue
			}
			quote.globalCounter = super.handleGlobalCounter()
			quote.liquidatedSide = 0
			quote.quoteStatus = 8

			let data = getQuoteData(version, event.address, quoteId)
			if (!data) {
				log.debug("getQuoteData null. quoteId {}", [quoteId.toString()])
				quote.save()
				setEventTimestampAndTransactionHashAndAction(quote, "LiquidatePositionsPartyA", _event)
				continue
			}
			let avgClosedPrice = data.avgClosedPrice
			quote.accumulatedPaidFunding = data.accumulatedPaidFunding
			quote.lastFundingPaymentTimestamp = data.lastFundingPaymentTimestamp

			if (version >= Version.v_0_8_1) {
				let liqState = getLiquidationStateData(version, event.address, event.params.partyA)
				if (liqState) {
					// Get liquidationId: from event params in v0.8.3+, from struct in v0.8.1-v0.8.2
					let liquidationId = liqState.liquidationId
					if (version == Version.v_0_8_5) {
						// @ts-ignore
						let e = changetype<LiquidatePositionsPartyA_0_8_5>(event)
						quote.liquidationId = e.params.liquidationId
						liquidationId = e.params.liquidationId
					} else if (version == Version.v_0_8_4) {
						// @ts-ignore
						let e = changetype<LiquidatePositionsPartyA_0_8_4>(event)
						quote.liquidationId = e.params.liquidationId
						liquidationId = e.params.liquidationId
					} else if (version == Version.v_0_8_3) {
						// @ts-ignore
						let e = changetype<LiquidatePositionsPartyA_0_8_3>(event)
						quote.liquidationId = e.params.liquidationId
						liquidationId = e.params.liquidationId
					}

					let entityId = event.params.partyA.toHexString() + "-" + liquidationId.toHexString() + "-" + event.address.toHexString()
					let entity = LiquidationDetail.load(entityId)
					if (!entity) {
						entity = new LiquidationDetail(entityId)
						entity.settled = false
						entity.fullyLiquidated = false
						entity.takeover = false
						entity.autoTakeover = false
						entity.takeoverSettled = false
						entity.totalPnl = BigInt.zero()
						entity.paidCva = BigInt.zero()
						entity.paidLf = BigInt.zero()
						entity.potentialLf = BigInt.zero()
						let partyAAccount = Account.load(event.params.partyA.toHexString())
						if (partyAAccount) {
							entity.affiliate = partyAAccount.accountSource
						}
					}
					entity.source = event.address
					entity.partyA = event.params.partyA
					entity.partyAAccount = event.params.partyA.toHexString()
					entity.liquidationId = liqState.liquidationId
					entity.liquidationType = liqState.liquidationType
					entity.upnl = liqState.upnl
					entity.totalUnrealizedLoss = liqState.totalUnrealizedLoss
					entity.deficit = liqState.deficit
					entity.liquidationFee = liqState.liquidationFee
					entity.timestamp = liqState.timestamp
					entity.involvedPartyBCounts = liqState.involvedPartyBCounts
					entity.partyAAccumulatedUpnl = liqState.partyAAccumulatedUpnl
					entity.disputed = liqState.disputed
					entity.liquidationTimestamp = liqState.liquidationTimestamp
					setLiquidationDetailProfileRefs(entity, Account.load(event.params.partyA.toHexString()), event.address)
					entity.save()
				}
			}

			quote.liquidateAmount = quote.quantity!.minus(quote.closedAmount!)
			if (quote.liquidateAmount!.gt(BigInt.zero())) {
				quote.liquidatePrice = avgClosedPrice
					.times(quote.quantity!)
					.minus(quote.averageClosedPrice!.times(quote.closedAmount!))
					.div(quote.liquidateAmount!)
			} else {
				quote.liquidatePrice = avgClosedPrice
			}
			quote.averageClosedPrice = avgClosedPrice
			quote.closedAmount = quote.quantity
			quote.quantityToClose = BigInt.zero()
			quote.closePrice = BigInt.zero()
			quote.save()
			setEventTimestampAndTransactionHashAndAction(quote, "LiquidatePositionsPartyA", _event)
			updateQuoteHierarchyCounters(
				quote,
				BigInt.zero(),
				BigInt.fromI32(-1),
				BigInt.zero(),
				BigInt.fromI32(1),
				BigInt.zero(),
				BigInt.zero(),
				BigInt.zero(),
				_event.block.timestamp,
			)
			updateQuoteBucketHierarchyHistoriesForQuote(
				quote,
				_event.block.timestamp,
				BigInt.zero(),
				BigInt.fromI32(-1),
				BigInt.zero(),
				BigInt.fromI32(1),
				BigInt.zero(),
				BigInt.zero(),
				BigInt.zero(),
			)

			if (quote.subAccount) {
				let sub = SubAccount.load(quote.subAccount!)
				if (sub) {
					sub.activePositions = sub.activePositions.minus(BigInt.fromI32(1))
					sub.save()
				}
			}
			if (quote.virtualAccount) {
				let va = VirtualAccount.load(quote.virtualAccount!)
				if (va) {
					va.activePositions = va.activePositions.minus(BigInt.fromI32(1))
					va.save()
				}
			}
		}
	}
}
