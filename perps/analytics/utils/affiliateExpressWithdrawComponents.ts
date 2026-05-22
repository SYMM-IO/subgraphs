import { Address, BigInt, Bytes, store } from "@graphprotocol/graph-ts"
import {
	Account,
	AffiliateExpressWithdrawAccountSnapshot,
	AffiliateExpressWithdrawComponentBucket,
	AffiliateExpressWithdrawComponents,
	Configuration,
	ExpressProviderSource,
	ExpressProviderSourceByCore,
	LatestAccountBalance,
	SubAccount,
	WithdrawRequest,
	WithdrawRequestAccountLookup,
} from "../../../generated/schema"
import { expressProvider_1 } from "../../../generated/templates/ExpressProvider/expressProvider_1"
import {
	ACCOUNT_KIND_LEGACY_MULTIACCOUNT,
	ACCOUNT_KIND_SUB_ACCOUNT,
	ACCOUNT_KIND_VIRTUAL_ACCOUNT,
	accountLayerSourceForCore,
	deploymentIdForSource,
} from "../../common/utils/profile"
import { ZERO_ADDRESS_BYTES } from "./constants"
import { loadWithdrawRequest, loadWithdrawRequestAccountLookup } from "./withdrawRequest"

const BUCKET_LEGACY = "LEGACY"
const BUCKET_IMPORTED_LEGACY = "IMPORTED_LEGACY"
const BUCKET_SUB_ACCOUNT = "SUB_ACCOUNT"
const BUCKET_CUSTOM_SUB_ACCOUNT = "CUSTOM_SUB_ACCOUNT"
const BUCKET_VIRTUAL_ACCOUNT = "VIRTUAL_ACCOUNT"
const BUCKET_UNKNOWN = "UNKNOWN"

const ARBITRUM_CORE = "0x8f06459f184553e5d04f07f868720bdacab39395"
const HYPEREVM_CORE = "0x57331038c21982116ee9b0906e4a5c5cb52dce2e"

function addNonNegative(value: BigInt, delta: BigInt): BigInt {
	let next = value.plus(delta)
	return next.lt(BigInt.zero()) ? BigInt.zero() : next
}

function zeroIfNull(value: BigInt | null): BigInt {
	return value === null ? BigInt.zero() : value
}

function configCollateral(): Bytes {
	let configuration = Configuration.load("0")
	return configuration ? configuration.collateral : ZERO_ADDRESS_BYTES
}

function snapshotId(account: Bytes, source: Bytes): string {
	return account.toHexString() + "-" + source.toHexString()
}

function aggregateId(source: Bytes, affiliate: Bytes, collateral: Bytes): string {
	return source.toHexString() + "-" + affiliate.toHexString() + "-" + collateral.toHexString()
}

function sourceHasAdvancedWithdrawData(source: Bytes): boolean {
	let key = source.toHexString()
	return key == ARBITRUM_CORE || key == HYPEREVM_CORE
}

function providerSourceByCoreId(source: Bytes): string {
	return source.toHexString()
}

function providerSourceId(provider: Bytes): string {
	return provider.toHexString()
}

function bucketId(componentsId: string, bucket: string): string {
	return componentsId + "-" + bucket
}

function sourceForAccount(account: Account, fallbackSource: Bytes | null = null): Bytes | null {
	if (fallbackSource !== null) return fallbackSource
	if (account.coreSource) return account.coreSource
	if (account.source) return account.source
	return null
}

function deploymentForSource(source: Bytes, account: Account | null): string | null {
	if (account && account.deploymentId) return account.deploymentId
	return deploymentIdForSource(source)
}

function accountLayerForSource(source: Bytes, account: Account | null): Bytes | null {
	if (account && account.accountLayerSource) return account.accountLayerSource
	return accountLayerSourceForCore(source)
}

function accountBucket(account: Account, sub: SubAccount | null): string {
	if (account.accountKind == ACCOUNT_KIND_VIRTUAL_ACCOUNT) return BUCKET_VIRTUAL_ACCOUNT
	if (account.accountKind == ACCOUNT_KIND_SUB_ACCOUNT) {
		if (sub && sub.isLegacy) return BUCKET_IMPORTED_LEGACY
		if (sub && sub.routingMode == "CUSTOM") return BUCKET_CUSTOM_SUB_ACCOUNT
		if (sub && sub.isolationType == 3) return BUCKET_CUSTOM_SUB_ACCOUNT
		return BUCKET_SUB_ACCOUNT
	}
	if (account.accountKind == ACCOUNT_KIND_LEGACY_MULTIACCOUNT) return BUCKET_LEGACY
	return BUCKET_UNKNOWN
}

function isBrokenHierarchy(account: Account, sub: SubAccount | null): boolean {
	if (account.accountKind == ACCOUNT_KIND_SUB_ACCOUNT) return sub === null
	if (account.accountKind == ACCOUNT_KIND_VIRTUAL_ACCOUNT) {
		if (!account.subAccount) return true
		return sub === null
	}
	return false
}

function isUnresolvedLegacy(account: Account, bucket: string): boolean {
	return bucket == BUCKET_LEGACY && account.accountKind == ACCOUNT_KIND_LEGACY_MULTIACCOUNT
}

function isUnknownAccount(bucket: string): boolean {
	return bucket == BUCKET_UNKNOWN
}

function isOpenWithdrawRequest(request: WithdrawRequest): boolean {
	return request.status == "PENDING" || request.status == "PROVIDER_ACCEPTED" || request.status == "CANCEL_REQUESTED"
}

