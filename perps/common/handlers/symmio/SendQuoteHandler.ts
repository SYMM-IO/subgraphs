import { Account, Quote } from "../../../../generated/schema"
import { BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts"
import { BaseHandler, Version } from "../../BaseHandler"
import { getQuoteData, getSymbolName } from "../../VersionedQuoteLoader"
import { setEventTimestampAndTransactionHashAndAction } from "../../utils/quote"
import { ZERO_ADDRESS_BYTES } from "../../../analytics/utils/constants"
import { AccountType, createNewAccountIfNotExists } from "../../utils/builders"

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
		let partyAmm: BigInt = BigInt.zero()
		let partyBmm: BigInt = BigInt.zero()
		let tradingFee: BigInt = BigInt.zero()

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
			partyAmm = tuple[8].toBigInt()
			partyBmm = tuple[9].toBigInt()
			tradingFee = tuple[10].toBigInt()
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
				let mm = _event.parameters[10].value.toBigInt()
				partyAmm = mm
				partyBmm = mm
				lf = _event.parameters[11].value.toBigInt()
				deadline = _event.parameters[13].value.toBigInt()
			} else {
				// v0.8.1+: lf(10), partyAmm(11), partyBmm(12), tradingFee(13), deadline(14)
				lf = _event.parameters[10].value.toBigInt()
				partyAmm = _event.parameters[11].value.toBigInt()
				partyBmm = _event.parameters[12].value.toBigInt()
				tradingFee = _event.parameters[13].value.toBigInt()
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
		quote.partyAmm = partyAmm
		quote.partyBmm = partyBmm
		quote.initialPartyAmm = partyAmm
		quote.initialPartyBmm = partyBmm
		quote.tradingFee = tradingFee
		quote.openDeadline = deadline
		quote.quoteStatus = 0
		quote.marketPrice = marketPrice
		quote.averageClosedPrice = BigInt.fromI32(0)
		quote.closedAmount = BigInt.fromI32(0)
		quote.quantityToClose = BigInt.zero()
		quote.closePrice = BigInt.zero()
		quote.userPaidFunding = BigInt.fromI32(0)
		quote.userReceivedFunding = BigInt.fromI32(0)
		quote.blockNumber = event.block.number
		quote.initialCva = cva
		quote.initialLf = lf

		// Use VersionedQuoteLoader for chain state (maxFundingRate, affiliate, symbolName)
		const q = getQuoteData(version, event.address, event.params.quoteId)
		if (q) {
			quote.maxFundingRate = q.maxFundingRate
		}

		let account = Account.load(event.params.partyA.toHexString())
		if (!account) {
			account = createNewAccountIfNotExists(
				event.params.partyA,
				event.params.partyA,
				null,
				AccountType.UNKNOWN,
				event.block,
				event.transaction,
			)
			account.source = event.address
		}
		if (version >= Version.v_0_8_3 && q) {
			account.accountSource = account.accountSource === null ? q.affiliate : account.accountSource
		}
		account.save()

		if (account.subAccount) {
			quote.subAccount = account.subAccount
		}

		if (event.params.partyBsWhiteList) {
			let partyBsWhiteList: Bytes[] = []
			for (let i = 0, len = event.params.partyBsWhiteList.length; i < len; i++) {
				partyBsWhiteList.push(event.params.partyBsWhiteList[i])
			}
			quote.partyBsWhiteList = partyBsWhiteList
		}

		quote.symbol = getSymbolName(version, symbolId, event.address)
		quote.affiliate = account.accountSource === null ? ZERO_ADDRESS_BYTES : account.accountSource
		quote.timestampSendQuote = event.block.timestamp
		quote.timestamp = event.block.timestamp
		quote.save()
		setEventTimestampAndTransactionHashAndAction(quote, "SendQuote", event)
	}
}
