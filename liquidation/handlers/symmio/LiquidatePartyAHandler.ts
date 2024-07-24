import {
	LiquidatePartyAHandler as CommonLiquidatePartyAHandler
} from "../../../common/handlers/symmio/LiquidatePartyAHandler"
import { PartyA } from "../../../generated/schema"
import { BigInt, ethereum, log } from "@graphprotocol/graph-ts";
import { Version } from "../../../common/BaseHandler";
import { getBalanceInfoOfPartyA as getBalanceInfoOfPartyA_0_8_2 } from "../../../common/contract_utils_0_8_2";
import { getBalanceInfoOfPartyA as getBalanceInfoOfPartyA_0_8_1 } from "../../../common/contract_utils_0_8_1";
import { getBalanceInfoOfPartyA as getBalanceInfoOfPartyA_0_8_0 } from "../../../common/contract_utils_0_8_0";
import { LiquidatePartyA } from "../../../generated/symmio_0_8_2/symmio_0_8_2";
import { addLiquidator } from "./utils";

export class LiquidatePartyAHandler<T> extends CommonLiquidatePartyAHandler<T> {

	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		super.handleGlobalCounter()
		let entity = PartyA.load(event.params.partyA.toHex())!
		switch (version) {
			case Version.v_0_8_2: {
				// @ts-ignore
				const e = changetype<LiquidatePartyA>(_event)
				const balanceInfoOfPartyA = getBalanceInfoOfPartyA_0_8_2(event.address, event.params.partyA)
				if (!balanceInfoOfPartyA) {
					log.error('getBalanceInfoOfPartyA_0_8_2 crashed!', [])
					return
				}
				entity.liquidateAllocatedBalance = balanceInfoOfPartyA.value0
				entity.liquidateCva = balanceInfoOfPartyA.value1
				entity.liquidateLf = balanceInfoOfPartyA.value2
				entity.liquidatePendingCva = balanceInfoOfPartyA.value5
				entity.liquidatePendingLf = balanceInfoOfPartyA.value6

				entity.totalUnrealizedLoss = e.params.totalUnrealizedLoss
				entity.upnl = e.params.upnl
				entity.allocatedBalance = e.params.allocatedBalance
				addLiquidator(e)
				break
				break
			}
			case Version.v_0_8_1: {
				// @ts-ignore
				const e = changetype<LiquidatePartyA>(_event)
				const balanceInfoOfPartyA = getBalanceInfoOfPartyA_0_8_1(event.address, event.params.partyA)
				if (!balanceInfoOfPartyA) {
					log.error('getBalanceInfoOfPartyA_0_8_1 crashed!', [])
					return
				}
				entity.liquidateAllocatedBalance = balanceInfoOfPartyA.value0
				entity.liquidateCva = balanceInfoOfPartyA.value1
				entity.liquidateLf = balanceInfoOfPartyA.value2
				entity.liquidatePendingCva = balanceInfoOfPartyA.value5
				entity.liquidatePendingLf = balanceInfoOfPartyA.value6
				addLiquidator(e)
				break
			}
			case Version.v_0_8_0: {
				const balanceInfoOfPartyA = getBalanceInfoOfPartyA_0_8_0(event.address, event.params.partyA)
				if (!balanceInfoOfPartyA) {
					log.error('getBalanceInfoOfPartyA_0_8_0 crashed!', [])
					return
				}
				entity.liquidateAllocatedBalance = balanceInfoOfPartyA.value0
				entity.liquidateCva = balanceInfoOfPartyA.value1
				entity.liquidateLf = balanceInfoOfPartyA.value2
				entity.liquidatePendingCva = balanceInfoOfPartyA.value5
				entity.liquidatePendingLf = balanceInfoOfPartyA.value6
				entity.totalUnrealizedLoss = BigInt.zero() //FIXME adapt
				entity.upnl = BigInt.zero() //FIXME adapt
				entity.allocatedBalance = BigInt.zero() //FIXME adapt
				break
			}
		}
		entity.liquidatePartyATimeStamp = event.block.timestamp
		entity.trHashLiquidate = event.transaction.hash
		entity.timeStamp = event.block.timestamp
		entity.blockNumber = event.block.number
		entity.trHash = event.transaction.hash
		entity.GlobalCounter = super.handleGlobalCounter()
		entity.save()
	}
}