function newComponents(
	id: string,
	source: Bytes,
	affiliate: Bytes,
	collateral: Bytes,
	account: Account | null,
	timestamp: BigInt,
	blockNumber: BigInt,
): AffiliateExpressWithdrawComponents {
	let entity = new AffiliateExpressWithdrawComponents(id)
	entity.deploymentId = deploymentForSource(source, account)
	entity.source = source
	entity.coreSource = source
	entity.accountLayerSource = accountLayerForSource(source, account)
	entity.affiliate = affiliate
	entity.collateral = collateral
	entity.collateralDecimals = 0
	entity.accountCount = BigInt.zero()
	entity.accountWithBalanceCount = BigInt.zero()
	entity.freeBalance18 = BigInt.zero()
	entity.allocatedBalance18 = BigInt.zero()
	entity.lockedCva18 = BigInt.zero()
	entity.lockedLf18 = BigInt.zero()
	entity.lockedPartyAmm18 = BigInt.zero()
	entity.lockedPartyBmm18 = BigInt.zero()
	entity.pendingLockedCva18 = BigInt.zero()
	entity.pendingLockedLf18 = BigInt.zero()
	entity.pendingLockedPartyAmm18 = BigInt.zero()
	entity.pendingLockedPartyBmm18 = BigInt.zero()
	entity.totalBalance18 = BigInt.zero()
	entity.pendingWithdrawAmountCollateral = BigInt.zero()
	entity.pendingClassicWithdrawAmountCollateral = BigInt.zero()
	entity.pendingExpressWithdrawAmountCollateral = BigInt.zero()
	entity.pendingVirtualWithdrawAmountCollateral = BigInt.zero()
	entity.advancedWithdrawAmountCollateral = BigInt.zero()
	entity.advancedWithdrawDataAvailable = sourceHasAdvancedWithdrawData(source)
	entity.reservedDebtCollateral = BigInt.zero()
	entity.activeDebtCollateral = BigInt.zero()
	entity.badDebtCollateral = BigInt.zero()
	entity.debtDataAvailable = false
	entity.brokenHierarchyCount = BigInt.zero()
	entity.unresolvedLegacyAccountCount = BigInt.zero()
	entity.unknownAccountCount = BigInt.zero()
	entity.lastBalanceTimestamp = null
	entity.lastWithdrawTimestamp = null
	entity.lastDebtTimestamp = null
	entity.updateTimestamp = timestamp
	entity.blockNumber = blockNumber
	return entity
}

function loadComponents(
	source: Bytes,
	affiliate: Bytes,
	collateral: Bytes,
	account: Account | null,
	timestamp: BigInt,
	blockNumber: BigInt,
): AffiliateExpressWithdrawComponents {
	let id = aggregateId(source, affiliate, collateral)
	let entity = AffiliateExpressWithdrawComponents.load(id)
	if (!entity) entity = newComponents(id, source, affiliate, collateral, account, timestamp, blockNumber)
	if (sourceHasAdvancedWithdrawData(source) && !entity.advancedWithdrawDataAvailable) {
		entity.advancedWithdrawDataAvailable = true
		entity.updateTimestamp = timestamp
		entity.blockNumber = blockNumber
	}
	let providerSource = ExpressProviderSourceByCore.load(providerSourceByCoreId(source))
	if (providerSource && !entity.debtDataAvailable) {
		entity.debtDataAvailable = true
		entity.updateTimestamp = timestamp
		entity.blockNumber = blockNumber
	}
	return entity
}

function newBucket(
	id: string,
	components: AffiliateExpressWithdrawComponents,
	bucket: string,
	timestamp: BigInt,
	blockNumber: BigInt,
): AffiliateExpressWithdrawComponentBucket {
	let entity = new AffiliateExpressWithdrawComponentBucket(id)
	entity.components = components.id
	entity.deploymentId = components.deploymentId
	entity.source = components.source
	entity.coreSource = components.coreSource
	entity.accountLayerSource = components.accountLayerSource
	entity.affiliate = components.affiliate
	entity.collateral = components.collateral
	entity.collateralDecimals = components.collateralDecimals
	entity.bucket = bucket
	entity.accountCount = BigInt.zero()
	entity.accountWithBalanceCount = BigInt.zero()
	entity.freeBalance18 = BigInt.zero()
	entity.allocatedBalance18 = BigInt.zero()
	entity.lockedCva18 = BigInt.zero()
	entity.lockedLf18 = BigInt.zero()
	entity.lockedPartyAmm18 = BigInt.zero()
	entity.lockedPartyBmm18 = BigInt.zero()
	entity.pendingLockedCva18 = BigInt.zero()
	entity.pendingLockedLf18 = BigInt.zero()
	entity.pendingLockedPartyAmm18 = BigInt.zero()
	entity.pendingLockedPartyBmm18 = BigInt.zero()
	entity.totalBalance18 = BigInt.zero()
	entity.pendingWithdrawAmountCollateral = BigInt.zero()
	entity.pendingClassicWithdrawAmountCollateral = BigInt.zero()
	entity.pendingExpressWithdrawAmountCollateral = BigInt.zero()
	entity.pendingVirtualWithdrawAmountCollateral = BigInt.zero()
	entity.advancedWithdrawAmountCollateral = BigInt.zero()
	entity.advancedWithdrawDataAvailable = components.advancedWithdrawDataAvailable
	entity.reservedDebtCollateral = BigInt.zero()
	entity.activeDebtCollateral = BigInt.zero()
	entity.badDebtCollateral = BigInt.zero()
	entity.debtDataAvailable = components.debtDataAvailable
	entity.brokenHierarchyCount = BigInt.zero()
	entity.unresolvedLegacyAccountCount = BigInt.zero()
	entity.unknownAccountCount = BigInt.zero()
	entity.lastBalanceTimestamp = null
	entity.lastWithdrawTimestamp = null
	entity.lastDebtTimestamp = null
	entity.updateTimestamp = timestamp
	entity.blockNumber = blockNumber
	return entity
}

