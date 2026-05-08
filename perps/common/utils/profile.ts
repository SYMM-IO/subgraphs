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

export const ACCOUNT_KIND_LEGACY_MULTIACCOUNT = "LEGACY_MULTIACCOUNT"
export const ACCOUNT_KIND_SUB_ACCOUNT = "SUB_ACCOUNT"
export const ACCOUNT_KIND_VIRTUAL_ACCOUNT = "VIRTUAL_ACCOUNT"
export const ACCOUNT_KIND_SOLVER = "SOLVER"
export const ACCOUNT_KIND_LIQUIDATOR = "LIQUIDATOR"
export const ACCOUNT_KIND_BRIDGE = "BRIDGE"
export const ACCOUNT_KIND_UNKNOWN = "UNKNOWN"

let coreToLayer = new Map<string, string>()
let layerToCore = new Map<string, string>()
let sourceToDeployment = new Map<string, string>()

function registerDeployment(id: string, core: string, layer: string): void {
	coreToLayer.set(core, layer)
	layerToCore.set(layer, core)
	sourceToDeployment.set(core, id)
	sourceToDeployment.set(layer, id)
}

registerDeployment("arbitrum", "0x8f06459f184553e5d04f07f868720bdacab39395", "0xa60ac54e18739f1c4681409383dcf881de3efabe")
registerDeployment("hyperevm", "0x57331038c21982116ee9b0906e4a5c5cb52dce2e", "0x46493c376758da47823d7e3ae5d417ea6546eeb3")
registerDeployment("hyperevm-stage", "0x99641e06d38f327166b3a48f86ca2cbb3b4fb7eb", "0x812e98f31a4effc09dd82e6e87ff7456151a0dfb")
registerDeployment("mantle", "0x2ecc7da3cc98d341f987c85c3d9fc198570838b5", "0xba3d3982dc12acd61fe11ff08ba2164cd1c12c78")
registerDeployment("base-test", "0xa805fe5baa301d4e72c789694f3967452c77d6fd", "0xe566bcdc59a644a6d71564f4e941cf93b6a37846")
registerDeployment("base-lc-test", "0x0f4352e4a88b5dc0531a98b538f04893fb22489c", "0xe566bcdc59a644a6d71564f4e941cf93b6a37846")

export function coreSourceForAccountLayer(layer: Bytes): Bytes | null {
	let key = layer.toHexString()
	if (!layerToCore.has(key)) return null
	return Bytes.fromHexString(layerToCore.get(key))
}

export function accountLayerSourceForCore(core: Bytes): Bytes | null {
	let key = core.toHexString()
	if (!coreToLayer.has(key)) return null
	return Bytes.fromHexString(coreToLayer.get(key))
}

export function deploymentIdForSource(source: Bytes): string | null {
	let key = source.toHexString()
	if (!sourceToDeployment.has(key)) return null
	return sourceToDeployment.get(key)
}

export function setAccountProfileSources(
	account: Account,
	source: Bytes,
	coreSource: Bytes | null = null,
	accountLayerSource: Bytes | null = null,
): void {
	account.deploymentId = deploymentIdForSource(source)
	account.coreSource = coreSource
	account.accountLayerSource = accountLayerSource
}

export function setCoreEntityProfileSources(entitySource: Bytes, account: Account | null): ProfileSourceContext {
	let context = new ProfileSourceContext()
	context.deploymentId = deploymentIdForSource(entitySource)
	context.coreSource = entitySource
	context.accountLayerSource = accountLayerSourceForCore(entitySource)
	if (account) {
		if (account.coreSource) context.coreSource = account.coreSource
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

export function setSubAccountProfileDefaults(
	sub: SubAccount,
	owner: Bytes,
	source: Bytes,
	coreSource: Bytes | null,
	accountLayerSource: Bytes | null,
): void {
	sub.ownerRef = owner.toHexString()
	sub.affiliateAddress = Address.fromString(sub.affiliate)
	sub.deploymentId = deploymentIdForSource(source)
	sub.coreSource = coreSource
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
	source: Bytes,
	coreSource: Bytes | null,
	accountLayerSource: Bytes | null,
): void {
	va.parentAddress = Address.fromString(va.parent)
	if (parent) {
		va.owner = parent.owner
		va.ownerRef = parent.owner.toHexString()
	}
	va.deploymentId = deploymentIdForSource(source)
	va.coreSource = coreSource
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

export function setMarginTransferProfileSources(mt: MarginTransfer, source: Bytes, coreSource: Bytes | null, accountLayerSource: Bytes | null): void {
	mt.deploymentId = deploymentIdForSource(source)
	mt.coreSource = coreSource
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
