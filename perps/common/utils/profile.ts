import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
	Account,
	AggregatedPosition,
	LiquidationDetail,
	MarginTransfer,
	Quote,
	SubAccount,
	VirtualAccount,
	WithdrawRequest,
} from "../../../generated/schema"
import { currentAccountLayerSource, currentDeploymentId } from "./deploymentContext"
import { normalizeCoreSource } from "./account_layer_resolver"

export const ACCOUNT_KIND_LEGACY_MULTIACCOUNT = "LEGACY_MULTIACCOUNT"
export const ACCOUNT_KIND_SUB_ACCOUNT = "SUB_ACCOUNT"
export const ACCOUNT_KIND_VIRTUAL_ACCOUNT = "VIRTUAL_ACCOUNT"
export const ACCOUNT_KIND_SOLVER = "SOLVER"
export const ACCOUNT_KIND_LIQUIDATOR = "LIQUIDATOR"
export const ACCOUNT_KIND_BRIDGE = "BRIDGE"
export const ACCOUNT_KIND_UNKNOWN = "UNKNOWN"

export function setAccountProfileSources(account: Account, coreSource: Bytes | null = null, accountLayerSource: Bytes | null = null): void {
	account.deploymentId = currentDeploymentId()
	account.coreSource = normalizeCoreSource(coreSource)
	account.accountLayerSource = accountLayerSource
}

export function setCoreEntityProfileSources(entitySource: Bytes, account: Account | null): ProfileSourceContext {
	let context = new ProfileSourceContext()
	context.deploymentId = currentDeploymentId()
	context.coreSource = normalizeCoreSource(entitySource)
	context.accountLayerSource = currentAccountLayerSource()
	if (account) {
		let cachedCore = normalizeCoreSource(account.coreSource)
		if (cachedCore !== null) context.coreSource = cachedCore
		if (account.accountLayerSource) context.accountLayerSource = account.accountLayerSource
		if (account.deploymentId) context.deploymentId = account.deploymentId
	}
	return context
}

export class ProfileSourceContext {
	deploymentId: string | null = null
	coreSource: Bytes | null = null
	accountLayerSource: Bytes | null = null
}

export function setSubAccountProfileDefaults(sub: SubAccount, owner: Bytes, coreSource: Bytes | null, accountLayerSource: Bytes | null): void {
	sub.ownerRef = owner.toHexString()
	sub.affiliateAddress = Address.fromString(sub.affiliate)
	sub.deploymentId = currentDeploymentId()
	sub.coreSource = normalizeCoreSource(coreSource)
	sub.accountLayerSource = accountLayerSource
	sub.routingMode = routingMode(sub.isolationType, sub.singleVAMode)
}

export function initializeSubAccountCounters(sub: SubAccount): void {
	sub.pendingQuotesCount = BigInt.zero()
	sub.openPositionsCount = BigInt.zero()
	sub.closedQuotesCount = BigInt.zero()
	sub.liquidatedQuotesCount = BigInt.zero()
	sub.cancelledQuotesCount = BigInt.zero()
	sub.expiredQuotesCount = BigInt.zero()
	sub.rejectedQuotesCount = BigInt.zero()
}

export function setVirtualAccountProfileDefaults(
	va: VirtualAccount,
	parent: SubAccount | null,
	coreSource: Bytes | null,
	accountLayerSource: Bytes | null,
): void {
	va.parentAddress = Address.fromString(va.parent)
	if (parent) {
		va.owner = parent.owner
		va.ownerRef = parent.owner.toHexString()
	}
	va.deploymentId = currentDeploymentId()
	va.coreSource = normalizeCoreSource(coreSource)
	va.accountLayerSource = accountLayerSource
}

export function initializeVirtualAccountCounters(va: VirtualAccount): void {
	va.pendingQuotesCount = BigInt.zero()
	va.openPositionsCount = BigInt.zero()
	va.closedQuotesCount = BigInt.zero()
	va.liquidatedQuotesCount = BigInt.zero()
	va.cancelledQuotesCount = BigInt.zero()
	va.expiredQuotesCount = BigInt.zero()
	va.rejectedQuotesCount = BigInt.zero()
}

export function setMarginTransferProfileSources(mt: MarginTransfer, coreSource: Bytes | null, accountLayerSource: Bytes | null): void {
	mt.deploymentId = currentDeploymentId()
	mt.coreSource = normalizeCoreSource(coreSource)
	mt.accountLayerSource = accountLayerSource
	mt.virtualAccountRef = mt.virtualAccount
	mt.subAccountRef = mt.subAccount
}

