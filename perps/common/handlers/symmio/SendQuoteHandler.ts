import { Account, Quote } from "../../../../generated/schema"
import { BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts"
import { SendQuote as SendQuote_0_8_0 } from "../../../../generated/symmio_0_8_0/symmio_0_8_0"
import { SendQuote as SendQuote_0_8_1 } from "../../../../generated/symmio_0_8_1/symmio_0_8_1"
import { SendQuote as SendQuote_0_8_2 } from "../../../../generated/symmio_0_8_2/symmio_0_8_2"
import { SendQuote as SendQuote_0_8_3 } from "../../../../generated/symmio_0_8_3/symmio_0_8_3"
import { SendQuote as SendQuote_0_8_4 } from "../../../../generated/symmio_0_8_4/symmio_0_8_4"
import { SendQuote as SendQuote_0_8_5 } from "../../../../generated/symmio_0_8_5/symmio_0_8_5"
import { BaseHandler, Version } from "../../BaseHandler"

import { getQuote as getQuote_0_8_0, symbolIdToSymbolName as symbolIdToSymbolName_0_8_0 } from "../../contract_utils_0_8_0"
import { getQuote as getQuote_0_8_1, symbolIdToSymbolName as symbolIdToSymbolName_0_8_1 } from "../../contract_utils_0_8_1"
import { getQuote as getQuote_0_8_2, symbolIdToSymbolName as symbolIdToSymbolName_0_8_2 } from "../../contract_utils_0_8_2"
import { getQuote as getQuote_0_8_3, symbolIdToSymbolName as symbolIdToSymbolName_0_8_3 } from "../../contract_utils_0_8_3"
import { getQuote as getQuote_0_8_4, symbolIdToSymbolName as symbolIdToSymbolName_0_8_4 } from "../../contract_utils_0_8_4"
import { getQuote as getQuote_0_8_5, symbolIdToSymbolName as symbolIdToSymbolName_0_8_5 } from "../../contract_utils_0_8_5"

import { setEventTimestampAndTransactionHashAndAction } from "../../utils/quote"
import { ZERO_ADDRESS_BYTES } from "../../../analytics/utils/constants"

export class SendQuoteHandler<T> extends BaseHandler {
	handleQuote(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		// Extract fields that may be packed in SendQuote1's paramsData.
		// Using raw _event.parameters access avoids compiler errors when T = SendQuote1,
		// since SendQuote1 doesn't have individual params like symbolId, price, etc.
		let symbolId: BigInt
		let positionType: i32
		let orderType: i32
		let price: BigInt
		let marketPrice: BigInt
		let quantity: BigInt
		let cva: BigInt
		let lf: BigInt
		let deadline: BigInt
		let packedPartyAmm: BigInt = BigInt.zero()
		let packedPartyBmm: BigInt = BigInt.zero()
		let packedTradingFee: BigInt = BigInt.zero()

		if (_event.parameters.length <= 6) {
			// New packed variant (SendQuote1): decode paramsData
			let paramsData = _event.parameters[4].value.toBytes()
			let decoded = ethereum.decode(
				"(uint256,uint8,uint8,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256)",
				paramsData,
			)
			if (decoded == null) return
			let tuple = decoded.toTuple()
			symbolId = tuple[0].toBigInt()
			positionType = tuple[1].toI32()
			orderType = tuple[2].toI32()
			price = tuple[3].toBigInt()
			marketPrice = tuple[4].toBigInt()
			quantity = tuple[5].toBigInt()
			cva = tuple[6].toBigInt()
			lf = tuple[7].toBigInt()
			packedPartyAmm = tuple[8].toBigInt()
			packedPartyBmm = tuple[9].toBigInt()
			packedTradingFee = tuple[10].toBigInt()
			deadline = tuple[11].toBigInt()
		} else {
			// Old variant with individual params (indices 3-9 are consistent across all versions)
			symbolId = _event.parameters[3].value.toBigInt()
			positionType = _event.parameters[4].value.toI32()
			orderType = _event.parameters[5].value.toI32()
			price = _event.parameters[6].value.toBigInt()
			marketPrice = _event.parameters[7].value.toBigInt()
			quantity = _event.parameters[8].value.toBigInt()
			cva = _event.parameters[9].value.toBigInt()
			if (version == Version.v_0_8_0) {
				// v0.8.0: mm(10), lf(11), maxInterestRate(12), deadline(13), quoteStatus(14)
				lf = _event.parameters[11].value.toBigInt()
				deadline = _event.parameters[13].value.toBigInt()
			} else {
				// v0.8.1+: lf(10), partyAmm(11), partyBmm(12), tradingFee(13), deadline(14)
				lf = _event.parameters[10].value.toBigInt()
				deadline = _event.parameters[14].value.toBigInt()
			}
		}

		let quote = new Quote(event.params.quoteId.toString() + "-" + event.address.toHexString())
		quote.globalCounter = super.handleGlobalCounter()
		quote.source = event.address
		quote.quoteId = event.params.quoteId
		quote.orderTypeOpen = orderType
		quote.partyA = event.params.partyA
		quote.symbolId = symbolId
		quote.positionType = positionType
		quote.requestedOpenPrice = price
		quote.quantity = quantity
		quote.cva = cva
		quote.lf = lf
		quote.openDeadline = deadline
		quote.quoteStatus = 0
		quote.marketPrice = marketPrice
		quote.averageClosedPrice = BigInt.fromI32(0)
		quote.closedAmount = BigInt.fromI32(0)
		quote.userPaidFunding = BigInt.fromI32(0)
		quote.userReceivedFunding = BigInt.fromI32(0)
		quote.blockNumber = event.block.number

		quote.initialCva = cva
		quote.initialLf = lf

		let symbolName: string
		const account = Account.load(event.params.partyA.toHexString())!
		switch (version) {
			case Version.v_0_8_5: {
				if (_event.parameters.length <= 6) {
					// Packed variant - use pre-decoded values
					quote.partyAmm = packedPartyAmm
					quote.partyBmm = packedPartyBmm
					quote.initialPartyAmm = packedPartyAmm
					quote.initialPartyBmm = packedPartyBmm
					quote.tradingFee = packedTradingFee
				} else {
					// @ts-ignore
					const e = changetype<SendQuote_0_8_5>(_event)
					quote.partyAmm = e.params.partyAmm
					quote.partyBmm = e.params.partyBmm
					quote.initialPartyAmm = e.params.partyAmm
					quote.initialPartyBmm = e.params.partyBmm
					quote.tradingFee = e.params.tradingFee
				}
				const q = getQuote_0_8_5(event.address, event.params.quoteId)!
				quote.maxFundingRate = q.maxFundingRate
				account.accountSource = account.accountSource === null ? q.affiliate : account.accountSource
				symbolName = symbolIdToSymbolName_0_8_5(symbolId, event.address)
				break
			}
			case Version.v_0_8_4: {
				// @ts-ignore
				const e = changetype<SendQuote_0_8_4>(_event)
				quote.partyAmm = e.params.partyAmm
				quote.partyBmm = e.params.partyBmm
				quote.initialPartyAmm = e.params.partyAmm
				quote.initialPartyBmm = e.params.partyBmm
				quote.tradingFee = e.params.tradingFee
				const q = getQuote_0_8_4(event.address, event.params.quoteId)!
				quote.maxFundingRate = q.maxFundingRate
				account.accountSource = account.accountSource === null ? q.affiliate : account.accountSource
				symbolName = symbolIdToSymbolName_0_8_4(symbolId, event.address)
				break
			}
			case Version.v_0_8_3: {
				// @ts-ignore
				const e = changetype<SendQuote_0_8_3>(_event)
				quote.partyAmm = e.params.partyAmm
				quote.partyBmm = e.params.partyBmm
				quote.initialPartyAmm = e.params.partyAmm
				quote.initialPartyBmm = e.params.partyBmm
				quote.tradingFee = e.params.tradingFee
				const q = getQuote_0_8_3(event.address, event.params.quoteId)!
				quote.maxFundingRate = q.maxFundingRate
				account.accountSource = account.accountSource === null ? q.affiliate : account.accountSource
				symbolName = symbolIdToSymbolName_0_8_3(symbolId, event.address)
				break
			}
			case Version.v_0_8_2: {
				// @ts-ignore
				const e = changetype<SendQuote_0_8_2>(_event)
				quote.partyAmm = e.params.partyAmm
				quote.partyBmm = e.params.partyBmm
				quote.initialPartyAmm = e.params.partyAmm
				quote.initialPartyBmm = e.params.partyBmm
				quote.tradingFee = e.params.tradingFee
				const q = getQuote_0_8_2(event.address, event.params.quoteId)!
				quote.maxFundingRate = q.maxFundingRate
				symbolName = symbolIdToSymbolName_0_8_2(symbolId, event.address)
				break
			}
			case Version.v_0_8_1: {
				// @ts-ignore
				const e = changetype<SendQuote_0_8_1>(_event)
				quote.partyAmm = e.params.partyAmm
				quote.partyBmm = e.params.partyBmm
				quote.initialPartyAmm = e.params.partyAmm
				quote.initialPartyBmm = e.params.partyBmm
				quote.tradingFee = e.params.tradingFee
				const q = getQuote_0_8_1(event.address, event.params.quoteId)!
				quote.maxFundingRate = q.maxFundingRate
				symbolName = symbolIdToSymbolName_0_8_1(symbolId, event.address)
				break
			}
			case Version.v_0_8_0: {
				// @ts-ignore
				const e = changetype<SendQuote_0_8_0>(_event)
				quote.partyAmm = e.params.mm
				quote.partyBmm = e.params.mm
				quote.initialPartyAmm = e.params.mm
				quote.initialPartyBmm = e.params.mm
				quote.tradingFee = BigInt.zero() // Not available in event
				const q = getQuote_0_8_0(event.address, event.params.quoteId)!
				quote.maxFundingRate = q.maxInterestRate
				symbolName = symbolIdToSymbolName_0_8_0(symbolId, event.address)
				break
			}
		}

		account.save()

		if (event.params.partyBsWhiteList) {
			let partyBsWhiteList: Bytes[] = []
			for (let i = 0, len = event.params.partyBsWhiteList.length; i < len; i++) {
				partyBsWhiteList.push(event.params.partyBsWhiteList[i])
			}
			quote.partyBsWhiteList = partyBsWhiteList
		}

		quote.symbol = symbolName
		quote.affiliate = account.accountSource === null ? ZERO_ADDRESS_BYTES : account.accountSource
		quote.timestamp = event.block.timestamp
		quote.save()
		setEventTimestampAndTransactionHashAndAction(quote, "SendQuote", event)
	}
}
