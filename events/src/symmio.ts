import {
  ActiveEmergencyMode as ActiveEmergencyModeEvent,
  AddSymbol as AddSymbolEvent,
  DeactiveEmergencyMode as DeactiveEmergencyModeEvent,
  DeregisterPartyB as DeregisterPartyBEvent,
  PauseAccounting as PauseAccountingEvent,
  PauseGlobal as PauseGlobalEvent,
  PauseLiquidation as PauseLiquidationEvent,
  PausePartyAActions as PausePartyAActionsEvent,
  PausePartyBActions as PausePartyBActionsEvent,
  RegisterPartyB as RegisterPartyBEvent,
  RoleGranted as RoleGrantedEvent,
  RoleRevoked as RoleRevokedEvent,
  SetBalanceLimitPerUser as SetBalanceLimitPerUserEvent,
  SetCollateral as SetCollateralEvent,
  SetDeallocateCooldown as SetDeallocateCooldownEvent,
  SetFeeCollector as SetFeeCollectorEvent,
  SetForceCancelCloseCooldown as SetForceCancelCloseCooldownEvent,
  SetForceCancelCooldown as SetForceCancelCooldownEvent,
  SetForceCloseCooldowns as SetForceCloseCooldownEvent,
  SetForceCloseGapRatio as SetForceCloseGapRatioEvent,
  SetLiquidationTimeout as SetLiquidationTimeoutEvent,
  SetLiquidatorShare as SetLiquidatorShareEvent,
  SetMuonConfig as SetMuonConfigEvent,
  SetMuonIds as SetMuonIdsEvent,
  SetPartyBEmergencyStatus as SetPartyBEmergencyStatusEvent,
  SetPendingQuotesValidLength as SetPendingQuotesValidLengthEvent,
  SetSuspendedAddress as SetSuspendedAddressEvent,
  SetSymbolAcceptableValues as SetSymbolAcceptableValuesEvent,
  SetSymbolFundingState as SetSymbolFundingStateEvent,
  SetSymbolMaxLeverage as SetSymbolMaxLeverageEvent,
  SetSymbolMaxSlippage as SetSymbolMaxSlippageEvent,
  SetSymbolTradingFee as SetSymbolTradingFeeEvent,
  SetSymbolValidationState as SetSymbolValidationStateEvent,
  UnpauseAccounting as UnpauseAccountingEvent,
  UnpauseGlobal as UnpauseGlobalEvent,
  UnpauseLiquidation as UnpauseLiquidationEvent,
  UnpausePartyAActions as UnpausePartyAActionsEvent,
  UnpausePartyBActions as UnpausePartyBActionsEvent,
  DisputeForLiquidation as DisputeForLiquidationEvent,
  FullyLiquidatedPartyB as FullyLiquidatedPartyBEvent,
  LiquidatePartyA as LiquidatePartyAEvent,
  LiquidatePartyB as LiquidatePartyBEvent,
  LiquidatePendingPositionsPartyA as LiquidatePendingPositionsPartyAEvent,
  LiquidatePositionsPartyA as LiquidatePositionsPartyAEvent,
  LiquidatePositionsPartyB as LiquidatePositionsPartyBEvent,
  LiquidationDisputed as LiquidationDisputedEvent,
  SetSymbolsPrices as SetSymbolsPricesEvent,
  SettlePartyALiquidation as SettlePartyALiquidationEvent,
  ExpireQuoteOpen as ExpireQuoteOpenEvent,
  ExpireQuoteClose as ExpireQuoteCloseEvent,
  ForceCancelCloseRequest as ForceCancelCloseRequestEvent,
  ForceCancelQuote as ForceCancelQuoteEvent,
  ForceClosePosition as ForceClosePositionEvent,
  RequestToCancelCloseRequest as RequestToCancelCloseRequestEvent,
  RequestToCancelQuote as RequestToCancelQuoteEvent,
  RequestToClosePosition as RequestToClosePositionEvent,
  SendQuote as SendQuoteEvent,
  AllocateForPartyB as AllocateForPartyBEvent,
  AllocatePartyA as AllocatePartyAEvent,
  DeallocateForPartyB as DeallocateForPartyBEvent,
  DeallocatePartyA as DeallocatePartyAEvent,
  Deposit as DepositEvent,
  TransferAllocation as TransferAllocationEvent,
  Withdraw as WithdrawEvent,
  AcceptCancelCloseRequest as AcceptCancelCloseRequestEvent,
  AcceptCancelRequest as AcceptCancelRequestEvent,
  AllocatePartyB as AllocatePartyBEvent,
  ChargeFundingRate as ChargeFundingRateEvent,
  EmergencyClosePosition as EmergencyClosePositionEvent,
  FillCloseRequest as FillCloseRequestEvent,
  LockQuote as LockQuoteEvent,
  OpenPosition as OpenPositionEvent,
  UnlockQuote as UnlockQuoteEvent,
  RegisterAffiliate as RegisterAffiliateEvent,
  DeregisterAffiliate as DeregisterAffiliateEvent,
  AddBridge as AddBridgeEvent,
  RemoveBridge as RemoveBridgeEvent,
  TransferToBridge as TransferToBridgeEvent,
  WithdrawReceivedBridgeValue as WithdrawReceivedBridgeValueEvent,
  WithdrawReceivedBridgeValues as WithdrawReceivedBridgeValuesEvent,
  SuspendBridgeTransaction as SuspendBridgeTransactionEvent,
  RestoreBridgeTransaction as RestoreBridgeTransactionEvent,
  SetInvalidBridgedAmountsPool as SetInvalidBridgedAmountsPoolEvent,
  InternalTransfer as InternalTransferEvent,
  DeferredLiquidatePartyA as DeferredLiquidatePartyAEvent
} from "../generated/symmio/symmio"
import {
  ActiveEmergencyMode,
  AddSymbol,
  DeactiveEmergencyMode,
  DeregisterPartyB,
  PauseAccounting,
  PauseGlobal,
  PauseLiquidation,
  PausePartyAActionsE,
  PausePartyBActionsE,
  RegisterPartyB,
  RoleGranted,
  RoleRevoked,
  SetBalanceLimitPerUser,
  SetCollateral,
  SetDeallocateCooldown,
  SetFeeCollector,
  SetForceCancelCloseCooldown,
  SetForceCancelCooldown,
  SetForceCloseCooldown,
  SetForceCloseGapRatio,
  SetLiquidationTimeout,
  SetLiquidatorShare,
  SetMuonConfig,
  SetMuonIdsE,
  SetPartyBEmergencyStatusE,
  SetPendingQuotesValidLength,
  SetSuspendedAddressE,
  SetSymbolAcceptableValuesE,
  SetSymbolFundingState,
  SetSymbolMaxLeverage,
  SetSymbolMaxSlippage,
  SetSymbolTradingFee,
  SetSymbolValidationState,
  UnpauseAccounting,
  UnpauseGlobal,
  UnpauseLiquidation,
  UnpausePartyAActionsE,
  UnpausePartyBActionsE,
  DisputeForLiquidation,
  FullyLiquidatedPartyB,
  LiquidatePartyA,
  LiquidatePartyB,
  LiquidatePendingPositionsPartyA,
  LiquidatePositionsPartyA,
  LiquidatePositionsPartyB,
  LiquidationDisputed,
  SetSymbolsPricesE,
  SettlePartyALiquidation,
  ForceCancelCloseRequest,
  ForceCancelQuote,
  ForceClosePosition,
  RequestToCancelCloseRequest,
  RequestToCancelQuote,
  RequestToClosePosition,
  SendQuote,
  AllocateForPartyB,
  AllocatePartyA,
  DeallocateForPartyB,
  DeallocatePartyA,
  Deposit,
  TransferAllocation,
  Withdraw,
  AcceptCancelCloseRequest,
  AcceptCancelRequest,
  AllocatePartyB,
  ChargeFundingRate,
  EmergencyClosePosition,
  FillCloseRequest,
  LockQuote,
  OpenPosition,
  UnlockQuote,
  CounterId,
  ExpireQuoteOpen,
  ExpireQuoteClose,
  DeregisterAffiliate,
  AddBridge,
  RemoveBridge,
  TransferToBridge,
  WithdrawReceivedBridgeValue,
  WithdrawReceivedBridgeValues,
  SuspendBridgeTransaction,
  RestoreBridgeTransaction,
  SetInvalidBridgedAmountsPool,
  InternalTransfer,
  DeferredLiquidatePartyA,
  RegisterAffiliate
} from "../generated/schema"
import { bigIntToArr, bytesToArr } from "./helper"
import { BigInt } from "@graphprotocol/graph-ts"
export function handleActiveEmergencyMode(
  event: ActiveEmergencyModeEvent
): void {
  let entity = new ActiveEmergencyMode(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )

  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.counterId = cId.eventId
  entity.action = "ActiveEmergencyMode"
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleAddSymbol(event: AddSymbolEvent): void {
  let entity = new AddSymbol(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "AddSymbol"

  entity.counterId = cId.eventId
  entity.symbolId = event.params.symbolId
  entity.name = event.params.name
  entity.minAcceptableQuoteValue = event.params.minAcceptableQuoteValue
  entity.minAcceptablePortionLF = event.params.minAcceptablePortionLF
  entity.tradingFee = event.params.tradingFee
  entity.maxLeverage = event.params.maxLeverage
  entity.fundingRateEpochDuration = event.params.fundingRateEpochDuration
  entity.fundingRateWindowTime = event.params.fundingRateWindowTime

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleDeactiveEmergencyMode(
  event: DeactiveEmergencyModeEvent
): void {
  let entity = new DeactiveEmergencyMode(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "DeactiveEmergencyMode"
  entity.counterId = cId.eventId
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleSettlePartyALiquidation(
  event: SettlePartyALiquidationEvent
): void {
  let entity = new SettlePartyALiquidation(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "SettlePartyALiquidationEvent"
  entity.counterId = cId.eventId
  entity.amounts = event.params.amounts
  entity.liquidationId = event.params.liquidationId
  entity.partyA = event.params.partyA
  entity.partyBs = bytesToArr(event.params.partyBs)
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleDeregisterPartyB(event: DeregisterPartyBEvent): void {
  let entity = new DeregisterPartyB(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "DeregisterPartyB"
  entity.counterId = cId.eventId
  entity.partyB = event.params.partyB
  entity.index = event.params.index

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handlePauseAccounting(event: PauseAccountingEvent): void {
  let entity = new PauseAccounting(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "PauseAccounting"
  entity.counterId = cId.eventId
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handlePauseGlobal(event: PauseGlobalEvent): void {
  let entity = new PauseGlobal(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "PauseGlobal"
  entity.counterId = cId.eventId
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handlePauseLiquidation(event: PauseLiquidationEvent): void {
  let entity = new PauseLiquidation(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "PauseLiquidation"
  entity.counterId = cId.eventId
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handlePausePartyAActions(event: PausePartyAActionsEvent): void {
  let entity = new PausePartyAActionsE(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "PausePartyAActions"
  entity.counterId = cId.eventId
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handlePausePartyBActions(event: PausePartyBActionsEvent): void {
  let entity = new PausePartyBActionsE(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "PausePartyBActions"
  entity.counterId = cId.eventId
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleRegisterPartyB(event: RegisterPartyBEvent): void {
  let entity = new RegisterPartyB(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "RegisterPartyB"
  entity.counterId = cId.eventId
  entity.partyB = event.params.partyB

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleRoleGranted(event: RoleGrantedEvent): void {
  let entity = new RoleGranted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "RoleGranted"
  entity.counterId = cId.eventId
  entity.role = event.params.role
  entity.user = event.params.user

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleRoleRevoked(event: RoleRevokedEvent): void {
  let entity = new RoleRevoked(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "RoleRevoked"
  entity.counterId = cId.eventId
  entity.role = event.params.role
  entity.user = event.params.user

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleSetBalanceLimitPerUser(
  event: SetBalanceLimitPerUserEvent
): void {
  let entity = new SetBalanceLimitPerUser(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "SetBalanceLimitPerUser"
  entity.counterId = cId.eventId
  entity.balanceLimitPerUser = event.params.balanceLimitPerUser

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleSetCollateral(event: SetCollateralEvent): void {
  let entity = new SetCollateral(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "SetCollateral"
  entity.counterId = cId.eventId
  entity.collateral = event.params.collateral

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleSetDeallocateCooldown(
  event: SetDeallocateCooldownEvent
): void {
  let entity = new SetDeallocateCooldown(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "SetDeallocateCooldown"
  entity.counterId = cId.eventId
  entity.oldDeallocateCooldown = event.params.oldDeallocateCooldown
  entity.newDeallocateCooldown = event.params.newDeallocateCooldown

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleSetFeeCollector(event: SetFeeCollectorEvent): void {
  let entity = new SetFeeCollector(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "SetFeeCollector"
  entity.counterId = cId.eventId
  entity.oldFeeCollector = event.params.oldFeeCollector
  entity.newFeeCollector = event.params.newFeeCollector
  entity.affiliate = event.params.affiliate

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleSetForceCancelCloseCooldown(
  event: SetForceCancelCloseCooldownEvent
): void {
  let entity = new SetForceCancelCloseCooldown(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "SetForceCancelCloseCooldown"
  entity.counterId = cId.eventId
  entity.oldForceCancelCloseCooldown = event.params.oldForceCancelCloseCooldown
  entity.newForceCancelCloseCooldown = event.params.newForceCancelCloseCooldown

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleSetForceCancelCooldown(
  event: SetForceCancelCooldownEvent
): void {
  let entity = new SetForceCancelCooldown(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "SetForceCancelCooldown"
  entity.counterId = cId.eventId
  entity.oldForceCancelCooldown = event.params.oldForceCancelCooldown
  entity.newForceCancelCooldown = event.params.newForceCancelCooldown

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleSetForceCloseCooldowns(
  event: SetForceCloseCooldownEvent
): void {
  let entity = new SetForceCloseCooldown(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "SetForceCloseCooldown"
  entity.counterId = cId.eventId
  entity.newForceCloseFirstCooldown = event.params.newForceCloseFirstCooldown
  entity.newForceCloseSecondCooldown = event.params.newForceCloseSecondCooldown
  entity.oldForceCloseFirstCooldown = event.params.oldForceCloseFirstCooldown
  entity.oldForceCloseSecondCooldown = event.params.oldForceCloseSecondCooldown

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleSetForceCloseGapRatio(
  event: SetForceCloseGapRatioEvent
): void {
  let entity = new SetForceCloseGapRatio(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "SetForceCloseGapRatio"
  entity.counterId = cId.eventId
  entity.oldForceCloseGapRatio = event.params.oldForceCloseGapRatio
  entity.newForceCloseGapRatio = event.params.newForceCloseGapRatio
  entity.symbolId = event.params.symbolId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleSetLiquidationTimeout(
  event: SetLiquidationTimeoutEvent
): void {
  let entity = new SetLiquidationTimeout(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "SetLiquidationTimeout"
  entity.counterId = cId.eventId
  entity.oldLiquidationTimeout = event.params.oldLiquidationTimeout
  entity.newLiquidationTimeout = event.params.newLiquidationTimeout

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleSetLiquidatorShare(event: SetLiquidatorShareEvent): void {
  let entity = new SetLiquidatorShare(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "SetLiquidatorShare"
  entity.counterId = cId.eventId
  entity.oldLiquidatorShare = event.params.oldLiquidatorShare
  entity.newLiquidatorShare = event.params.newLiquidatorShare

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleSetMuonConfig(event: SetMuonConfigEvent): void {
  let entity = new SetMuonConfig(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "SetMuonConfig"
  entity.counterId = cId.eventId
  entity.upnlValidTime = event.params.upnlValidTime
  entity.priceValidTime = event.params.priceValidTime

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleSetMuonIds(event: SetMuonIdsEvent): void {
  let entity = new SetMuonIdsE(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "SetMuonIds"
  entity.counterId = cId.eventId
  entity.muonAppId = event.params.muonAppId
  entity.gateway = event.params.gateway
  entity.x = event.params.x
  entity.parity = event.params.parity

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleSetPartyBEmergencyStatus(
  event: SetPartyBEmergencyStatusEvent
): void {
  let entity = new SetPartyBEmergencyStatusE(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "SetPartyBEmergencyStatus"
  entity.counterId = cId.eventId
  entity.partyB = event.params.partyB
  entity.status = event.params.status

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleSetPendingQuotesValidLength(
  event: SetPendingQuotesValidLengthEvent
): void {
  let entity = new SetPendingQuotesValidLength(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "SetPendingQuotesValidLength"
  entity.counterId = cId.eventId
  entity.oldPendingQuotesValidLength = event.params.oldPendingQuotesValidLength
  entity.newPendingQuotesValidLength = event.params.newPendingQuotesValidLength

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleSetSuspendedAddress(
  event: SetSuspendedAddressEvent
): void {
  let entity = new SetSuspendedAddressE(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "SetSuspendedAddress"
  entity.counterId = cId.eventId
  entity.user = event.params.user
  entity.isSuspended = event.params.isSuspended

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleSetSymbolAcceptableValues(
  event: SetSymbolAcceptableValuesEvent
): void {
  let entity = new SetSymbolAcceptableValuesE(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "SetSymbolAcceptableValues"
  entity.counterId = cId.eventId
  entity.symbolId = event.params.symbolId
  entity.oldMinAcceptableQuoteValue = event.params.oldMinAcceptableQuoteValue
  entity.oldMinAcceptablePortionLF = event.params.oldMinAcceptablePortionLF
  entity.minAcceptableQuoteValue = event.params.minAcceptableQuoteValue
  entity.minAcceptablePortionLF = event.params.minAcceptablePortionLF

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleSetSymbolFundingState(
  event: SetSymbolFundingStateEvent
): void {
  let entity = new SetSymbolFundingState(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "SetSymbolFundingState"
  entity.counterId = cId.eventId
  entity.symbolId = event.params.symbolId
  entity.fundingRateEpochDuration = event.params.fundingRateEpochDuration
  entity.fundingRateWindowTime = event.params.fundingRateWindowTime

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleSetSymbolMaxLeverage(
  event: SetSymbolMaxLeverageEvent
): void {
  let entity = new SetSymbolMaxLeverage(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "SetSymbolMaxLeverage"
  entity.counterId = cId.eventId
  entity.symbolId = event.params.symbolId
  entity.oldMaxLeverage = event.params.oldMaxLeverage
  entity.maxLeverage = event.params.maxLeverage

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleSetSymbolMaxSlippage(
  event: SetSymbolMaxSlippageEvent
): void {
  let entity = new SetSymbolMaxSlippage(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "SetSymbolMaxSlippage"
  entity.counterId = cId.eventId
  entity.symbolId = event.params.symbolId
  entity.oldMaxSlippage = event.params.oldMaxSlippage
  entity.maxSlippage = event.params.maxSlippage

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleSetSymbolTradingFee(
  event: SetSymbolTradingFeeEvent
): void {
  let entity = new SetSymbolTradingFee(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "SetSymbolTradingFee"
  entity.counterId = cId.eventId
  entity.symbolId = event.params.symbolId
  entity.oldTradingFee = event.params.oldTradingFee
  entity.tradingFee = event.params.tradingFee

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleSetSymbolValidationState(
  event: SetSymbolValidationStateEvent
): void {
  let entity = new SetSymbolValidationState(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "SetSymbolValidationState"
  entity.counterId = cId.eventId
  entity.symbolId = event.params.symbolId
  entity.oldState = event.params.oldState
  entity.isValid = event.params.isValid

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleUnpauseAccounting(event: UnpauseAccountingEvent): void {
  let entity = new UnpauseAccounting(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "UnpauseAccounting"
  entity.counterId = cId.eventId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleUnpauseGlobal(event: UnpauseGlobalEvent): void {
  let entity = new UnpauseGlobal(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "handleUnpauseGlobal"
  entity.counterId = cId.eventId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleUnpauseLiquidation(event: UnpauseLiquidationEvent): void {
  let entity = new UnpauseLiquidation(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "UnpauseLiquidation"
  entity.counterId = cId.eventId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleUnpausePartyAActions(
  event: UnpausePartyAActionsEvent
): void {
  let entity = new UnpausePartyAActionsE(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "UnpausePartyAActions"
  entity.counterId = cId.eventId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleUnpausePartyBActions(
  event: UnpausePartyBActionsEvent
): void {
  let entity = new UnpausePartyBActionsE(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "UnpausePartyBActions"
  entity.counterId = cId.eventId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleDisputeForLiquidation(
  event: DisputeForLiquidationEvent
): void {
  let entity = new DisputeForLiquidation(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "DisputeForLiquidation"
  entity.counterId = cId.eventId
  entity.liquidator = event.params.liquidator
  entity.partyA = event.params.partyA
  entity.liquidationId = event.params.liquidationId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleFullyLiquidatedPartyB(
  event: FullyLiquidatedPartyBEvent
): void {
  let entity = new FullyLiquidatedPartyB(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "FullyLiquidatedPartyB"
  entity.counterId = cId.eventId
  entity.partyB = event.params.partyB
  entity.partyA = event.params.partyA

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleLiquidatePartyA(event: LiquidatePartyAEvent): void {
  let entity = new LiquidatePartyA(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "LiquidatePartyA"
  entity.counterId = cId.eventId
  entity.liquidator = event.params.liquidator
  entity.partyA = event.params.partyA
  entity.totalUnrealizedLoss = event.params.totalUnrealizedLoss
  entity.upnl = event.params.upnl
  entity.allocatedBalance = event.params.allocatedBalance
  entity.liquidationId = event.params.liquidationId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleLiquidatePartyB(event: LiquidatePartyBEvent): void {
  let entity = new LiquidatePartyB(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "LiquidatePartyB"
  entity.counterId = cId.eventId
  entity.liquidator = event.params.liquidator
  entity.partyB = event.params.partyB
  entity.partyA = event.params.partyA
  entity.upnl = event.params.upnl
  entity.partyBAllocatedBalance = event.params.partyBAllocatedBalance

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleLiquidatePendingPositionsPartyA(
  event: LiquidatePendingPositionsPartyAEvent
): void {
  let entity = new LiquidatePendingPositionsPartyA(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "LiquidatePendingPositionsPartyA"
  entity.counterId = cId.eventId
  entity.liquidator = event.params.liquidator
  entity.partyA = event.params.partyA
  entity.liquidatedAmounts = event.params.liquidatedAmounts
  entity.quoteIds = event.params.quoteIds
  entity.liquidationId = event.params.liquidationId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleLiquidatePositionsPartyA(
  event: LiquidatePositionsPartyAEvent
): void {
  let entity = new LiquidatePositionsPartyA(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "LiquidatePositionsPartyA"
  entity.counterId = cId.eventId
  entity.liquidator = event.params.liquidator
  entity.partyA = event.params.partyA
  entity.quoteIds = event.params.quoteIds
  entity.closeIds = event.params.closeIds
  entity.liquidatedAmounts = event.params.liquidatedAmounts
  entity.liquidationId = event.params.liquidationId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleLiquidatePositionsPartyB(
  event: LiquidatePositionsPartyBEvent
): void {
  let entity = new LiquidatePositionsPartyB(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "LiquidatePositionsPartyB"
  entity.counterId = cId.eventId
  entity.liquidator = event.params.liquidator
  entity.partyB = event.params.partyB
  entity.partyA = event.params.partyA
  entity.quoteIds = bigIntToArr(event.params.quoteIds)
  entity.closeIds = event.params.closeIds
  entity.liquidatedAmounts = event.params.liquidatedAmounts

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleLiquidationDisputed(
  event: LiquidationDisputedEvent
): void {
  let entity = new LiquidationDisputed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "LiquidationDisputed"
  entity.counterId = cId.eventId
  entity.partyA = event.params.partyA

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleSetSymbolsPrices(event: SetSymbolsPricesEvent): void {
  let entity = new SetSymbolsPricesE(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "SetSymbolsPrices"
  entity.counterId = cId.eventId
  entity.liquidator = event.params.liquidator
  entity.partyA = event.params.partyA
  entity.symbolIds = bigIntToArr(event.params.symbolIds)
  entity.prices = bigIntToArr(event.params.prices)
  entity.liquidationId = event.params.liquidationId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleOldSettlePartyALiquidation(
  event: SettlePartyALiquidationEvent
): void {
  let entity = new SettlePartyALiquidation(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "SettlePartyALiquidation"
  entity.counterId = cId.eventId
  entity.partyA = event.params.partyA
  entity.partyBs = bytesToArr(event.params.partyBs)
  entity.amounts = bigIntToArr(event.params.amounts)
  entity.liquidationId = event.params.liquidationId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleExpireQuoteOpen(event: ExpireQuoteOpenEvent): void {
  let entity = new ExpireQuoteOpen(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "ExpireQuote"
  entity.counterId = cId.eventId
  entity.quoteStatus = event.params.quoteStatus
  entity.quoteId = event.params.quoteId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleExpireQuoteClose(event: ExpireQuoteCloseEvent): void {
  let entity = new ExpireQuoteClose(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "ExpireQuote"
  entity.counterId = cId.eventId
  entity.quoteStatus = event.params.quoteStatus
  entity.quoteId = event.params.quoteId
  entity.closeId = event.params.closeId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleForceCancelCloseRequest(
  event: ForceCancelCloseRequestEvent
): void {
  let entity = new ForceCancelCloseRequest(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "ForceCancelCloseRequest"
  entity.counterId = cId.eventId
  entity.quoteId = event.params.quoteId
  entity.quoteStatus = event.params.quoteStatus
  entity.closeId = event.params.closeId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleForceCancelQuote(event: ForceCancelQuoteEvent): void {
  let entity = new ForceCancelQuote(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "ForceCancelQuote"
  entity.counterId = cId.eventId
  entity.quoteId = event.params.quoteId
  entity.quoteStatus = event.params.quoteStatus

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleForceClosePosition(event: ForceClosePositionEvent): void {
  let entity = new ForceClosePosition(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "ForceClosePosition"
  entity.counterId = cId.eventId
  entity.quoteId = event.params.quoteId
  entity.partyA = event.params.partyA
  entity.partyB = event.params.partyB
  entity.filledAmount = event.params.filledAmount
  entity.closedPrice = event.params.closedPrice
  entity.quoteStatus = event.params.quoteStatus
  entity.closeId = event.params.closeId
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleRequestToCancelCloseRequest(
  event: RequestToCancelCloseRequestEvent
): void {
  let entity = new RequestToCancelCloseRequest(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "RequestToCancelCloseRequest"
  entity.counterId = cId.eventId
  entity.partyA = event.params.partyA
  entity.partyB = event.params.partyB
  entity.quoteId = event.params.quoteId
  entity.quoteStatus = event.params.quoteStatus
  entity.closeId = event.params.closeId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleRequestToCancelQuote(
  event: RequestToCancelQuoteEvent
): void {
  let entity = new RequestToCancelQuote(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "RequestToCancelQuote"
  entity.counterId = cId.eventId
  entity.partyA = event.params.partyA
  entity.partyB = event.params.partyB
  entity.quoteStatus = event.params.quoteStatus
  entity.quoteId = event.params.quoteId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleRequestToClosePosition(
  event: RequestToClosePositionEvent
): void {
  let entity = new RequestToClosePosition(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "RequestToClosePosition"
  entity.counterId = cId.eventId
  entity.partyA = event.params.partyA
  entity.partyB = event.params.partyB
  entity.quoteId = event.params.quoteId
  entity.closePrice = event.params.closePrice
  entity.quantityToClose = event.params.quantityToClose
  entity.orderType = event.params.orderType
  entity.deadline = event.params.deadline
  entity.quoteStatus = event.params.quoteStatus
  entity.closeId = event.params.closeId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleSendQuote(event: SendQuoteEvent): void {
  let entity = new SendQuote(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "SendQuote"
  entity.counterId = cId.eventId
  entity.partyA = event.params.partyA
  entity.quoteId = event.params.quoteId
  entity.partyBsWhiteList = bytesToArr(event.params.partyBsWhiteList)
  entity.symbolId = event.params.symbolId
  entity.positionType = event.params.positionType
  entity.orderType = event.params.orderType
  entity.price = event.params.price
  entity.marketPrice = event.params.marketPrice
  entity.quantity = event.params.quantity
  entity.cva = event.params.cva
  entity.lf = event.params.lf
  entity.partyAmm = event.params.partyAmm
  entity.partyBmm = event.params.partyBmm
  entity.deadline = event.params.deadline

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash

  if (event.block.number.ge(BigInt.fromI32(34693893))) {
    entity.tradingFee = event.params.tradingFee
  }

  entity.save()
}

export function handleAllocateForPartyB(event: AllocateForPartyBEvent): void {
  let entity = new AllocateForPartyB(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "AllocateForPartyB"
  entity.counterId = cId.eventId
  entity.partyB = event.params.partyB
  entity.partyA = event.params.partyA
  entity.amount = event.params.amount
  entity.newAllocatedBalance = event.params.newAllocatedBalance

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleAllocatePartyA(event: AllocatePartyAEvent): void {
  let entity = new AllocatePartyA(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "AllocatePartyA"
  entity.counterId = cId.eventId
  entity.user = event.params.user
  entity.amount = event.params.amount
  entity.newAllocatedBalance = event.params.newAllocatedBalance

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleDeallocateForPartyB(
  event: DeallocateForPartyBEvent
): void {
  let entity = new DeallocateForPartyB(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "DeallocateForPartyB"
  entity.counterId = cId.eventId
  entity.partyB = event.params.partyB
  entity.partyA = event.params.partyA
  entity.amount = event.params.amount
  entity.newAllocatedBalance = event.params.newAllocatedBalance

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleDeallocatePartyA(event: DeallocatePartyAEvent): void {
  let entity = new DeallocatePartyA(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "DeallocatePartyA"
  entity.counterId = cId.eventId
  entity.user = event.params.user
  entity.amount = event.params.amount
  entity.newAllocatedBalance = event.params.newAllocatedBalance

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleDeposit(event: DepositEvent): void {
  let entity = new Deposit(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "Deposit"
  entity.counterId = cId.eventId
  entity.sender = event.params.sender
  entity.user = event.params.user
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleTransferAllocation(event: TransferAllocationEvent): void {
  let entity = new TransferAllocation(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "TransferAllocation"
  entity.counterId = cId.eventId
  entity.amount = event.params.amount
  entity.origin = event.params.origin
  entity.recipient = event.params.recipient

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleWithdraw(event: WithdrawEvent): void {
  let entity = new Withdraw(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "Withdraw"
  entity.counterId = cId.eventId
  entity.sender = event.params.sender
  entity.user = event.params.user
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleAcceptCancelCloseRequest(
  event: AcceptCancelCloseRequestEvent
): void {
  let entity = new AcceptCancelCloseRequest(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "AcceptCancelCloseRequest"
  entity.counterId = cId.eventId
  entity.quoteId = event.params.quoteId
  entity.quoteStatus = event.params.quoteStatus
  entity.closeId = event.params.closeId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleAcceptCancelRequest(
  event: AcceptCancelRequestEvent
): void {
  let entity = new AcceptCancelRequest(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "AcceptCancelRequest"
  entity.counterId = cId.eventId
  entity.quoteId = event.params.quoteId
  entity.quoteStatus = event.params.quoteStatus

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleAllocatePartyB(event: AllocatePartyBEvent): void {
  let entity = new AllocatePartyB(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "AllocatePartyB"
  entity.counterId = cId.eventId
  entity.partyB = event.params.partyB
  entity.partyA = event.params.partyA
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleChargeFundingRate(event: ChargeFundingRateEvent): void {
  let entity = new ChargeFundingRate(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "ChargeFundingRate"
  entity.counterId = cId.eventId
  entity.partyB = event.params.partyB
  entity.partyA = event.params.partyA
  entity.quoteIds = bigIntToArr(event.params.quoteIds)
  entity.rates = bigIntToArr(event.params.rates)

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleEmergencyClosePosition(
  event: EmergencyClosePositionEvent
): void {
  let entity = new EmergencyClosePosition(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "EmergencyClosePosition"
  entity.counterId = cId.eventId
  entity.quoteId = event.params.quoteId
  entity.partyA = event.params.partyA
  entity.partyB = event.params.partyB
  entity.filledAmount = event.params.filledAmount
  entity.closedPrice = event.params.closedPrice
  entity.quoteStatus = event.params.quoteStatus
  entity.closeId = event.params.closeId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleFillCloseRequest(event: FillCloseRequestEvent): void {
  let entity = new FillCloseRequest(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "FillCloseRequest"
  entity.counterId = cId.eventId
  entity.quoteId = event.params.quoteId
  entity.partyA = event.params.partyA
  entity.partyB = event.params.partyB
  entity.filledAmount = event.params.filledAmount
  entity.closedPrice = event.params.closedPrice
  entity.quoteStatus = event.params.quoteStatus
  entity.closeId = event.params.closeId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleLockQuote(event: LockQuoteEvent): void {
  let entity = new LockQuote(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "LockQuote"
  entity.counterId = cId.eventId
  entity.partyB = event.params.partyB
  entity.quoteId = event.params.quoteId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleOpenPosition(event: OpenPositionEvent): void {
  let entity = new OpenPosition(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "OpenPosition"
  entity.counterId = cId.eventId
  entity.quoteId = event.params.quoteId
  entity.partyA = event.params.partyA
  entity.partyB = event.params.partyB
  entity.filledAmount = event.params.filledAmount
  entity.openedPrice = event.params.openedPrice

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleUnlockQuote(event: UnlockQuoteEvent): void {
  let entity = new UnlockQuote(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "UnlockQuote"
  entity.counterId = cId.eventId
  entity.partyB = event.params.partyB
  entity.quoteId = event.params.quoteId
  entity.quoteStatus = event.params.quoteStatus

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}



export function handleRegisterAffiliate(event: RegisterAffiliateEvent): void {
  let entity = new RegisterAffiliate(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "RegisterAffiliate"
  entity.counterId = cId.eventId
  entity.affilate = event.params.affilate

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleDeregisterAffiliate(event: DeregisterAffiliateEvent): void {
  let entity = new DeregisterAffiliate(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "DeregisterAffiliate"
  entity.counterId = cId.eventId
  entity.affilate = event.params.affilate

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleAddBridge(event: AddBridgeEvent): void {
  let entity = new AddBridge(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "AddBridge"
  entity.counterId = cId.eventId
  entity.bridge = event.params.bridge
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleRemoveBridge(event: RemoveBridgeEvent): void {
  let entity = new RemoveBridge(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "RemoveBridge"
  entity.counterId = cId.eventId
  entity.bridge = event.params.bridge
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleTransferToBridge(event: TransferToBridgeEvent): void {
  let entity = new TransferToBridge(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "TransferToBridge"
  entity.counterId = cId.eventId
  entity.amount = event.params.amount
  entity.bridgeAddress = event.params.bridgeAddress
  entity.transactionId = event.params.transactionId
  entity.user = event.params.user
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleWithdrawReceivedBridgeValue(event: WithdrawReceivedBridgeValueEvent): void {
  let entity = new WithdrawReceivedBridgeValue(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "WithdrawReceivedBridgeValue"
  entity.counterId = cId.eventId
  entity.transactionId = event.params.transactionId
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleWithdrawReceivedBridgeValues(event: WithdrawReceivedBridgeValuesEvent): void {
  let entity = new WithdrawReceivedBridgeValues(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "WithdrawReceivedBridgeValues"
  entity.counterId = cId.eventId
  entity.transactionIds = event.params.transactionIds
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleSuspendBridgeTransaction(event: SuspendBridgeTransactionEvent): void {
  let entity = new SuspendBridgeTransaction(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "SuspendBridgeTransaction"
  entity.counterId = cId.eventId
  entity.transactionId = event.params.transactionId
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleRestoreBridgeTransaction(event: RestoreBridgeTransactionEvent): void {
  let entity = new RestoreBridgeTransaction(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "RestoreBridgeTransaction"
  entity.counterId = cId.eventId
  entity.transactionId = event.params.transactionId
  entity.validAmount = event.params.validAmount
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleSetInvalidBridgedAmountsPool(event: SetInvalidBridgedAmountsPoolEvent): void {
  let entity = new SetInvalidBridgedAmountsPool(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "SetInvalidBridgedAmountsPool"
  entity.counterId = cId.eventId
  entity.newInvalidBridgedAmountsPool = event.params.newInvalidBridgedAmountsPool
  entity.oldInvalidBridgedAmountsPool = event.params.oldInvalidBridgedAmountsPool
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleInternalTransfer(event: InternalTransferEvent): void {
  let entity = new InternalTransfer(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "InternalTransfer"
  entity.counterId = cId.eventId
  entity.amount = event.params.amount
  entity.sender = event.params.sender
  entity.user = event.params.user
  entity.userNewAllocatedBalance = event.params.userNewAllocatedBalance
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}

export function handleDeferredLiquidatePartyA(event: DeferredLiquidatePartyAEvent): void {
  let entity = new DeferredLiquidatePartyA(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let cId = CounterId.load("main")
  if (!cId) {
    cId = new CounterId("main")
    cId.eventId = 0
  }
  cId.eventId += 1;
  cId.save()
  entity.action = "DeferredLiquidatePartyA"
  entity.counterId = cId.eventId
  entity.allocatedBalance = event.params.allocatedBalance
  entity.liquidationAllocatedBalance = event.params.liquidationAllocatedBalance
  entity.liquidationBlockNumber = event.params.liquidationBlockNumber
  entity.liquidationId = event.params.liquidationId
  entity.liquidationTimestamp = event.params.liquidationTimestamp
  entity.liquidator = event.params.liquidator
  entity.partyA = event.params.partyA
  entity.totalUnrealizedLoss = event.params.totalUnrealizedLoss
  entity.upnl = event.params.upnl
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.logIndex = event.logIndex
  entity.blockHash = event.block.hash
  entity.save()
}
