import {
	LiquidatePartyBHandler as CommonLiquidatePartyBHandler
} from "../../../common/handlers/symmio/LiquidatePartyBHandler"
import {PartyB} from "../../../generated/schema"
import {BigInt, ethereum, log} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";
import {getBalanceInfoOfPartyB as getBalanceInfoOfPartyB_0_8_2} from "../../../common/contract_utils_0_8_2";
import {getBalanceInfoOfPartyB as getBalanceInfoOfPartyB_0_8_0} from "../../../common/contract_utils_0_8_0";
import {LiquidatePartyB} from "../../../generated/symmio_0_8_2/symmio_0_8_2";
import {LiquidatePartyB as LiquidatePartyB_0_8_1} from "../../../generated/symmio_0_8_1/symmio_0_8_1";

export class LiquidatePartyBHandler<T> extends CommonLiquidatePartyBHandler<T> {

	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		super.handleGlobalCounter()
		let entity = PartyB.load(event.params.partyA.toHex() + '-' + event.params.partyB.toHex())!

		switch (version) {
			case Version.v_0_8_2: {
				// @ts-ignore
				const e = changetype<LiquidatePartyB>(_event)
				const balanceInfoOfPartyB = getBalanceInfoOfPartyB_0_8_2(event.address, event.params.partyA, event.params.partyB)
				if (!balanceInfoOfPartyB) {
					log.error('getBalanceInfoOfPartyB_0_8_2 crashed!', [])
					return
				}
				entity.liquidateAllocatedBalance = balanceInfoOfPartyB.value0
				entity.liquidateCva = balanceInfoOfPartyB.value1
				entity.liquidateLf = balanceInfoOfPartyB.value2
				entity.liquidatePendingCva = balanceInfoOfPartyB.value5
				entity.liquidatePendingLf = balanceInfoOfPartyB.value6
				entity.partyBAllocatedBalance = e.params.partyBAllocatedBalance
				entity.upnl = e.params.upnl
				break
			}
			case Version.v_0_8_1: {
				//@ts-ignore
				const e = changetype<LiquidatePartyB_0_8_1>(_event)
				const balanceInfoOfPartyB = getBalanceInfoOfPartyB_0_8_2(event.address, event.params.partyA, event.params.partyB)
				if (!balanceInfoOfPartyB) {
					log.error('getBalanceInfoOfPartyB_0_8_2 crashed!', [])
					return
				}
				entity.liquidateAllocatedBalance = balanceInfoOfPartyB.value0
				entity.liquidateCva = balanceInfoOfPartyB.value1
				entity.liquidateLf = balanceInfoOfPartyB.value2
				entity.liquidatePendingCva = balanceInfoOfPartyB.value5
				entity.liquidatePendingLf = balanceInfoOfPartyB.value6
				break
			}
			case Version.v_0_8_0: {
				const balanceInfoOfPartyB = getBalanceInfoOfPartyB_0_8_0(event.address, event.params.partyA, event.params.partyB)
				if (!balanceInfoOfPartyB) {
					log.error('getBalanceInfoOfPartyB_0_8_0 crashed!', [])
					return
				}
				entity.liquidateAllocatedBalance = balanceInfoOfPartyB.value0
				entity.liquidateCva = balanceInfoOfPartyB.value1
				entity.liquidateLf = balanceInfoOfPartyB.value2
				entity.liquidatePendingCva = balanceInfoOfPartyB.value5
				entity.liquidatePendingLf = balanceInfoOfPartyB.value6
				entity.partyBAllocatedBalance = BigInt.zero() //FIXME adapt
				entity.upnl = BigInt.zero() //FIXME adapt
				break
			}
		}

		entity.liquidatePartyBTimeStamp = event.block.timestamp
		entity.trHashLiquidate = event.transaction.hash
		entity.timeStamp = event.block.timestamp
		entity.blockNumber = event.block.number
		entity.GlobalCounter = super.handleGlobalCounter()
		entity.save()
	}
}