function loadBucket(
	components: AffiliateExpressWithdrawComponents,
	bucket: string,
	timestamp: BigInt,
	blockNumber: BigInt,
): AffiliateExpressWithdrawComponentBucket {
	let id = bucketId(components.id, bucket)
	let entity = AffiliateExpressWithdrawComponentBucket.load(id)
	if (!entity) entity = newBucket(id, components, bucket, timestamp, blockNumber)
	if (components.debtDataAvailable && !entity.debtDataAvailable) {
		entity.debtDataAvailable = true
		entity.updateTimestamp = timestamp
		entity.blockNumber = blockNumber
	}
	if (components.advancedWithdrawDataAvailable && !entity.advancedWithdrawDataAvailable) {
		entity.advancedWithdrawDataAvailable = true
		entity.updateTimestamp = timestamp
		entity.blockNumber = blockNumber
	}
	return entity
}

function applySnapshotDelta(
	components: AffiliateExpressWithdrawComponents,
	bucketEntity: AffiliateExpressWithdrawComponentBucket,
	accountCountDelta: BigInt,
	accountWithBalanceDelta: BigInt,
	freeDelta: BigInt,
	allocatedDelta: BigInt,
	lockedCvaDelta: BigInt,
	lockedLfDelta: BigInt,
	lockedPartyAmmDelta: BigInt,
	lockedPartyBmmDelta: BigInt,
	pendingLockedCvaDelta: BigInt,
	pendingLockedLfDelta: BigInt,
	pendingLockedPartyAmmDelta: BigInt,
	pendingLockedPartyBmmDelta: BigInt,
	totalDelta: BigInt,
	brokenDelta: BigInt,
	unresolvedLegacyDelta: BigInt,
	unknownDelta: BigInt,
	timestamp: BigInt,
	blockNumber: BigInt,
): void {
	components.accountCount = addNonNegative(components.accountCount, accountCountDelta)
	components.accountWithBalanceCount = addNonNegative(components.accountWithBalanceCount, accountWithBalanceDelta)
	components.freeBalance18 = components.freeBalance18.plus(freeDelta)
	components.allocatedBalance18 = components.allocatedBalance18.plus(allocatedDelta)
	components.lockedCva18 = components.lockedCva18.plus(lockedCvaDelta)
	components.lockedLf18 = components.lockedLf18.plus(lockedLfDelta)
	components.lockedPartyAmm18 = components.lockedPartyAmm18.plus(lockedPartyAmmDelta)
	components.lockedPartyBmm18 = components.lockedPartyBmm18.plus(lockedPartyBmmDelta)
	components.pendingLockedCva18 = components.pendingLockedCva18.plus(pendingLockedCvaDelta)
	components.pendingLockedLf18 = components.pendingLockedLf18.plus(pendingLockedLfDelta)
	components.pendingLockedPartyAmm18 = components.pendingLockedPartyAmm18.plus(pendingLockedPartyAmmDelta)
	components.pendingLockedPartyBmm18 = components.pendingLockedPartyBmm18.plus(pendingLockedPartyBmmDelta)
	components.totalBalance18 = components.totalBalance18.plus(totalDelta)
	components.brokenHierarchyCount = addNonNegative(components.brokenHierarchyCount, brokenDelta)
	components.unresolvedLegacyAccountCount = addNonNegative(components.unresolvedLegacyAccountCount, unresolvedLegacyDelta)
	components.unknownAccountCount = addNonNegative(components.unknownAccountCount, unknownDelta)
	components.lastBalanceTimestamp = timestamp
	components.updateTimestamp = timestamp
	components.blockNumber = blockNumber
	components.save()

	bucketEntity.accountCount = addNonNegative(bucketEntity.accountCount, accountCountDelta)
	bucketEntity.accountWithBalanceCount = addNonNegative(bucketEntity.accountWithBalanceCount, accountWithBalanceDelta)
	bucketEntity.freeBalance18 = bucketEntity.freeBalance18.plus(freeDelta)
	bucketEntity.allocatedBalance18 = bucketEntity.allocatedBalance18.plus(allocatedDelta)
	bucketEntity.lockedCva18 = bucketEntity.lockedCva18.plus(lockedCvaDelta)
	bucketEntity.lockedLf18 = bucketEntity.lockedLf18.plus(lockedLfDelta)
	bucketEntity.lockedPartyAmm18 = bucketEntity.lockedPartyAmm18.plus(lockedPartyAmmDelta)
	bucketEntity.lockedPartyBmm18 = bucketEntity.lockedPartyBmm18.plus(lockedPartyBmmDelta)
	bucketEntity.pendingLockedCva18 = bucketEntity.pendingLockedCva18.plus(pendingLockedCvaDelta)
	bucketEntity.pendingLockedLf18 = bucketEntity.pendingLockedLf18.plus(pendingLockedLfDelta)
	bucketEntity.pendingLockedPartyAmm18 = bucketEntity.pendingLockedPartyAmm18.plus(pendingLockedPartyAmmDelta)
	bucketEntity.pendingLockedPartyBmm18 = bucketEntity.pendingLockedPartyBmm18.plus(pendingLockedPartyBmmDelta)
	bucketEntity.totalBalance18 = bucketEntity.totalBalance18.plus(totalDelta)
	bucketEntity.brokenHierarchyCount = addNonNegative(bucketEntity.brokenHierarchyCount, brokenDelta)
	bucketEntity.unresolvedLegacyAccountCount = addNonNegative(bucketEntity.unresolvedLegacyAccountCount, unresolvedLegacyDelta)
	bucketEntity.unknownAccountCount = addNonNegative(bucketEntity.unknownAccountCount, unknownDelta)
	bucketEntity.lastBalanceTimestamp = timestamp
	bucketEntity.updateTimestamp = timestamp
	bucketEntity.blockNumber = blockNumber
	bucketEntity.save()
}

