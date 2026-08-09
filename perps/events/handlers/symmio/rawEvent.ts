import { Entity, ethereum, Value } from "@graphprotocol/graph-ts"
import { getGlobalCounterAndInc } from "../../../common/utils"

/**
 * Applies the metadata shared by every immutable raw Symmio event entity.
 * Event-specific handlers remain responsible for payload fields and saving.
 */
export function setRawEventMetadata(entity: Entity, event: ethereum.Event): void {
	entity.set("source", Value.fromBytes(event.address))
	entity.set("counterId", Value.fromBigInt(getGlobalCounterAndInc()))
	entity.set("blockNumber", Value.fromBigInt(event.block.number))
	entity.set("blockTimestamp", Value.fromBigInt(event.block.timestamp))
	entity.set("transactionHash", Value.fromBytes(event.transaction.hash))
	entity.set("transactionIndex", Value.fromBigInt(event.transaction.index))
	entity.set("logIndex", Value.fromBigInt(event.logIndex))
	entity.set("blockHash", Value.fromBytes(event.block.hash))
}
