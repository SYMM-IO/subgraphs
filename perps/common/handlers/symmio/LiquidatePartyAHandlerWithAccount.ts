import { BaseHandler, Version } from "../../BaseHandler"
import { BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts"
import { AccountType, createNewAccountIfNotExists } from "../../utils/builders"
import { LiquidationDetail } from "../../../../generated/schema"
import { getLiquidatedStateOfPartyA as getLiquidatedStateOfPartyA_0_8_4 } from "../../contract_utils_0_8_4"
import { getLiquidatedStateOfPartyA as getLiquidatedStateOfPartyA_0_8_3 } from "../../contract_utils_0_8_3"
import { getLiquidatedStateOfPartyA as getLiquidatedStateOfPartyA_0_8_2 } from "../../contract_utils_0_8_2"
import { getLiquidatedStateOfPartyA as getLiquidatedStateOfPartyA_0_8_1 } from "../../contract_utils_0_8_1"
import { LiquidatePartyA as LiquidatePartyA_0_8_4 } from "../../../../generated/symmio_0_8_4/symmio_0_8_4"
import { LiquidatePartyA as LiquidatePartyA_0_8_3 } from "../../../../generated/symmio_0_8_3/symmio_0_8_3"
import { LiquidatePartyA as LiquidatePartyA_0_8_2 } from "../../../../generated/symmio_0_8_2/symmio_0_8_2"

export class LiquidatePartyAHandlerWithAccount<T> extends BaseHandler {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let liquidationId: Bytes
		let timestamp: BigInt
		let liquidationTimestamp: BigInt
		let upnl: BigInt
		let totalUnrealizedLoss: BigInt
		switch (version) {
			case Version.v_0_8_4: {
				// @ts-ignore
				const event_ = changetype<LiquidatePartyA_0_8_4>(_event)
				liquidationId = event_.params.liquidationId
				upnl = event_.params.upnl
				totalUnrealizedLoss = event_.params.totalUnrealizedLoss
				const liquidationDetail = getLiquidatedStateOfPartyA_0_8_4(event.address, event.params.partyA)!
				timestamp = liquidationDetail.timestamp
				liquidationTimestamp = liquidationDetail.liquidationTimestamp
				break
			}
			case Version.v_0_8_3: {
				// @ts-ignore
				const event_ = changetype<LiquidatePartyA_0_8_3>(_event)
				liquidationId = event_.params.liquidationId
				upnl = event_.params.upnl
				totalUnrealizedLoss = event_.params.totalUnrealizedLoss
				const liquidationDetail = getLiquidatedStateOfPartyA_0_8_3(event.address, event.params.partyA)!
				timestamp = liquidationDetail.timestamp
				liquidationTimestamp = liquidationDetail.liquidationTimestamp
				break
			}
			case Version.v_0_8_2: {
				// @ts-ignore
				const event_ = changetype<LiquidatePartyA_0_8_2>(_event)
				upnl = event_.params.upnl
				totalUnrealizedLoss = event_.params.totalUnrealizedLoss
				const liquidationDetail = getLiquidatedStateOfPartyA_0_8_2(event.address, event.params.partyA)!
				liquidationId = liquidationDetail.liquidationId
				timestamp = liquidationDetail.timestamp
				liquidationTimestamp = liquidationDetail.timestamp
				break
			}
			case Version.v_0_8_1: {
				const liquidationDetail = getLiquidatedStateOfPartyA_0_8_1(event.address, event.params.partyA)!
				liquidationId = liquidationDetail.liquidationId
				timestamp = liquidationDetail.timestamp
				liquidationTimestamp = liquidationDetail.timestamp
				upnl = liquidationDetail.upnl
				totalUnrealizedLoss = liquidationDetail.totalUnrealizedLoss
				break
			}
		}
		let entity = new LiquidationDetail(event.params.partyA.toHexString() + "-" + liquidationId.toHexString() + "-" + event.address.toHexString())
		entity.partyA = event.params.partyA
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