function removeSnapshot(snapshot: AffiliateExpressWithdrawAccountSnapshot, timestamp: BigInt, blockNumber: BigInt): void {
	let components = AffiliateExpressWithdrawComponents.load(snapshot.components)
	if (components) {
		let bucketEntity = AffiliateExpressWithdrawComponentBucket.load(bucketId(snapshot.components, snapshot.bucket))
		if (bucketEntity) {
			applySnapshotDelta(
				components,
				bucketEntity,
				BigInt.fromI32(-1),
				snapshot.hasBalance ? BigInt.fromI32(-1) : BigInt.zero(),
				snapshot.freeBalance18.neg(),
				snapshot.allocatedBalance18.neg(),
				snapshot.lockedCva18.neg(),
				snapshot.lockedLf18.neg(),
				snapshot.lockedPartyAmm18.neg(),
				snapshot.lockedPartyBmm18.neg(),
				snapshot.pendingLockedCva18.neg(),
				snapshot.pendingLockedLf18.neg(),
				snapshot.pendingLockedPartyAmm18.neg(),
				snapshot.pendingLockedPartyBmm18.neg(),
				snapshot.totalBalance18.neg(),
				snapshot.brokenHierarchy ? BigInt.fromI32(-1) : BigInt.zero(),
				snapshot.unresolvedLegacyAccount ? BigInt.fromI32(-1) : BigInt.zero(),
				snapshot.unknownAccount ? BigInt.fromI32(-1) : BigInt.zero(),
				timestamp,
				blockNumber,
			)
		}
	}
	store.remove("AffiliateExpressWithdrawAccountSnapshot", snapshot.id)
}

function applyWithdrawDelta(
	components: AffiliateExpressWithdrawComponents,
	bucketEntity: AffiliateExpressWithdrawComponentBucket,
	classicDelta: BigInt,
	expressDelta: BigInt,
	virtualDelta: BigInt,
	advancedDelta: BigInt,
	timestamp: BigInt,
	blockNumber: BigInt,
): void {
	let totalDelta = classicDelta.plus(expressDelta).plus(virtualDelta)
	components.pendingWithdrawAmountCollateral = components.pendingWithdrawAmountCollateral.plus(totalDelta)
	components.pendingClassicWithdrawAmountCollateral = components.pendingClassicWithdrawAmountCollateral.plus(classicDelta)
	components.pendingExpressWithdrawAmountCollateral = components.pendingExpressWithdrawAmountCollateral.plus(expressDelta)
	components.pendingVirtualWithdrawAmountCollateral = components.pendingVirtualWithdrawAmountCollateral.plus(virtualDelta)
	components.advancedWithdrawAmountCollateral = components.advancedWithdrawAmountCollateral.plus(advancedDelta)
	if (!advancedDelta.isZero()) components.advancedWithdrawDataAvailable = true
	components.lastWithdrawTimestamp = timestamp
	components.updateTimestamp = timestamp
	components.blockNumber = blockNumber
	components.save()

	bucketEntity.pendingWithdrawAmountCollateral = bucketEntity.pendingWithdrawAmountCollateral.plus(totalDelta)
	bucketEntity.pendingClassicWithdrawAmountCollateral = bucketEntity.pendingClassicWithdrawAmountCollateral.plus(classicDelta)
	bucketEntity.pendingExpressWithdrawAmountCollateral = bucketEntity.pendingExpressWithdrawAmountCollateral.plus(expressDelta)
	bucketEntity.pendingVirtualWithdrawAmountCollateral = bucketEntity.pendingVirtualWithdrawAmountCollateral.plus(virtualDelta)
	bucketEntity.advancedWithdrawAmountCollateral = bucketEntity.advancedWithdrawAmountCollateral.plus(advancedDelta)
	if (!advancedDelta.isZero()) bucketEntity.advancedWithdrawDataAvailable = true
	bucketEntity.lastWithdrawTimestamp = timestamp
	bucketEntity.updateTimestamp = timestamp
	bucketEntity.blockNumber = blockNumber
	bucketEntity.save()
}

function applyDebtDelta(
	components: AffiliateExpressWithdrawComponents,
	reservedDelta: BigInt,
	activeDelta: BigInt,
	badDelta: BigInt,
	timestamp: BigInt,
	blockNumber: BigInt,
): void {
	components.reservedDebtCollateral = addNonNegative(components.reservedDebtCollateral, reservedDelta)
	components.activeDebtCollateral = addNonNegative(components.activeDebtCollateral, activeDelta)
	components.badDebtCollateral = addNonNegative(components.badDebtCollateral, badDelta)
	components.debtDataAvailable = true
	components.lastDebtTimestamp = timestamp
	components.updateTimestamp = timestamp
	components.blockNumber = blockNumber
	components.save()
}

