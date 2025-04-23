import {
	AcceptCancelRequest as AcceptCancelRequestEntity,
	LockQuote as LockQuoteEntity,
	RequestToCancelQuote as RequestToCancelQuoteEntity,
	SendQuote as SendQuoteEntity,
} from "../../../../generated/schema"
import { BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { getGlobalCounterAndInc } from "../../../common/utils"
import { findAccountSourceForQuote } from "../../utils/account_utils"
import { getQuote as getQuote_0_8_4 } from "../../../common/contract_utils_0_8_4"
import { getQuote as getQuote_0_8_0 } from "../../../common/contract_utils_0_8_0"
import { getQuote as getQuote_0_8_1 } from "../../../common/contract_utils_0_8_1"
import { getQuote as getQuote_0_8_2 } from "../../../common/contract_utils_0_8_2"
import { getQuote as getQuote_0_8_3 } from "../../../common/contract_utils_0_8_3"

export class AcceptCancelRequestHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		if (SendQuoteEntity.load(event.params.quoteId.toString()) == null) {
			let send_quote_entity = new SendQuoteEntity(event.params.quoteId.toString())
			let lock_quote_entity = new LockQuoteEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
			let request_to_cancel_quote_entity = new RequestToCancelQuoteEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
			switch (version) {
				case Version.v_0_8_0: {
					const q = getQuote_0_8_0(event.address, event.params.quoteId)!
					send_quote_entity.orderType = q.orderType
					send_quote_entity.partyA = q.partyA
					send_quote_entity.symbolId = q.symbolId
					send_quote_entity.tradingFee = BigInt.zero()
					send_quote_entity.positionType = q.positionType
					send_quote_entity.quantity = q.quantity
					send_quote_entity.cva = q.lockedValues.cva
					send_quote_entity.lf = q.lockedValues.lf
					send_quote_entity.partyAmm = q.lockedValues.mm
					send_quote_entity.partyBmm = q.lockedValues.mm
					send_quote_entity.deadline = q.deadline
					send_quote_entity.marketPrice = q.marketPrice
					send_quote_entity.price = q.requestedOpenPrice
					if (q.partyBsWhiteList) {
						let partyBsWhiteList: Bytes[] = []
						for (let i = 0, len = q.partyBsWhiteList.length; i < len; i++) {
							partyBsWhiteList.push(q.partyBsWhiteList[i])
						}
						send_quote_entity.partyBsWhiteList = partyBsWhiteList
					}
					lock_quote_entity.partyB = q.partyB
					request_to_cancel_quote_entity.partyA = q.partyA
					request_to_cancel_quote_entity.partyB = q.partyB
					request_to_cancel_quote_entity.quoteStatus = q.quoteStatus
					break
				}
				case Version.v_0_8_1: {
					const q = getQuote_0_8_1(event.address, event.params.quoteId)!
					send_quote_entity.orderType = q.orderType
					send_quote_entity.partyA = q.partyA
					send_quote_entity.symbolId = q.symbolId
					send_quote_entity.tradingFee = q.tradingFee
					send_quote_entity.positionType = q.positionType
					send_quote_entity.quantity = q.quantity
					send_quote_entity.cva = q.lockedValues.cva
					send_quote_entity.lf = q.lockedValues.lf
					send_quote_entity.partyAmm = q.lockedValues.partyAmm
					send_quote_entity.partyBmm = q.lockedValues.partyBmm
					send_quote_entity.deadline = q.deadline
					send_quote_entity.marketPrice = q.marketPrice
					send_quote_entity.price = q.requestedOpenPrice
					if (q.partyBsWhiteList) {
						let partyBsWhiteList: Bytes[] = []
						for (let i = 0, len = q.partyBsWhiteList.length; i < len; i++) {
							partyBsWhiteList.push(q.partyBsWhiteList[i])
						}
						send_quote_entity.partyBsWhiteList = partyBsWhiteList
					}
					lock_quote_entity.partyB = q.partyB
					request_to_cancel_quote_entity.partyA = q.partyA
					request_to_cancel_quote_entity.partyB = q.partyB
					request_to_cancel_quote_entity.quoteStatus = q.quoteStatus
					break
				}
				case Version.v_0_8_2: {
					const q = getQuote_0_8_2(event.address, event.params.quoteId)!
					send_quote_entity.orderType = q.orderType
					send_quote_entity.partyA = q.partyA
					send_quote_entity.symbolId = q.symbolId
					send_quote_entity.tradingFee = q.tradingFee
					send_quote_entity.positionType = q.positionType
					send_quote_entity.quantity = q.quantity
					send_quote_entity.cva = q.lockedValues.cva
					send_quote_entity.lf = q.lockedValues.lf
					send_quote_entity.partyAmm = q.lockedValues.partyAmm
					send_quote_entity.partyBmm = q.lockedValues.partyBmm
					send_quote_entity.deadline = q.deadline
					send_quote_entity.marketPrice = q.marketPrice
					send_quote_entity.price = q.requestedOpenPrice
					if (q.partyBsWhiteList) {
						let partyBsWhiteList: Bytes[] = []
						for (let i = 0, len = q.partyBsWhiteList.length; i < len; i++) {
							partyBsWhiteList.push(q.partyBsWhiteList[i])
						}
						send_quote_entity.partyBsWhiteList = partyBsWhiteList
					}
					lock_quote_entity.partyB = q.partyB
					request_to_cancel_quote_entity.partyA = q.partyA
					request_to_cancel_quote_entity.partyB = q.partyB
					request_to_cancel_quote_entity.quoteStatus = q.quoteStatus
					break
				}
				case Version.v_0_8_3: {
					const q = getQuote_0_8_3(event.address, event.params.quoteId)!
					send_quote_entity.orderType = q.orderType
					send_quote_entity.partyA = q.partyA
					send_quote_entity.symbolId = q.symbolId
					send_quote_entity.tradingFee = q.tradingFee
					send_quote_entity.positionType = q.positionType
					send_quote_entity.quantity = q.quantity
					send_quote_entity.cva = q.lockedValues.cva
					send_quote_entity.lf = q.lockedValues.lf
					send_quote_entity.partyAmm = q.lockedValues.partyAmm
					send_quote_entity.partyBmm = q.lockedValues.partyBmm
					send_quote_entity.deadline = q.deadline
					send_quote_entity.marketPrice = q.marketPrice
					send_quote_entity.price = q.requestedOpenPrice
					if (q.partyBsWhiteList) {
						let partyBsWhiteList: Bytes[] = []
						for (let i = 0, len = q.partyBsWhiteList.length; i < len; i++) {
							partyBsWhiteList.push(q.partyBsWhiteList[i])
						}
						send_quote_entity.partyBsWhiteList = partyBsWhiteList
					}
					lock_quote_entity.partyB = q.partyB
					request_to_cancel_quote_entity.partyA = q.partyA
					request_to_cancel_quote_entity.partyB = q.partyB
					request_to_cancel_quote_entity.quoteStatus = q.quoteStatus
					break
				}
				case Version.v_0_8_4: {
					const q = getQuote_0_8_4(event.address, event.params.quoteId)!
					send_quote_entity.orderType = q.orderType
					send_quote_entity.partyA = q.partyA
					send_quote_entity.symbolId = q.symbolId
					send_quote_entity.tradingFee = q.tradingFee
					send_quote_entity.positionType = q.positionType
					send_quote_entity.quantity = q.quantity
					send_quote_entity.cva = q.lockedValues.cva
					send_quote_entity.lf = q.lockedValues.lf
					send_quote_entity.partyAmm = q.lockedValues.partyAmm
					send_quote_entity.partyBmm = q.lockedValues.partyBmm
					send_quote_entity.deadline = q.deadline
					send_quote_entity.marketPrice = q.marketPrice
					send_quote_entity.price = q.requestedOpenPrice
					if (q.partyBsWhiteList) {
						let partyBsWhiteList: Bytes[] = []
						for (let i = 0, len = q.partyBsWhiteList.length; i < len; i++) {
							partyBsWhiteList.push(q.partyBsWhiteList[i])
						}
						send_quote_entity.partyBsWhiteList = partyBsWhiteList
					}
					lock_quote_entity.partyB = q.partyB
					request_to_cancel_quote_entity.partyA = q.partyA
					request_to_cancel_quote_entity.partyB = q.partyB
					request_to_cancel_quote_entity.quoteStatus = q.quoteStatus
					break
				}
			}

			send_quote_entity.counterId = getGlobalCounterAndInc()
			send_quote_entity.quoteId = event.params.quoteId
			send_quote_entity.accountSource = findAccountSourceForQuote(event.params.quoteId)
			send_quote_entity.blockTimestamp = event.block.timestamp
			send_quote_entity.blockNumber = event.block.number
			send_quote_entity.transactionHash = event.transaction.hash
			send_quote_entity.transactionIndex = event.transaction.index
			send_quote_entity.logIndex = event.logIndex
			send_quote_entity.blockHash = event.block.hash
			send_quote_entity.save()

			lock_quote_entity.counterId = getGlobalCounterAndInc()
			lock_quote_entity.quoteId = event.params.quoteId
			lock_quote_entity.accountSource = findAccountSourceForQuote(event.params.quoteId)
			lock_quote_entity.blockTimestamp = event.block.timestamp
			lock_quote_entity.blockNumber = event.block.number
			lock_quote_entity.transactionHash = event.transaction.hash
			lock_quote_entity.transactionIndex = event.transaction.index
			lock_quote_entity.logIndex = event.logIndex
			lock_quote_entity.blockHash = event.block.hash
			lock_quote_entity.save()

			request_to_cancel_quote_entity.counterId = getGlobalCounterAndInc()
			request_to_cancel_quote_entity.quoteId = event.params.quoteId
			request_to_cancel_quote_entity.accountSource = findAccountSourceForQuote(event.params.quoteId)
			request_to_cancel_quote_entity.blockTimestamp = event.block.timestamp
			request_to_cancel_quote_entity.blockNumber = event.block.number
			request_to_cancel_quote_entity.transactionHash = event.transaction.hash
			request_to_cancel_quote_entity.transactionIndex = event.transaction.index
			request_to_cancel_quote_entity.logIndex = event.logIndex
			request_to_cancel_quote_entity.blockHash = event.block.hash
			request_to_cancel_quote_entity.save()
		}

		let entity = new AcceptCancelRequestEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.counterId = getGlobalCounterAndInc()
		entity.quoteId = event.params.quoteId
		entity.accountSource = findAccountSourceForQuote(event.params.quoteId)
		entity.quoteStatus = event.params.quoteStatus

		entity.blockTimestamp = event.block.timestamp
		entity.blockNumber = event.block.number
		entity.transactionHash = event.transaction.hash
		entity.transactionIndex = event.transaction.index
		entity.logIndex = event.logIndex
		entity.blockHash = event.block.hash
		entity.save()
	}
}
