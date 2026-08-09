import { Address, store } from "@graphprotocol/graph-ts"
import { ClearingHouseLiquidationContext } from "../../../generated/schema"
import { symmio_0_8_5 } from "../../../generated/symmio_0_8_5/symmio_0_8_5"
import { Version } from "../BaseHandler"

export enum ClearingHouseLiquidationType {
	NONE,
	CROSS_PARTY_B,
	PARTY_A_TAKEOVER,
}

function contextId(source: Address, subject: Address): string {
	return source.toHexString() + "-" + subject.toHexString()
}

function loadOrCreateContext(source: Address, subject: Address): ClearingHouseLiquidationContext {
	let id = contextId(source, subject)
	let context = ClearingHouseLiquidationContext.load(id)
	if (context) return context

	context = new ClearingHouseLiquidationContext(id)
	context.source = source
	context.subject = subject
	context.crossPartyBInProgress = false
	context.partyATakeoverInProgress = false
	return context
}

function saveOrRemoveContext(context: ClearingHouseLiquidationContext): void {
	if (!context.crossPartyBInProgress && !context.partyATakeoverInProgress) {
		store.remove("ClearingHouseLiquidationContext", context.id)
		return
	}
	context.save()
}

export function activateCrossPartyBLiquidation(source: Address, partyB: Address): void {
	let context = loadOrCreateContext(source, partyB)
	context.crossPartyBInProgress = true
	context.save()
}

export function settleCrossPartyBLiquidation(source: Address, partyB: Address): void {
	let context = ClearingHouseLiquidationContext.load(contextId(source, partyB))
	if (!context) return
	context.crossPartyBInProgress = false
	saveOrRemoveContext(context)
}

export function activatePartyATakeover(source: Address, partyA: Address): void {
	let context = loadOrCreateContext(source, partyA)
	context.partyATakeoverInProgress = true
	context.save()
}

export function settlePartyATakeover(source: Address, partyA: Address): void {
	let context = ClearingHouseLiquidationContext.load(contextId(source, partyA))
	if (!context) return
	context.partyATakeoverInProgress = false
	saveOrRemoveContext(context)
}

export function resolveClearingHouseLiquidationType(
	version: Version,
	source: Address,
	subject: Address,
	liquidatedAmountCount: i32,
): ClearingHouseLiquidationType {
	// Cross liquidation never returns per-quote amounts. A non-empty array is
	// therefore an event-local, terminal-state-independent takeover proof.
	if (liquidatedAmountCount > 0) {
		activatePartyATakeover(source, subject)
		return ClearingHouseLiquidationType.PARTY_A_TAKEOVER
	}

	let context = ClearingHouseLiquidationContext.load(contextId(source, subject))
	if (context) {
		// Match the core's getLiquidationType priority if both flags coexist.
		if (context.crossPartyBInProgress) return ClearingHouseLiquidationType.CROSS_PARTY_B
		if (context.partyATakeoverInProgress) return ClearingHouseLiquidationType.PARTY_A_TAKEOVER
	}

	// Retain a state-read fallback for deployments that begin indexing while a
	// liquidation is already active. Persist discoveries so later events remain
	// correctly classified if settlement clears contract state in the same block.
	if (version < Version.v_0_8_5) return ClearingHouseLiquidationType.NONE
	let contract = symmio_0_8_5.bind(source)
	let cross = contract.try_getCrossLiquidationDetails(subject)
	let takeover = contract.try_getPartyATakeoverDetails(subject)
	let crossInProgress = !cross.reverted && cross.value.inProgress
	let takeoverInProgress = !takeover.reverted && takeover.value.inProgress
	if (crossInProgress) activateCrossPartyBLiquidation(source, subject)
	if (takeoverInProgress) activatePartyATakeover(source, subject)
	if (crossInProgress) return ClearingHouseLiquidationType.CROSS_PARTY_B
	if (takeoverInProgress) return ClearingHouseLiquidationType.PARTY_A_TAKEOVER
	return ClearingHouseLiquidationType.NONE
}
