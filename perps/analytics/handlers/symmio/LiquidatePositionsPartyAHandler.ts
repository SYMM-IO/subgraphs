import { LiquidatePositionsPartyAHandler as CommonLiquidatePositionsPartyAHandler } from "../../../common/handlers/symmio/LiquidatePositionsPartyAHandler"
import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { handleLiquidatePosition } from "../commonHandlers/liquidatePositions"
import { Account, LiquidationDetail, Quote } from "../../../../generated/schema"
import { unDecimal } from "../../utils/common"
import { getLiquidationStateData } from "../../../common/VersionedQuoteLoader"
import { LiquidatePositionsPartyA as LiquidatePositionsPartyA_0_8_3 } from "../../../../generated/symmio_0_8_3/symmio_0_8_3"
import { LiquidatePositionsPartyA as LiquidatePositionsPartyA_0_8_4 } from "../../../../generated/symmio_0_8_4/symmio_0_8_4"
import { LiquidatePositionsPartyA as LiquidatePositionsPartyA_0_8_5 } from "../../../../generated/symmio_0_8_5/symmio_0_8_5"
import { updatePartyALatestBalance, updatePartyBLatestBalance } from "../../utils/latestAccountBalance"
import { captureQuoteFundingContext, FundingSettlementContext, getQuoteFundingSignedAmount } from "../../utils/fundingHistory"

export class LiquidatePositionsPartyAHandler<T> extends CommonLiquidatePositionsPartyAHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		super.handleSymbol(_event, version)
		super.handleAccount(_event, version)

		let fundingContexts: Array<FundingSettlementContext> = []
		for (let i = 0, lenQ = event.params.quoteIds.length; i < lenQ; i++) {
			fundingContexts.push(captureQuoteFundingContext(_event, event.params.quoteIds[i]))
		}
		super.handleQuote(_event, version) // Pre-computes liquidateAmount/liquidatePrice on each quote

		for (let i = 0, lenQ = event.params.quoteIds.length; i < lenQ; i++) {
			handleLiquidatePosition<T>(_event, version, event.params.quoteIds[i], "LIQUIDATE_PARTY_A", fundingContexts[i])
		}

		updatePartyALatestBalance(_event, version, event.params.partyA)
		let seenPartyBs: Array<string> = []
		for (let i = 0, lenQ = event.params.quoteIds.length; i < lenQ; i++) {
			let quote = Quote.load(event.params.quoteIds[i].toString() + "-" + event.address.toHexString())
			if (!quote || !quote.partyB) continue
			let partyBHex = quote.partyB!.toHexString()
			if (seenPartyBs.includes(partyBHex)) continue
			seenPartyBs.push(partyBHex)
			updatePartyBLatestBalance(_event, version, changetype<Address>(quote.partyB!), event.params.partyA)
		}

		// Accumulate paidCva, paidLf, totalPnl on LiquidationDetail
		if (version < Version.v_0_8_1) return

		let liqState = getLiquidationStateData(version, event.address, event.params.partyA)
		if (!liqState) return

		let liquidationId: Bytes = liqState.liquidationId
		if (version == Version.v_0_8_5) {
			// @ts-ignore
			let e = changetype<LiquidatePositionsPartyA_0_8_5>(event)
			liquidationId = e.params.liquidationId
		} else if (version == Version.v_0_8_4) {
			// @ts-ignore
			let e = changetype<LiquidatePositionsPartyA_0_8_4>(event)
			liquidationId = e.params.liquidationId
		} else if (version == Version.v_0_8_3) {
			// @ts-ignore
			let e = changetype<LiquidatePositionsPartyA_0_8_3>(event)
			liquidationId = e.params.liquidationId
		}

		let entityId = event.params.partyA.toHexString() + "-" + liquidationId.toHexString() + "-" + event.address.toHexString()
		let entity = LiquidationDetail.load(entityId)
		if (!entity) return

		if (!entity.affiliate) {
			let partyAAccount = Account.load(event.params.partyA.toHexString())
			if (partyAAccount) {
				entity.affiliate = partyAAccount.accountSource
			}
		}

		let accCva = entity.paidCva ? entity.paidCva! : BigInt.zero()
		let accLf = entity.paidLf ? entity.paidLf! : BigInt.zero()
		let accPnl = entity.totalPnl ? entity.totalPnl! : BigInt.zero()

		for (let i = 0, lenQ = event.params.quoteIds.length; i < lenQ; i++) {
			let quote = Quote.load(event.params.quoteIds[i].toString() + "-" + event.address.toHexString())
			if (!quote) continue
			if (!quote.liquidateAmount || !quote.liquidatePrice || !quote.openedPrice) continue

			accCva = accCva.plus(quote.cva ? quote.cva! : BigInt.zero())
			accLf = accLf.plus(quote.lf ? quote.lf! : BigInt.zero())

			let pnl = unDecimal(
				(quote.positionType == 0 ? BigInt.fromString("1") : BigInt.fromString("1").neg())
					.times(quote.liquidatePrice!.minus(quote.openedPrice!))
					.times(quote.liquidateAmount!),
			)
			let fundingAmount = getQuoteFundingSignedAmount(quote, fundingContexts[i])
			accPnl = accPnl.plus(pnl.minus(fundingAmount))
		}

		entity.paidCva = accCva
		entity.paidLf = accLf
		entity.totalPnl = accPnl
		entity.save()
	}
}
