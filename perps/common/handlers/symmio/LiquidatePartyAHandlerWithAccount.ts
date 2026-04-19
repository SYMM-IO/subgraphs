import { BaseHandler, Version } from "../../BaseHandler"
import { BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts"
import { AccountType, createNewAccountIfNotExists } from "../../utils/builders"
import { Account, LiquidationDetail } from "../../../../generated/schema"
import { getLiquidationStateData } from "../../VersionedQuoteLoader"
import { LiquidatePartyA as LiquidatePartyA_0_8_2 } from "../../../../generated/symmio_0_8_2/symmio_0_8_2"
import { LiquidatePartyA as LiquidatePartyA_0_8_3 } from "../../../../generated/symmio_0_8_3/symmio_0_8_3"
import { LiquidatePartyA as LiquidatePartyA_0_8_4 } from "../../../../generated/symmio_0_8_4/symmio_0_8_4"
import { LiquidatePartyA as LiquidatePartyA_0_8_5 } from "../../../../generated/symmio_0_8_5/symmio_0_8_5"

export class LiquidatePartyAHandlerWithAccount<T> extends BaseHandler {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let liquidationId: Bytes
		let timestamp: BigInt
		let liquidationTimestamp: BigInt
		let upnl: BigInt
		let totalUnrealizedLoss: BigInt

		if (version >= Version.v_0_8_3) {
			// v0.8.3+ has liquidationId, upnl, totalUnrealizedLoss on event
			if (version == Version.v_0_8_5) {
				// @ts-ignore
				const event_ = changetype<LiquidatePartyA_0_8_5>(_event)
				liquidationId = event_.params.liquidationId
				upnl = event_.params.upnl
				totalUnrealizedLoss = event_.params.totalUnrealizedLoss
			} else if (version == Version.v_0_8_4) {
				// @ts-ignore
				const event_ = changetype<LiquidatePartyA_0_8_4>(_event)
				liquidationId = event_.params.liquidationId
				upnl = event_.params.upnl
				totalUnrealizedLoss = event_.params.totalUnrealizedLoss
			} else {
				// @ts-ignore
				const event_ = changetype<LiquidatePartyA_0_8_3>(_event)
				liquidationId = event_.params.liquidationId
				upnl = event_.params.upnl
				totalUnrealizedLoss = event_.params.totalUnrealizedLoss
			}
			const liqState = getLiquidationStateData(version, event.address, event.params.partyA)
			if (!liqState) return
			timestamp = liqState.timestamp
			liquidationTimestamp = liqState.liquidationTimestamp
		} else if (version == Version.v_0_8_2) {
			// @ts-ignore
			const event_ = changetype<LiquidatePartyA_0_8_2>(_event)
			upnl = event_.params.upnl
			totalUnrealizedLoss = event_.params.totalUnrealizedLoss
			const liqState = getLiquidationStateData(version, event.address, event.params.partyA)
			if (!liqState) return
			liquidationId = liqState.liquidationId
			timestamp = liqState.timestamp
			liquidationTimestamp = liqState.timestamp
		} else {
			// v0.8.1: all from struct
			const liqState = getLiquidationStateData(version, event.address, event.params.partyA)
			if (!liqState) return
			liquidationId = liqState.liquidationId
			timestamp = liqState.timestamp
			liquidationTimestamp = liqState.timestamp
			upnl = liqState.upnl
			totalUnrealizedLoss = liqState.totalUnrealizedLoss
		}

		let entity = new LiquidationDetail(event.params.partyA.toHexString() + "-" + liquidationId.toHexString() + "-" + event.address.toHexString())
		entity.source = event.address
		entity.partyA = event.params.partyA
		entity.partyAAccount = event.params.partyA.toHexString()
		entity.liquidationId = liquidationId
		entity.liquidationType = 0
		entity.upnl = upnl
		entity.totalUnrealizedLoss = totalUnrealizedLoss
		entity.deficit = BigInt.zero()
		entity.liquidationFee = BigInt.zero()
		entity.timestamp = timestamp
		entity.involvedPartyBCounts = BigInt.zero()
		entity.partyAAccumulatedUpnl = BigInt.zero()
		entity.disputed = false
		entity.liquidationTimestamp = liquidationTimestamp
		entity.liquidator = event.params.liquidator
		if (version == Version.v_0_8_5) {
			// @ts-ignore
			entity.allocatedBalance = changetype<LiquidatePartyA_0_8_5>(_event).params.allocatedBalance
		} else if (version == Version.v_0_8_4) {
			// @ts-ignore
			entity.allocatedBalance = changetype<LiquidatePartyA_0_8_4>(_event).params.allocatedBalance
		} else if (version == Version.v_0_8_3) {
			// @ts-ignore
			entity.allocatedBalance = changetype<LiquidatePartyA_0_8_3>(_event).params.allocatedBalance
		} else if (version == Version.v_0_8_2) {
			// @ts-ignore
			entity.allocatedBalance = changetype<LiquidatePartyA_0_8_2>(_event).params.allocatedBalance
		}
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
}
