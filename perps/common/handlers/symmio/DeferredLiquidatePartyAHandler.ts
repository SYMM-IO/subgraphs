import { BaseHandler, Version } from "../../BaseHandler";
import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import { Account, LiquidationDetail } from "../../../../generated/schema";

export class DeferredLiquidatePartyAHandler<T> extends BaseHandler {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let entity = new LiquidationDetail(event.params.partyA.toHexString() + "-" + event.params.liquidationId.toHexString() + "-" + event.address.toHexString())
		entity.source = event.address
		entity.partyA = event.params.partyA
		entity.liquidationId = event.params.liquidationId
		entity.liquidationType = 0
		entity.upnl = event.params.upnl
		entity.totalUnrealizedLoss = event.params.totalUnrealizedLoss
		entity.deficit = BigInt.zero()
		entity.liquidationFee = BigInt.zero()
		entity.timestamp = _event.block.timestamp
		entity.involvedPartyBCounts = BigInt.zero()
		entity.partyAAccumulatedUpnl = BigInt.zero()
		entity.disputed = false
		entity.liquidationTimestamp = event.params.liquidationTimestamp
		entity.liquidator = event.params.liquidator
		entity.allocatedBalance = event.params.allocatedBalance
		entity.settled = false
		entity.fullyLiquidated = false
		entity.totalPnl = BigInt.zero()
		entity.paidCva = BigInt.zero()
		entity.paidLf = BigInt.zero()
		let partyAAccount = Account.load(event.params.partyA.toHexString())
		if (partyAAccount) {
			entity.affiliate = partyAAccount.accountSource
		}
		entity.save()
	}
}