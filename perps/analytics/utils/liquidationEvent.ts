import { Address, Bytes, ethereum } from "@graphprotocol/graph-ts"
import { LiquidationDetail, LiquidationEvent } from "../../../generated/schema"
import { Version } from "../../common/BaseHandler"
import { getLiquidationStateData } from "../../common/VersionedQuoteLoader"
import { getGlobalCounterAndInc } from "../../common/utils"

function getLiquidationDetailId(partyA: Bytes, liquidationId: Bytes, source: Bytes): string {
	return partyA.toHexString() + "-" + liquidationId.toHexString() + "-" + source.toHexString()
}

export function createLiquidationEvent(
	event: ethereum.Event,
	liquidationDetailId: string,
	liquidationId: Bytes,
	type: string,
	metadata: string | null,
): void {
	let detail = LiquidationDetail.load(liquidationDetailId)
	if (!detail) return

	let id = event.transaction.hash.toHexString() + "-" + event.logIndex.toString() + "-" + type
	let entity = new LiquidationEvent(id)
	entity.globalCounter = getGlobalCounterAndInc()
	entity.source = event.address
	entity.liquidationId = liquidationId
	entity.liquidationDetail = liquidationDetailId
	entity.type = type
	entity.metadata = metadata
	entity.timestamp = event.block.timestamp
	entity.blockNumber = event.block.number
	entity.transaction = event.transaction.hash
	entity.save()
}

export function createPartyALiquidationEvent(
	event: ethereum.Event,
	partyA: Address,
	liquidationId: Bytes,
	type: string,
	metadata: string | null,
): void {
	createLiquidationEvent(event, getLiquidationDetailId(partyA, liquidationId, event.address), liquidationId, type, metadata)
}

export function createPartyALiquidationEventFromState(
	event: ethereum.Event,
	version: Version,
	partyA: Address,
	type: string,
	metadata: string | null,
): void {
	let liqState = getLiquidationStateData(version, event.address, partyA)
	if (!liqState) return
	createPartyALiquidationEvent(event, partyA, liqState.liquidationId, type, metadata)
}
