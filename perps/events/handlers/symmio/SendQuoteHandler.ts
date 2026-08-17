import { SendQuote as SendQuoteEntity } from "../../../../generated/schema"
import { BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { getGlobalCounterAndInc } from "../../../common/utils"
import { SendQuote as SendQuote_8_0 } from "../../../../generated/symmio_0_8_0/symmio_0_8_0"
import { SendQuote as SendQuote_8_1 } from "../../../../generated/symmio_0_8_1/symmio_0_8_1"
import { SendQuote as SendQuote_8_2 } from "../../../../generated/symmio_0_8_2/symmio_0_8_2"
import { SendQuote as SendQuote_8_3 } from "../../../../generated/symmio_0_8_3/symmio_0_8_3"
import { SendQuote as SendQuote_8_4 } from "../../../../generated/symmio_0_8_4/symmio_0_8_4"
import { findAccountSourceForQuoteForAccount, findAccountSourceForQuote } from "../../utils/account_utils"

export class SendQuoteHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new SendQuoteEntity(event.params.quoteId.toString() + "-" + event.address.toHexString())
		entity.counterId = getGlobalCounterAndInc()
		entity.source = event.address
		entity.partyA = event.params.partyA
		entity.quoteId = event.params.quoteId
		entity.accountSource = findAccountSourceForQuoteForAccount(event.params.partyA)
		entity.transactionIndex = event.transaction.index
		entity.logIndex = event.logIndex
		entity.blockHash = event.block.hash

		// New v0.8.5 variant has 6 params with packed paramsData
		if (_event.parameters.length <= 6) {
			// New SendQuote variant: (partyA, quoteId, partyBsWhiteList, affiliate, paramsData, data)
			if (event.params.partyBsWhiteList) {
				let partyBsWhiteList: Bytes[] = []
				for (let i = 0, len = event.params.partyBsWhiteList.length; i < len; i++) {
					partyBsWhiteList.push(event.params.partyBsWhiteList[i])
				}
				entity.partyBsWhiteList = partyBsWhiteList
			}

			entity.affiliate = _event.parameters[3].value.toAddress()
			entity.data = _event.parameters[5].value.toBytes()

			// Decode paramsData: (uint256,uint8,uint8,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256)
			let paramsData = _event.parameters[4].value.toBytes()
			let decoded = ethereum.decode("(uint256,uint8,uint8,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256)", paramsData)
			if (decoded) {
				let tuple = decoded.toTuple()
				entity.symbolId = tuple[0].toBigInt()
				entity.positionType = tuple[1].toI32()
				entity.orderType = tuple[2].toI32()
				entity.price = tuple[3].toBigInt()
				entity.marketPrice = tuple[4].toBigInt()
				entity.quantity = tuple[5].toBigInt()
				entity.cva = tuple[6].toBigInt()
				entity.lf = tuple[7].toBigInt()
				entity.partyAmm = tuple[8].toBigInt()
				entity.partyBmm = tuple[9].toBigInt()
				entity.tradingFee = tuple[10].toBigInt()
				entity.deadline = tuple[11].toBigInt()
			}
		} else {
			// Old SendQuote variant: use raw parameter access for type safety
			let addrs = _event.parameters[2].value.toAddressArray()
			let partyBsWhiteList: Bytes[] = []
			for (let i = 0; i < addrs.length; i++) {
				partyBsWhiteList.push(addrs[i])
			}
			entity.partyBsWhiteList = partyBsWhiteList
			entity.symbolId = _event.parameters[3].value.toBigInt()
			entity.positionType = _event.parameters[4].value.toI32()
			entity.orderType = _event.parameters[5].value.toI32()
			entity.price = _event.parameters[6].value.toBigInt()
			entity.marketPrice = _event.parameters[7].value.toBigInt()
			entity.quantity = _event.parameters[8].value.toBigInt()
			entity.cva = _event.parameters[9].value.toBigInt()

			switch (version) {
				case Version.v_0_8_0: {
					// v_0_8_0 layout: cva(9), mm(10), lf(11), maxInterestRate(12), deadline(13)
					entity.lf = _event.parameters[11].value.toBigInt()
					entity.partyAmm = _event.parameters[10].value.toBigInt()
					entity.partyBmm = _event.parameters[10].value.toBigInt()
					entity.maxInterestRate = _event.parameters[12].value.toBigInt()
					entity.tradingFee = BigInt.zero()
					entity.deadline = _event.parameters[13].value.toBigInt()
					entity.quoteStatus = _event.parameters[14].value.toI32()
					break
				}
				default: {
					// v_0_8_1+ layout: cva(9), lf(10), partyAmm(11), partyBmm(12), tradingFee(13), deadline(14)
					entity.lf = _event.parameters[10].value.toBigInt()
					entity.partyAmm = _event.parameters[11].value.toBigInt()
					entity.partyBmm = _event.parameters[12].value.toBigInt()
					entity.tradingFee = _event.parameters[13].value.toBigInt()
					entity.deadline = _event.parameters[14].value.toBigInt()
					break
				}
			}
		}

		entity.blockTimestamp = event.block.timestamp
		entity.blockNumber = event.block.number
		entity.transactionHash = event.transaction.hash
		entity.save()
	}
}