function applyRequestDebtDelta(
	request: WithdrawRequest,
	reservedDelta: BigInt,
	activeDelta: BigInt,
	badDelta: BigInt,
	timestamp: BigInt,
	blockNumber: BigInt,
): void {
	request.reservedDebtAmount = addNonNegative(request.reservedDebtAmount, reservedDelta)
	request.activeDebtAmount = addNonNegative(request.activeDebtAmount, activeDelta)
	request.badDebtAmount = addNonNegative(request.badDebtAmount, badDelta)
	request.updateTimestamp = timestamp
	request.blockNumber = blockNumber
	request.save()
}

export function ensureExpressProviderSource(provider: Bytes, source: Bytes, collateral: Bytes, timestamp: BigInt, blockNumber: BigInt): boolean {
	let id = providerSourceId(provider)
	let providerSource = ExpressProviderSource.load(id)
	let isNew = providerSource === null
	if (!providerSource) {
		providerSource = new ExpressProviderSource(id)
		providerSource.provider = provider
	}
	providerSource.source = source
	providerSource.collateral = collateral
	providerSource.deploymentId = deploymentIdForSource(source)
	providerSource.timestamp = timestamp
	providerSource.blockNumber = blockNumber
	providerSource.save()

	let byCore = ExpressProviderSourceByCore.load(providerSourceByCoreId(source))
	if (!byCore) byCore = new ExpressProviderSourceByCore(providerSourceByCoreId(source))
	byCore.providerSource = providerSource.id
	byCore.source = source
	byCore.provider = provider
	byCore.collateral = collateral
	byCore.deploymentId = providerSource.deploymentId
	byCore.timestamp = timestamp
	byCore.blockNumber = blockNumber
	byCore.save()

	return isNew
}

function loadExpressProviderSourceFromProvider(provider: Bytes, timestamp: BigInt, blockNumber: BigInt): ExpressProviderSource | null {
	let providerSource = ExpressProviderSource.load(providerSourceId(provider))
	if (providerSource) return providerSource

	let contract = expressProvider_1.bind(changetype<Address>(provider))
	let sourceResult = contract.try_symmio()
	if (sourceResult.reverted) return null
	let collateralResult = contract.try_collateral()
	if (collateralResult.reverted) return null

	ensureExpressProviderSource(provider, sourceResult.value, collateralResult.value, timestamp, blockNumber)
	return ExpressProviderSource.load(providerSourceId(provider))
}

function syncSnapshot(
	account: Account,
	source: Bytes | null,
	balance: LatestAccountBalance | null,
	timestamp: BigInt,
	blockNumber: BigInt,
	clearBalance: boolean = false,
): void {
	let aggregateSource = sourceForAccount(account, source)
	if (aggregateSource === null) return

	let id = snapshotId(account.account, aggregateSource)
	let previous = AffiliateExpressWithdrawAccountSnapshot.load(id)
	if (account.isDeleted == true || account.accountSource === null) {
		if (previous) removeSnapshot(previous, timestamp, blockNumber)
		return
	}

	let collateral = configCollateral()
	let sub = account.subAccount ? SubAccount.load(account.subAccount!) : null
	let bucket = accountBucket(account, sub)
	let brokenHierarchy = isBrokenHierarchy(account, sub)
	let unresolvedLegacy = isUnresolvedLegacy(account, bucket)
	let unknownAccount = isUnknownAccount(bucket)
	let components = loadComponents(aggregateSource, account.accountSource!, collateral, account, timestamp, blockNumber)
	let bucketEntity = loadBucket(components, bucket, timestamp, blockNumber)

	if (previous) {
		removeSnapshot(previous, timestamp, blockNumber)
	}

	let snapshot = previous ? previous : new AffiliateExpressWithdrawAccountSnapshot(id)
	snapshot.components = components.id
	snapshot.deploymentId = components.deploymentId
	snapshot.source = components.source
	snapshot.coreSource = components.coreSource
	snapshot.accountLayerSource = components.accountLayerSource
	snapshot.affiliate = components.affiliate
	snapshot.collateral = components.collateral
	snapshot.collateralDecimals = components.collateralDecimals
	snapshot.account = account.account
	snapshot.accountRef = account.id
	snapshot.owner = account.owner
	snapshot.subAccountRef = account.subAccount
	snapshot.virtualAccountRef = account.virtualAccount
	snapshot.bucket = bucket
	let keepPreviousBalance = !clearBalance && previous !== null
	snapshot.hasBalance = balance !== null ? true : keepPreviousBalance ? previous!.hasBalance : false
	snapshot.freeBalance18 = balance ? balance.freeBalance : keepPreviousBalance ? previous!.freeBalance18 : BigInt.zero()
	snapshot.allocatedBalance18 = balance ? balance.allocatedBalance : keepPreviousBalance ? previous!.allocatedBalance18 : BigInt.zero()
	snapshot.lockedCva18 = balance ? balance.lockedCva : keepPreviousBalance ? previous!.lockedCva18 : BigInt.zero()
	snapshot.lockedLf18 = balance ? balance.lockedLf : keepPreviousBalance ? previous!.lockedLf18 : BigInt.zero()
	snapshot.lockedPartyAmm18 = balance ? balance.lockedPartyAmm : keepPreviousBalance ? previous!.lockedPartyAmm18 : BigInt.zero()
	snapshot.lockedPartyBmm18 = balance ? balance.lockedPartyBmm : keepPreviousBalance ? previous!.lockedPartyBmm18 : BigInt.zero()
	snapshot.pendingLockedCva18 = balance ? balance.pendingLockedCva : keepPreviousBalance ? previous!.pendingLockedCva18 : BigInt.zero()
	snapshot.pendingLockedLf18 = balance ? balance.pendingLockedLf : keepPreviousBalance ? previous!.pendingLockedLf18 : BigInt.zero()
	snapshot.pendingLockedPartyAmm18 = balance ? balance.pendingLockedPartyAmm : keepPreviousBalance ? previous!.pendingLockedPartyAmm18 : BigInt.zero()
	snapshot.pendingLockedPartyBmm18 = balance ? balance.pendingLockedPartyBmm : keepPreviousBalance ? previous!.pendingLockedPartyBmm18 : BigInt.zero()
	snapshot.totalBalance18 = balance ? balance.totalBalance : keepPreviousBalance ? previous!.totalBalance18 : BigInt.zero()
	snapshot.brokenHierarchy = brokenHierarchy
	snapshot.unresolvedLegacyAccount = unresolvedLegacy
	snapshot.unknownAccount = unknownAccount
	snapshot.timestamp = timestamp
	snapshot.blockNumber = blockNumber
	snapshot.save()

	applySnapshotDelta(
		components,
		bucketEntity,
		BigInt.fromI32(1),
		snapshot.hasBalance ? BigInt.fromI32(1) : BigInt.zero(),
		snapshot.freeBalance18,
		snapshot.allocatedBalance18,
		snapshot.lockedCva18,
		snapshot.lockedLf18,
		snapshot.lockedPartyAmm18,
		snapshot.lockedPartyBmm18,
		snapshot.pendingLockedCva18,
		snapshot.pendingLockedLf18,
		snapshot.pendingLockedPartyAmm18,
		snapshot.pendingLockedPartyBmm18,
		snapshot.totalBalance18,
		snapshot.brokenHierarchy ? BigInt.fromI32(1) : BigInt.zero(),
		snapshot.unresolvedLegacyAccount ? BigInt.fromI32(1) : BigInt.zero(),
		snapshot.unknownAccount ? BigInt.fromI32(1) : BigInt.zero(),
		timestamp,
		blockNumber,
	)
}