export function setAggregatedPositionProfileRefs(entity: AggregatedPosition, account: Account | null, source: Bytes): void {
	let context = setCoreEntityProfileSources(source, account)
	entity.deploymentId = context.deploymentId
	entity.coreSource = context.coreSource
	entity.accountLayerSource = context.accountLayerSource
	if (!account) return
	entity.owner = account.owner
	if (account.subAccount) entity.subAccountRef = account.subAccount
	if (account.virtualAccount) entity.virtualAccountRef = account.virtualAccount
}

export function setLiquidationDetailProfileRefs(entity: LiquidationDetail, account: Account | null, source: Bytes): void {
	let context = setCoreEntityProfileSources(source, account)
	entity.deploymentId = context.deploymentId
	entity.coreSource = context.coreSource
	entity.accountLayerSource = context.accountLayerSource
	if (!account) return
	entity.owner = account.owner
	if (account.subAccount) entity.subAccountRef = account.subAccount
	if (account.virtualAccount) entity.virtualAccountRef = account.virtualAccount
}

export function setWithdrawRequestProfileRefs(entity: WithdrawRequest, account: Account | null, source: Bytes): void {
	let context = setCoreEntityProfileSources(source, account)
	entity.deploymentId = context.deploymentId
	entity.coreSource = context.coreSource
	entity.accountLayerSource = context.accountLayerSource
	if (!account) return
	entity.owner = account.owner
	if (account.subAccount) entity.subAccountRef = account.subAccount
	if (account.virtualAccount) entity.virtualAccountRef = account.virtualAccount
}

function addCounter(value: BigInt, delta: BigInt): BigInt {
	let next = value.plus(delta)
	return next.lt(BigInt.zero()) ? BigInt.zero() : next
}

export function updateQuoteHierarchyCounters(
	quote: Quote,
	pendingDelta: BigInt,
	openDelta: BigInt,
	closedDelta: BigInt,
	liquidatedDelta: BigInt,
	cancelledDelta: BigInt,
	expiredDelta: BigInt,
	rejectedDelta: BigInt,
	timestamp: BigInt,
): void {
	if (quote.subAccount) {
		let sub = SubAccount.load(quote.subAccount!)
		if (sub) {
			sub.pendingQuotesCount = addCounter(sub.pendingQuotesCount, pendingDelta)
			sub.openPositionsCount = addCounter(sub.openPositionsCount, openDelta)
			sub.closedQuotesCount = sub.closedQuotesCount.plus(closedDelta)
			sub.liquidatedQuotesCount = sub.liquidatedQuotesCount.plus(liquidatedDelta)
			sub.cancelledQuotesCount = sub.cancelledQuotesCount.plus(cancelledDelta)
			sub.expiredQuotesCount = sub.expiredQuotesCount.plus(expiredDelta)
			sub.rejectedQuotesCount = sub.rejectedQuotesCount.plus(rejectedDelta)
			sub.lastTradeTimestamp = timestamp
			sub.updateTimestamp = timestamp
			sub.save()
		}
	}
	if (quote.virtualAccount) {
		let va = VirtualAccount.load(quote.virtualAccount!)
		if (va) {
			va.pendingQuotesCount = addCounter(va.pendingQuotesCount, pendingDelta)
			va.openPositionsCount = addCounter(va.openPositionsCount, openDelta)
			va.closedQuotesCount = va.closedQuotesCount.plus(closedDelta)
			va.liquidatedQuotesCount = va.liquidatedQuotesCount.plus(liquidatedDelta)
			va.cancelledQuotesCount = va.cancelledQuotesCount.plus(cancelledDelta)
			va.expiredQuotesCount = va.expiredQuotesCount.plus(expiredDelta)
			va.rejectedQuotesCount = va.rejectedQuotesCount.plus(rejectedDelta)
			va.lastTradeTimestamp = timestamp
			va.updateTimestamp = timestamp
			va.save()
		}
	}
}

export function routingMode(isolationType: i32, singleVAMode: boolean): string | null {
	if (isolationType == 0) return "POSITION"
	if (isolationType == 1) return singleVAMode ? "MARKET_SINGLE_VA" : "MARKET"
	if (isolationType == 2) return singleVAMode ? "MARKET_DIRECTION_SINGLE_VA" : "MARKET_DIRECTION"
	if (isolationType == 3) return "CUSTOM"
	return null
}