export function syncAffiliateExpressWithdrawAccountMembership(account: Account, timestamp: BigInt, blockNumber: BigInt): void {
	syncSnapshot(account, null, null, timestamp, blockNumber)
}

export function syncAffiliateExpressWithdrawBalanceSnapshot(balance: LatestAccountBalance, timestamp: BigInt, blockNumber: BigInt): void {
	let account = Account.load(balance.account.toHexString())
	if (!account) return
	syncSnapshot(account, balance.source, balance, timestamp, blockNumber)
}

export function clearAffiliateExpressWithdrawBalanceSnapshot(accountAddress: Bytes, source: Bytes, timestamp: BigInt, blockNumber: BigInt): void {
	let account = Account.load(accountAddress.toHexString())
	if (!account) return
	syncSnapshot(account, source, null, timestamp, blockNumber, true)
}

export function removeAffiliateExpressWithdrawAccountMembership(
	accountAddress: Bytes,
	source: Bytes | null,
	timestamp: BigInt,
	blockNumber: BigInt,
): void {
	let account = Account.load(accountAddress.toHexString())
	if (!account) return
	let aggregateSource = sourceForAccount(account, source)
	if (aggregateSource === null) return
	let snapshot = AffiliateExpressWithdrawAccountSnapshot.load(snapshotId(account.account, aggregateSource))
	if (!snapshot) return
	removeSnapshot(snapshot, timestamp, blockNumber)
}

export function setWithdrawRequestAffiliateExpressWithdrawComponentRefs(request: WithdrawRequest, account: Account | null, source: Bytes): void {
	request.componentSource = null
	request.componentAffiliate = null
	request.componentCollateral = null
	request.componentBucket = null
	if (!account || account.isDeleted == true || account.accountSource === null) return
	let aggregateSource = sourceForAccount(account, source)
	if (aggregateSource === null) return
	let sub = account.subAccount ? SubAccount.load(account.subAccount!) : null
	request.componentSource = aggregateSource
	request.componentAffiliate = account.accountSource
	request.componentCollateral = configCollateral()
	request.componentBucket = accountBucket(account, sub)
}

function applyWithdrawRequestDelta(
	account: Account | null,
	source: Bytes,
	classicDelta: BigInt,
	expressDelta: BigInt,
	virtualDelta: BigInt,
	advancedDelta: BigInt,
	timestamp: BigInt,
	blockNumber: BigInt,
): void {
	if (!account || account.isDeleted == true || account.accountSource === null) return
	let aggregateSource = sourceForAccount(account, source)
	if (aggregateSource === null) return
	let collateral = configCollateral()
	let sub = account.subAccount ? SubAccount.load(account.subAccount!) : null
	let bucket = accountBucket(account, sub)
	let components = loadComponents(aggregateSource, account.accountSource!, collateral, account, timestamp, blockNumber)
	let bucketEntity = loadBucket(components, bucket, timestamp, blockNumber)
	applyWithdrawDelta(components, bucketEntity, classicDelta, expressDelta, virtualDelta, advancedDelta, timestamp, blockNumber)
}

function applyWithdrawRequestRecordDelta(
	request: WithdrawRequest,
	classicDelta: BigInt,
	expressDelta: BigInt,
	virtualDelta: BigInt,
	advancedDelta: BigInt,
	timestamp: BigInt,
	blockNumber: BigInt,
): boolean {
	if (!request.componentSource || !request.componentAffiliate || !request.componentCollateral || !request.componentBucket) return false
	let components = loadComponents(request.componentSource!, request.componentAffiliate!, request.componentCollateral!, null, timestamp, blockNumber)
	let bucketEntity = loadBucket(components, request.componentBucket!, timestamp, blockNumber)
	applyWithdrawDelta(components, bucketEntity, classicDelta, expressDelta, virtualDelta, advancedDelta, timestamp, blockNumber)
	return true
}

export function applyWithdrawRequestToAffiliateExpressWithdrawComponents(
	account: Account | null,
	source: Bytes,
	classicAmount: BigInt,
	expressAmount: BigInt,
	virtualAmount: BigInt,
	timestamp: BigInt,
	blockNumber: BigInt,
): void {
	applyWithdrawRequestDelta(account, source, classicAmount, expressAmount, virtualAmount, BigInt.zero(), timestamp, blockNumber)
}

export function removeWithdrawRequestFromAffiliateExpressWithdrawComponents(request: WithdrawRequest, timestamp: BigInt, blockNumber: BigInt): void {
	let classicDelta = zeroIfNull(request.classicAmount).neg()
	let expressDelta = zeroIfNull(request.expressAmount).neg()
	let virtualDelta = zeroIfNull(request.virtualAmount).neg()
	let advancedDelta = zeroIfNull(request.advancedAmount).neg()
	applyWithdrawRequestRecordDelta(request, classicDelta, expressDelta, virtualDelta, advancedDelta, timestamp, blockNumber)
}

export function applyWithdrawAdvancedToAffiliateExpressWithdrawComponents(
	request: WithdrawRequest,
	amount: BigInt,
	timestamp: BigInt,
	blockNumber: BigInt,
): void {
	applyWithdrawRequestRecordDelta(request, BigInt.zero(), BigInt.zero(), BigInt.zero(), amount, timestamp, blockNumber)
}

export function recordWithdrawAdvanced(source: Bytes, user: Bytes, requestId: BigInt, amount: BigInt, timestamp: BigInt, blockNumber: BigInt): void {
	let request = loadWithdrawRequest(changetype<Address>(user), requestId, changetype<Address>(source))
	if (!request) return
	request.advancedAmount = request.advancedAmount.plus(amount)
	request.updateTimestamp = timestamp
	request.blockNumber = blockNumber
	request.save()
	applyWithdrawAdvancedToAffiliateExpressWithdrawComponents(request, amount, timestamp, blockNumber)
}

export function recordReservedCreditLineDebt(
	provider: Bytes,
	affiliate: Bytes,
	user: Bytes,
	requestId: BigInt,
	amount: BigInt,
	timestamp: BigInt,
	blockNumber: BigInt,
): void {
	let providerSource = loadExpressProviderSourceFromProvider(provider, timestamp, blockNumber)
	if (!providerSource) return
	let components = loadComponents(providerSource.source, affiliate, providerSource.collateral, null, timestamp, blockNumber)
	applyDebtDelta(components, amount, BigInt.zero(), BigInt.zero(), timestamp, blockNumber)

	let request = loadWithdrawRequest(changetype<Address>(user), requestId, changetype<Address>(providerSource.source))
	if (request) applyRequestDebtDelta(request, amount, BigInt.zero(), BigInt.zero(), timestamp, blockNumber)
}

export function recordActivatedCreditLineDebt(
	provider: Bytes,
	affiliate: Bytes,
	user: Bytes,
	requestId: BigInt,
	amount: BigInt,
	timestamp: BigInt,
	blockNumber: BigInt,
): void {
	let providerSource = loadExpressProviderSourceFromProvider(provider, timestamp, blockNumber)
	if (!providerSource) return
	let components = loadComponents(providerSource.source, affiliate, providerSource.collateral, null, timestamp, blockNumber)
	applyDebtDelta(components, amount.neg(), amount, BigInt.zero(), timestamp, blockNumber)

	let request = loadWithdrawRequest(changetype<Address>(user), requestId, changetype<Address>(providerSource.source))
	if (request) applyRequestDebtDelta(request, amount.neg(), amount, BigInt.zero(), timestamp, blockNumber)
}

export function recordSettledCreditLineDebt(
	provider: Bytes,
	affiliate: Bytes,
	user: Bytes,
	requestId: BigInt,
	amount: BigInt,
	timestamp: BigInt,
	blockNumber: BigInt,
): void {
	let providerSource = loadExpressProviderSourceFromProvider(provider, timestamp, blockNumber)
	if (!providerSource) return
	let activeDelta = amount.neg()
	let reservedDelta = BigInt.zero()
	let request = loadWithdrawRequest(changetype<Address>(user), requestId, changetype<Address>(providerSource.source))
	if (request) {
		if (request.activeDebtAmount.lt(amount)) {
			activeDelta = BigInt.zero()
			reservedDelta = amount.neg()
		}
		applyRequestDebtDelta(request, reservedDelta, activeDelta, BigInt.zero(), timestamp, blockNumber)
	}
	let components = loadComponents(providerSource.source, affiliate, providerSource.collateral, null, timestamp, blockNumber)
	applyDebtDelta(components, reservedDelta, activeDelta, BigInt.zero(), timestamp, blockNumber)
}

export function recordCancelledCreditLineDebt(
	provider: Bytes,
	affiliate: Bytes,
	user: Bytes,
	requestId: BigInt,
	amount: BigInt,
	timestamp: BigInt,
	blockNumber: BigInt,
): void {
	let providerSource = loadExpressProviderSourceFromProvider(provider, timestamp, blockNumber)
	if (!providerSource) return
	let components = loadComponents(providerSource.source, affiliate, providerSource.collateral, null, timestamp, blockNumber)
	applyDebtDelta(components, amount.neg(), BigInt.zero(), BigInt.zero(), timestamp, blockNumber)

	let request = loadWithdrawRequest(changetype<Address>(user), requestId, changetype<Address>(providerSource.source))
	if (request) applyRequestDebtDelta(request, amount.neg(), BigInt.zero(), BigInt.zero(), timestamp, blockNumber)
}

export function recordBadCreditLineDebt(
	provider: Bytes,
	affiliate: Bytes,
	user: Bytes,
	requestId: BigInt,
	amount: BigInt,
	timestamp: BigInt,
	blockNumber: BigInt,
): void {
	let providerSource = loadExpressProviderSourceFromProvider(provider, timestamp, blockNumber)
	if (!providerSource) return
	let components = loadComponents(providerSource.source, affiliate, providerSource.collateral, null, timestamp, blockNumber)
	applyDebtDelta(components, BigInt.zero(), BigInt.zero(), amount, timestamp, blockNumber)

	let request = loadWithdrawRequest(changetype<Address>(user), requestId, changetype<Address>(providerSource.source))
	if (request) applyRequestDebtDelta(request, BigInt.zero(), BigInt.zero(), amount, timestamp, blockNumber)
}

export function recordClearedCreditLineDebt(
	provider: Bytes,
	affiliate: Bytes,
	user: Bytes,
	requestId: BigInt,
	amount: BigInt,
	wasActivated: boolean,
	timestamp: BigInt,
	blockNumber: BigInt,
): void {
	let providerSource = loadExpressProviderSourceFromProvider(provider, timestamp, blockNumber)
	if (!providerSource) return
	let reservedDelta = wasActivated ? BigInt.zero() : amount.neg()
	let activeDelta = wasActivated ? amount.neg() : BigInt.zero()
	let components = loadComponents(providerSource.source, affiliate, providerSource.collateral, null, timestamp, blockNumber)
	applyDebtDelta(components, reservedDelta, activeDelta, BigInt.zero(), timestamp, blockNumber)

	let request = loadWithdrawRequest(changetype<Address>(user), requestId, changetype<Address>(providerSource.source))
	if (request) applyRequestDebtDelta(request, reservedDelta, activeDelta, BigInt.zero(), timestamp, blockNumber)
}

export function recordRepaidBadCreditLineDebt(provider: Bytes, affiliate: Bytes, amount: BigInt, timestamp: BigInt, blockNumber: BigInt): void {
	let providerSource = loadExpressProviderSourceFromProvider(provider, timestamp, blockNumber)
	if (!providerSource) return
	let components = loadComponents(providerSource.source, affiliate, providerSource.collateral, null, timestamp, blockNumber)
	applyDebtDelta(components, BigInt.zero(), BigInt.zero(), amount.neg(), timestamp, blockNumber)
}

function resyncPendingRequestForAccount(request: WithdrawRequest, account: Account, timestamp: BigInt, blockNumber: BigInt): void {
	if (!isOpenWithdrawRequest(request)) return

	let classicAmount = zeroIfNull(request.classicAmount)
	let expressAmount = zeroIfNull(request.expressAmount)
	let virtualAmount = zeroIfNull(request.virtualAmount)
	let advancedAmount = zeroIfNull(request.advancedAmount)

	applyWithdrawRequestRecordDelta(
		request,
		classicAmount.neg(),
		expressAmount.neg(),
		virtualAmount.neg(),
		advancedAmount.neg(),
		timestamp,
		blockNumber,
	)
	setWithdrawRequestAffiliateExpressWithdrawComponentRefs(request, account, request.source)
	applyWithdrawRequestRecordDelta(request, classicAmount, expressAmount, virtualAmount, advancedAmount, timestamp, blockNumber)
	request.save()
}

function resyncPendingRequestsFromLookup(
	lookup: WithdrawRequestAccountLookup | null,
	account: Account,
	timestamp: BigInt,
	blockNumber: BigInt,
): void {
	if (!lookup) return
	for (let i = 0; i < lookup.activeRequestIds.length; i++) {
		let request = WithdrawRequest.load(lookup.activeRequestIds[i])
		if (request) resyncPendingRequestForAccount(request, account, timestamp, blockNumber)
	}
}

export function syncAffiliateExpressWithdrawAccountPendingRequests(
	account: Account,
	previousSource: Bytes | null,
	timestamp: BigInt,
	blockNumber: BigInt,
): void {
	let currentSource = sourceForAccount(account, null)
	if (previousSource !== null) {
		resyncPendingRequestsFromLookup(loadWithdrawRequestAccountLookup(account.account, previousSource), account, timestamp, blockNumber)
	}
	if (currentSource !== null && (previousSource === null || currentSource.toHexString() != previousSource.toHexString())) {
		resyncPendingRequestsFromLookup(loadWithdrawRequestAccountLookup(account.account, currentSource), account, timestamp, blockNumber)
	}
}
