import {ADLCloseHandler} from './handlers/symmio/ADLCloseHandler'
import {ADLClose} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {AcceptCancelCloseRequestHandler} from './handlers/symmio/AcceptCancelCloseRequestHandler'
import {AcceptCancelCloseRequest} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {AcceptCancelRequestHandler} from './handlers/symmio/AcceptCancelRequestHandler'
import {AcceptCancelRequest} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {AcceptVirtualExternalTransferHandler} from './handlers/symmio/AcceptVirtualExternalTransferHandler'
import {AcceptVirtualExternalTransfer} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {AccumulatedFundingActivatedHandler} from './handlers/symmio/AccumulatedFundingActivatedHandler'
import {AccumulatedFundingActivated} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {ActivateCrossPartyBHandler} from './handlers/symmio/ActivateCrossPartyBHandler'
import {ActivateCrossPartyB} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {ActivateInstantActionModeHandler} from './handlers/symmio/ActivateInstantActionModeHandler'
import {ActivateInstantActionMode} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {ActiveEmergencyModeHandler} from './handlers/symmio/ActiveEmergencyModeHandler'
import {ActiveEmergencyMode} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {AddBridgeHandler} from './handlers/symmio/AddBridgeHandler'
import {AddBridge} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {AddRelayerForExternalTransferTargetHandler} from './handlers/symmio/AddRelayerForExternalTransferTargetHandler'
import {AddRelayerForExternalTransferTarget} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {AddSymbolHandler} from './handlers/symmio/AddSymbolHandler'
import {AddSymbol} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {AllocateForPartyBHandler} from './handlers/symmio/AllocateForPartyBHandler'
import {AllocateForPartyB} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {AllocatePartyAHandler} from './handlers/symmio/AllocatePartyAHandler'
import {AllocatePartyA} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {AllocatePartyBHandler} from './handlers/symmio/AllocatePartyBHandler'
import {AllocatePartyB} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {AutoTakeoverPartyALiquidationHandler} from './handlers/symmio/AutoTakeoverPartyALiquidationHandler'
import {AutoTakeoverPartyALiquidation} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {BalanceChangePartyAHandler} from './handlers/symmio/BalanceChangePartyAHandler'
import {BalanceChangePartyA} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {BalanceChangePartyBHandler} from './handlers/symmio/BalanceChangePartyBHandler'
import {BalanceChangePartyB} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {BindToPartyBHandler} from './handlers/symmio/BindToPartyBHandler'
import {BindToPartyB} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {BlacklistSymbolsHandler} from './handlers/symmio/BlacklistSymbolsHandler'
import {BlacklistSymbols} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {CancelUnbindRequestHandler} from './handlers/symmio/CancelUnbindRequestHandler'
import {CancelUnbindRequest} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {CancelVirtualExternalTransferHandler} from './handlers/symmio/CancelVirtualExternalTransferHandler'
import {CancelVirtualExternalTransfer} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {ChargeAccumulatedFundingFeeHandler} from './handlers/symmio/ChargeAccumulatedFundingFeeHandler'
import {ChargeAccumulatedFundingFee} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {ChargeFundingRateHandler} from './handlers/symmio/ChargeFundingRateHandler'
import {ChargeFundingRate} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {CompleteUnbindRequestHandler} from './handlers/symmio/CompleteUnbindRequestHandler'
import {CompleteUnbindRequest} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {CrossLockedValuesMigratedHandler} from './handlers/symmio/CrossLockedValuesMigratedHandler'
import {CrossLockedValuesMigrated} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {DeactivateInstantActionModeHandler} from './handlers/symmio/DeactivateInstantActionModeHandler'
import {DeactivateInstantActionMode} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {DeactiveEmergencyModeHandler} from './handlers/symmio/DeactiveEmergencyModeHandler'
import {DeactiveEmergencyMode} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {DeallocateForClearingHouseHandler} from './handlers/symmio/DeallocateForClearingHouseHandler'
import {DeallocateForClearingHouse} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {DeallocateForPartyBHandler} from './handlers/symmio/DeallocateForPartyBHandler'
import {DeallocateForPartyB} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {DeallocatePartyAHandler} from './handlers/symmio/DeallocatePartyAHandler'
import {DeallocatePartyA} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {DeallocateSuspendedUserHandler} from './handlers/symmio/DeallocateSuspendedUserHandler'
import {DeallocateSuspendedUser} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {DeferredLiquidatePartyAHandler} from './handlers/symmio/DeferredLiquidatePartyAHandler'
import {DeferredLiquidatePartyA} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {DepositHandler} from './handlers/symmio/DepositHandler'
import {DepositToReserveVaultHandler} from './handlers/symmio/DepositToReserveVaultHandler'
import {DepositToReserveVault} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {DepositVirtualFundsHandler} from './handlers/symmio/DepositVirtualFundsHandler'
import {DepositVirtualFunds} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {Deposit} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {DeregisterAffiliateHandler} from './handlers/symmio/DeregisterAffiliateHandler'
import {DeregisterAffiliate} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {DeregisterPartyBHandler} from './handlers/symmio/DeregisterPartyBHandler'
import {DeregisterPartyB} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {DisputeForLiquidationHandler} from './handlers/symmio/DisputeForLiquidationHandler'
import {DisputeForLiquidation} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {DistributeForClearingHouseHandler} from './handlers/symmio/DistributeForClearingHouseHandler'
import {DistributeForClearingHouse} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {EmergencyClosePositionHandler} from './handlers/symmio/EmergencyClosePositionHandler'
import {EmergencyClosePosition} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {ExpireQuoteCloseHandler} from './handlers/symmio/ExpireQuoteCloseHandler'
import {ExpireQuoteClose} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {ExpireQuoteOpenHandler} from './handlers/symmio/ExpireQuoteOpenHandler'
import {ExpireQuoteOpen} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {ExternalTransferHandler} from './handlers/symmio/ExternalTransferHandler'
import {ExternalTransfer} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {FillCloseRequestHandler} from './handlers/symmio/FillCloseRequestHandler'
import {FillCloseRequest} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {ForceCancelCloseRequestHandler} from './handlers/symmio/ForceCancelCloseRequestHandler'
import {ForceCancelCloseRequest} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {ForceCancelQuoteHandler} from './handlers/symmio/ForceCancelQuoteHandler'
import {ForceCancelQuote} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {ForceCloseInitializedHandler} from './handlers/symmio/ForceCloseInitializedHandler'
import {ForceCloseInitialized} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {ForceClosePartyBInsolventHandler} from './handlers/symmio/ForceClosePartyBInsolventHandler'
import {ForceClosePartyBInsolvent} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {ForceClosePositionHandler} from './handlers/symmio/ForceClosePositionHandler'
import {ForceClosePosition} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {ForceFetchAllocatedHandler} from './handlers/symmio/ForceFetchAllocatedHandler'
import {ForceFetchAllocated} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {FullyLiquidatedPartyAHandler} from './handlers/symmio/FullyLiquidatedPartyAHandler'
import {FullyLiquidatedPartyA} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {FullyLiquidatedPartyBHandler} from './handlers/symmio/FullyLiquidatedPartyBHandler'
import {FullyLiquidatedPartyB} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {InitiateVirtualExternalTransferHandler} from './handlers/symmio/InitiateVirtualExternalTransferHandler'
import {InitiateVirtualExternalTransfer} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {InternalTransferHandler} from './handlers/symmio/InternalTransferHandler'
import {InternalTransferToBalanceHandler} from './handlers/symmio/InternalTransferToBalanceHandler'
import {InternalTransferToBalance} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {InternalTransfer} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {LegacyFundingDeprecatedHandler} from './handlers/symmio/LegacyFundingDeprecatedHandler'
import {LegacyFundingDeprecated} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {LegacyWithdrawalDeprecatedHandler} from './handlers/symmio/LegacyWithdrawalDeprecatedHandler'
import {LegacyWithdrawalDeprecated} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {LiquidateCrossPartyBHandler} from './handlers/symmio/LiquidateCrossPartyBHandler'
import {LiquidateCrossPartyB} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {LiquidatePartyAHandler} from './handlers/symmio/LiquidatePartyAHandler'
import {LiquidatePartyA} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {LiquidatePartyBHandler} from './handlers/symmio/LiquidatePartyBHandler'
import {LiquidatePartyB} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {LiquidatePendingPositionsForClearingHouseHandler} from './handlers/symmio/LiquidatePendingPositionsForClearingHouseHandler'
import {LiquidatePendingPositionsForClearingHouse} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {LiquidatePendingPositionsPartyAHandler} from './handlers/symmio/LiquidatePendingPositionsPartyAHandler'
import {LiquidatePendingPositionsPartyA} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {LiquidatePositionsForClearingHouseHandler} from './handlers/symmio/LiquidatePositionsForClearingHouseHandler'
import {LiquidatePositionsForClearingHouse} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {LiquidatePositionsPartyAHandler} from './handlers/symmio/LiquidatePositionsPartyAHandler'
import {LiquidatePositionsPartyA} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {LiquidatePositionsPartyBHandler} from './handlers/symmio/LiquidatePositionsPartyBHandler'
import {LiquidatePositionsPartyB} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {LiquidationDisputedHandler} from './handlers/symmio/LiquidationDisputedHandler'
import {LiquidationDisputed} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {LockQuoteHandler} from './handlers/symmio/LockQuoteHandler'
import {LockQuote} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {OpenPositionHandler} from './handlers/symmio/OpenPositionHandler'
import {OpenPosition} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {PauseAccountingHandler} from './handlers/symmio/PauseAccountingHandler'
import {PauseAccounting} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {PauseExternalTransferHandler} from './handlers/symmio/PauseExternalTransferHandler'
import {PauseExternalTransfer} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {PauseGlobalHandler} from './handlers/symmio/PauseGlobalHandler'
import {PauseGlobal} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {PauseInstantLayerHandler} from './handlers/symmio/PauseInstantLayerHandler'
import {PauseInstantLayer} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {PauseInternalTransferHandler} from './handlers/symmio/PauseInternalTransferHandler'
import {PauseInternalTransfer} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {PauseLiquidationHandler} from './handlers/symmio/PauseLiquidationHandler'
import {PauseLiquidation} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {PausePartyAActionsHandler} from './handlers/symmio/PausePartyAActionsHandler'
import {PausePartyAActions} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {PausePartyBActionsHandler} from './handlers/symmio/PausePartyBActionsHandler'
import {PausePartyBActions} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {PausePartyBOpenPositionsHandler} from './handlers/symmio/PausePartyBOpenPositionsHandler'
import {PausePartyBOpenPositions} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {PledgeCollateralDepositedHandler} from './handlers/symmio/PledgeCollateralDepositedHandler'
import {PledgeCollateralDeposited} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {PledgeWithdrawApprovedHandler} from './handlers/symmio/PledgeWithdrawApprovedHandler'
import {PledgeWithdrawApproved} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {PledgeWithdrawCancelledHandler} from './handlers/symmio/PledgeWithdrawCancelledHandler'
import {PledgeWithdrawCancelled} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {PledgeWithdrawRequestedHandler} from './handlers/symmio/PledgeWithdrawRequestedHandler'
import {PledgeWithdrawRequested} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {ProposeToDeactivateInstantActionModeHandler} from './handlers/symmio/ProposeToDeactivateInstantActionModeHandler'
import {ProposeToDeactivateInstantActionMode} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {QuotesMigratedHandler} from './handlers/symmio/QuotesMigratedHandler'
import {QuotesMigrated} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {RegisterAffiliateHandler} from './handlers/symmio/RegisterAffiliateHandler'
import {RegisterAffiliate} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {RegisterExpressProviderHandler} from './handlers/symmio/RegisterExpressProviderHandler'
import {RegisterExpressProvider} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {RegisterHookHandler} from './handlers/symmio/RegisterHookHandler'
import {RegisterHook} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {RegisterPartyBHandler} from './handlers/symmio/RegisterPartyBHandler'
import {RegisterPartyB} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {RegisterVirtualProviderHandler} from './handlers/symmio/RegisterVirtualProviderHandler'
import {RegisterVirtualProvider} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {RemoveBridgeHandler} from './handlers/symmio/RemoveBridgeHandler'
import {RemoveBridge} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {RemoveRelayerForExternalTransferTargetHandler} from './handlers/symmio/RemoveRelayerForExternalTransferTargetHandler'
import {RemoveRelayerForExternalTransferTarget} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {RemoveSymbolTypeFromWhitelistHandler} from './handlers/symmio/RemoveSymbolTypeFromWhitelistHandler'
import {RemoveSymbolTypeFromWhitelist} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {RemoveSymbolsFromBlacklistHandler} from './handlers/symmio/RemoveSymbolsFromBlacklistHandler'
import {RemoveSymbolsFromBlacklist} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {RemoveSymbolsFromWhitelistHandler} from './handlers/symmio/RemoveSymbolsFromWhitelistHandler'
import {RemoveSymbolsFromWhitelist} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {RequestToCancelCloseRequestHandler} from './handlers/symmio/RequestToCancelCloseRequestHandler'
import {RequestToCancelCloseRequest} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {RequestToCancelQuoteHandler} from './handlers/symmio/RequestToCancelQuoteHandler'
import {RequestToCancelQuote} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {RequestToClosePositionHandler} from './handlers/symmio/RequestToClosePositionHandler'
import {RequestToClosePosition} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {RequestToUnbindFromPartyBHandler} from './handlers/symmio/RequestToUnbindFromPartyBHandler'
import {RequestToUnbindFromPartyB} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {ResolveLiquidationDisputeHandler} from './handlers/symmio/ResolveLiquidationDisputeHandler'
import {ResolveLiquidationDispute} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {RestoreBridgeTransactionHandler} from './handlers/symmio/RestoreBridgeTransactionHandler'
import {RestoreBridgeTransaction} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {RoleAdminAddedHandler} from './handlers/symmio/RoleAdminAddedHandler'
import {RoleAdminAdded} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {RoleAdminRemovedHandler} from './handlers/symmio/RoleAdminRemovedHandler'
import {RoleAdminRemoved} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {RoleGrantedHandler} from './handlers/symmio/RoleGrantedHandler'
import {RoleGranted} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {RoleRevokedHandler} from './handlers/symmio/RoleRevokedHandler'
import {RoleRevoked} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {SendQuoteHandler} from './handlers/symmio/SendQuoteHandler'
import {SendQuote} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {SetADLEnabledHandler} from './handlers/symmio/SetADLEnabledHandler'
import {SetADLEnabled} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {SetAffiliateFeeForUserHandler} from './handlers/symmio/SetAffiliateFeeForUserHandler'
import {SetAffiliateFeeForUser} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {SetAffiliateFeeHandler} from './handlers/symmio/SetAffiliateFeeHandler'
import {SetAffiliateFee} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {SetBalanceLimitPerUserHandler} from './handlers/symmio/SetBalanceLimitPerUserHandler'
import {SetBalanceLimitPerUser} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {SetCollateralHandler} from './handlers/symmio/SetCollateralHandler'
import {SetCollateral} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {SetCrossPartyBHandler} from './handlers/symmio/SetCrossPartyBHandler'
import {SetCrossPartyBModeActivatedHandler} from './handlers/symmio/SetCrossPartyBModeActivatedHandler'
import {SetCrossPartyBModeActivated} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {SetCrossPartyB} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {SetDeallocateCooldownHandler} from './handlers/symmio/SetDeallocateCooldownHandler'
import {SetDeallocateCooldown} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {SetDeallocateDebounceTimeHandler} from './handlers/symmio/SetDeallocateDebounceTimeHandler'
import {SetDeallocateDebounceTime} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {SetDefaultFeeCollectorHandler} from './handlers/symmio/SetDefaultFeeCollectorHandler'
import {SetDefaultFeeCollector} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {SetEntityMetadataHandler} from './handlers/symmio/SetEntityMetadataHandler'
import {SetEntityMetadata} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {SetEpochDurationHandler} from './handlers/symmio/SetEpochDurationHandler'
import {SetEpochDuration} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {SetFeeCollectorHandler} from './handlers/symmio/SetFeeCollectorHandler'
import {SetFeeCollector} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {SetForceCancelCloseCooldownHandler} from './handlers/symmio/SetForceCancelCloseCooldownHandler'
import {SetForceCancelCloseCooldown} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {SetForceCancelCooldownHandler} from './handlers/symmio/SetForceCancelCooldownHandler'
import {SetForceCancelCooldown} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {SetForceCloseCooldownsHandler} from './handlers/symmio/SetForceCloseCooldownsHandler'
import {SetForceCloseCooldowns} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {SetForceCloseGapRatioHandler} from './handlers/symmio/SetForceCloseGapRatioHandler'
import {SetForceCloseGapRatio} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {SetForceCloseMinSigPeriodHandler} from './handlers/symmio/SetForceCloseMinSigPeriodHandler'
import {SetForceCloseMinSigPeriod} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {SetForceClosePricePenaltyHandler} from './handlers/symmio/SetForceClosePricePenaltyHandler'
import {SetForceClosePricePenalty} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {SetInvalidBridgedAmountsPoolHandler} from './handlers/symmio/SetInvalidBridgedAmountsPoolHandler'
import {SetInvalidBridgedAmountsPool} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {SetLegacyDeallocateDeprecatedHandler} from './handlers/symmio/SetLegacyDeallocateDeprecatedHandler'
import {SetLegacyDeallocateDeprecated} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {SetLiquidationInsuranceVaultParamsHandler} from './handlers/symmio/SetLiquidationInsuranceVaultParamsHandler'
import {SetLiquidationInsuranceVaultParams} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {SetLiquidationTimeoutHandler} from './handlers/symmio/SetLiquidationTimeoutHandler'
import {SetLiquidationTimeout} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {SetLiquidatorShareHandler} from './handlers/symmio/SetLiquidatorShareHandler'
import {SetLiquidatorShare} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {SetLongFundingFeeHandler} from './handlers/symmio/SetLongFundingFeeHandler'
import {SetLongFundingFee} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {SetMaxPartyAConnectionLimitHandler} from './handlers/symmio/SetMaxPartyAConnectionLimitHandler'
import {SetMaxPartyAConnectionLimit} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {SetMaxWithdrawPartsHandler} from './handlers/symmio/SetMaxWithdrawPartsHandler'
import {SetMaxWithdrawParts} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {SetMinAffiliateFeeHandler} from './handlers/symmio/SetMinAffiliateFeeHandler'
import {SetMinAffiliateFee} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {SetMinWithdrawCooldownHandler} from './handlers/symmio/SetMinWithdrawCooldownHandler'
import {SetMinWithdrawCooldown} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {SetMuonConfigHandler} from './handlers/symmio/SetMuonConfigHandler'
import {SetMuonConfig} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {SetMuonIdsHandler} from './handlers/symmio/SetMuonIdsHandler'
import {SetMuonIds} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {SetPartyBBindableHandler} from './handlers/symmio/SetPartyBBindableHandler'
import {SetPartyBBindable} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {SetPartyBEmergencyStatusHandler} from './handlers/symmio/SetPartyBEmergencyStatusHandler'
import {SetPartyBEmergencyStatus} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {SetPendingQuotesValidLengthHandler} from './handlers/symmio/SetPendingQuotesValidLengthHandler'
import {SetPendingQuotesValidLength} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {SetPureVirtualCancelBlackoutHandler} from './handlers/symmio/SetPureVirtualCancelBlackoutHandler'
import {SetPureVirtualCancelBlackout} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {SetSettlementCooldownHandler} from './handlers/symmio/SetSettlementCooldownHandler'
import {SetSettlementCooldown} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {SetShortFundingFeeHandler} from './handlers/symmio/SetShortFundingFeeHandler'
import {SetShortFundingFee} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {SetSignatureVerifierAddressHandler} from './handlers/symmio/SetSignatureVerifierAddressHandler'
import {SetSignatureVerifierAddress} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {SetSoftLiquidationPenaltyCollectorHandler} from './handlers/symmio/SetSoftLiquidationPenaltyCollectorHandler'
import {SetSoftLiquidationPenaltyCollector} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {SetSpeedUpUserHandler} from './handlers/symmio/SetSpeedUpUserHandler'
import {SetSpeedUpUser} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {SetSuspendedAddressHandler} from './handlers/symmio/SetSuspendedAddressHandler'
import {SetSuspendedAddress} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {SetSymbolAcceptableValuesHandler} from './handlers/symmio/SetSymbolAcceptableValuesHandler'
import {SetSymbolAcceptableValues} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {SetSymbolFundingStateHandler} from './handlers/symmio/SetSymbolFundingStateHandler'
import {SetSymbolFundingState} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {SetSymbolMaxLeverageHandler} from './handlers/symmio/SetSymbolMaxLeverageHandler'
import {SetSymbolMaxLeverage} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {SetSymbolTradingFeeHandler} from './handlers/symmio/SetSymbolTradingFeeHandler'
import {SetSymbolTradingFee} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {SetSymbolTypeHandler} from './handlers/symmio/SetSymbolTypeHandler'
import {SetSymbolType} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {SetSymbolValidationStateHandler} from './handlers/symmio/SetSymbolValidationStateHandler'
import {SetSymbolValidationState} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {SetSymbolsPricesHandler} from './handlers/symmio/SetSymbolsPricesHandler'
import {SetSymbolsPrices} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {SetUnbindCooldownHandler} from './handlers/symmio/SetUnbindCooldownHandler'
import {SetUnbindCooldown} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {SetWithdrawCooldownPeriodHandler} from './handlers/symmio/SetWithdrawCooldownPeriodHandler'
import {SetWithdrawCooldownPeriod} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {SettleCrossPartyBLiquidationHandler} from './handlers/symmio/SettleCrossPartyBLiquidationHandler'
import {SettleCrossPartyBLiquidation} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {SettlePartyALiquidationHandler} from './handlers/symmio/SettlePartyALiquidationHandler'
import {SettlePartyALiquidation} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {SettlePartyATakeoverHandler} from './handlers/symmio/SettlePartyATakeoverHandler'
import {SettlePartyATakeover} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {SettleUpnlHandler} from './handlers/symmio/SettleUpnlHandler'
import {SettleUpnlUnifiedHandler} from './handlers/symmio/SettleUpnlUnifiedHandler'
import {SettleUpnlUnified} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {SettleUpnl} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {SignerSetHandler} from './handlers/symmio/SignerSetHandler'
import {SignerSet} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {SoftPartyBLiquidationHandler} from './handlers/symmio/SoftPartyBLiquidationHandler'
import {SoftPartyBLiquidation} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {SuspendBridgeTransactionHandler} from './handlers/symmio/SuspendBridgeTransactionHandler'
import {SuspendBridgeTransaction} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {TakeoverPartyALiquidationHandler} from './handlers/symmio/TakeoverPartyALiquidationHandler'
import {TakeoverPartyALiquidation} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {TradeVolumeRecordedHandler} from './handlers/symmio/TradeVolumeRecordedHandler'
import {TradeVolumeRecorded} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {TradingFeeChargedHandler} from './handlers/symmio/TradingFeeChargedHandler'
import {TradingFeeCharged} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {TransferAllocationHandler} from './handlers/symmio/TransferAllocationHandler'
import {TransferAllocation} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {TransferToBridgeHandler} from './handlers/symmio/TransferToBridgeHandler'
import {TransferToBridge} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {UnlockQuoteHandler} from './handlers/symmio/UnlockQuoteHandler'
import {UnlockQuote} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {UnpauseAccountingHandler} from './handlers/symmio/UnpauseAccountingHandler'
import {UnpauseAccounting} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {UnpauseExternalTransferHandler} from './handlers/symmio/UnpauseExternalTransferHandler'
import {UnpauseExternalTransfer} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {UnpauseGlobalHandler} from './handlers/symmio/UnpauseGlobalHandler'
import {UnpauseGlobal} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {UnpauseInstantLayerHandler} from './handlers/symmio/UnpauseInstantLayerHandler'
import {UnpauseInstantLayer} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {UnpauseInternalTransferHandler} from './handlers/symmio/UnpauseInternalTransferHandler'
import {UnpauseInternalTransfer} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {UnpauseLiquidationHandler} from './handlers/symmio/UnpauseLiquidationHandler'
import {UnpauseLiquidation} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {UnpausePartyAActionsHandler} from './handlers/symmio/UnpausePartyAActionsHandler'
import {UnpausePartyAActions} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {UnpausePartyBActionsHandler} from './handlers/symmio/UnpausePartyBActionsHandler'
import {UnpausePartyBActions} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {UnpausePartyBOpenPositionsHandler} from './handlers/symmio/UnpausePartyBOpenPositionsHandler'
import {UnpausePartyBOpenPositions} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {UnregisterExpressProviderHandler} from './handlers/symmio/UnregisterExpressProviderHandler'
import {UnregisterExpressProvider} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {UnregisterVirtualProviderHandler} from './handlers/symmio/UnregisterVirtualProviderHandler'
import {UnregisterVirtualProvider} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {UpdateAccumulatedFundingFeeHandler} from './handlers/symmio/UpdateAccumulatedFundingFeeHandler'
import {UpdateAccumulatedFundingFee} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {UserSlashedHandler} from './handlers/symmio/UserSlashedHandler'
import {UserSlashed} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {Version} from '../common/BaseHandler'
import {WhitelistSymbolTypeHandler} from './handlers/symmio/WhitelistSymbolTypeHandler'
import {WhitelistSymbolType} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {WhitelistSymbolsHandler} from './handlers/symmio/WhitelistSymbolsHandler'
import {WhitelistSymbols} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {WithdrawAcceptedHandler} from './handlers/symmio/WithdrawAcceptedHandler'
import {WithdrawAccepted} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {WithdrawCancelRequestedHandler} from './handlers/symmio/WithdrawCancelRequestedHandler'
import {WithdrawCancelRequested} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {WithdrawCancelledHandler} from './handlers/symmio/WithdrawCancelledHandler'
import {WithdrawCancelled} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {WithdrawFinalizedHandler} from './handlers/symmio/WithdrawFinalizedHandler'
import {WithdrawFinalized} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {WithdrawFromReserveVaultHandler} from './handlers/symmio/WithdrawFromReserveVaultHandler'
import {WithdrawFromReserveVault} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {WithdrawHandler} from './handlers/symmio/WithdrawHandler'
import {WithdrawInitiatedHandler} from './handlers/symmio/WithdrawInitiatedHandler'
import {WithdrawInitiated} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {WithdrawReceivedBridgeValueHandler} from './handlers/symmio/WithdrawReceivedBridgeValueHandler'
import {WithdrawReceivedBridgeValuesHandler} from './handlers/symmio/WithdrawReceivedBridgeValuesHandler'
import {WithdrawReceivedBridgeValues} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {WithdrawReceivedBridgeValue} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {WithdrawRejectedHandler} from './handlers/symmio/WithdrawRejectedHandler'
import {WithdrawRejected} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {WithdrawSpeedUpAcceptedHandler} from './handlers/symmio/WithdrawSpeedUpAcceptedHandler'
import {WithdrawSpeedUpAccepted} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {WithdrawSuspendedHandler} from './handlers/symmio/WithdrawSuspendedHandler'
import {WithdrawSuspendedUserHandler} from './handlers/symmio/WithdrawSuspendedUserHandler'
import {WithdrawSuspendedUser} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {WithdrawSuspended} from '../../generated/symmio_0_8_5/symmio_0_8_5'
import {Withdraw} from '../../generated/symmio_0_8_5/symmio_0_8_5'


export function handleADLClose(event: ADLClose): void {
    let handler = new ADLCloseHandler<ADLClose>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleAcceptCancelCloseRequest(event: AcceptCancelCloseRequest): void {
    let handler = new AcceptCancelCloseRequestHandler<AcceptCancelCloseRequest>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleAcceptCancelRequest(event: AcceptCancelRequest): void {
    let handler = new AcceptCancelRequestHandler<AcceptCancelRequest>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleAcceptVirtualExternalTransfer(event: AcceptVirtualExternalTransfer): void {
    let handler = new AcceptVirtualExternalTransferHandler<AcceptVirtualExternalTransfer>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleAccumulatedFundingActivated(event: AccumulatedFundingActivated): void {
    let handler = new AccumulatedFundingActivatedHandler<AccumulatedFundingActivated>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleActivateCrossPartyB(event: ActivateCrossPartyB): void {
    let handler = new ActivateCrossPartyBHandler<ActivateCrossPartyB>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleActivateInstantActionMode(event: ActivateInstantActionMode): void {
    let handler = new ActivateInstantActionModeHandler<ActivateInstantActionMode>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleActiveEmergencyMode(event: ActiveEmergencyMode): void {
    let handler = new ActiveEmergencyModeHandler<ActiveEmergencyMode>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleAddBridge(event: AddBridge): void {
    let handler = new AddBridgeHandler<AddBridge>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleAddRelayerForExternalTransferTarget(event: AddRelayerForExternalTransferTarget): void {
    let handler = new AddRelayerForExternalTransferTargetHandler<AddRelayerForExternalTransferTarget>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleAddSymbol(event: AddSymbol): void {
    let handler = new AddSymbolHandler<AddSymbol>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleAllocateForPartyB(event: AllocateForPartyB): void {
    let handler = new AllocateForPartyBHandler<AllocateForPartyB>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleAllocatePartyA(event: AllocatePartyA): void {
    let handler = new AllocatePartyAHandler<AllocatePartyA>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleAllocatePartyB(event: AllocatePartyB): void {
    let handler = new AllocatePartyBHandler<AllocatePartyB>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleAutoTakeoverPartyALiquidation(event: AutoTakeoverPartyALiquidation): void {
    let handler = new AutoTakeoverPartyALiquidationHandler<AutoTakeoverPartyALiquidation>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleBalanceChangePartyA(event: BalanceChangePartyA): void {
    let handler = new BalanceChangePartyAHandler<BalanceChangePartyA>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleBalanceChangePartyB(event: BalanceChangePartyB): void {
    let handler = new BalanceChangePartyBHandler<BalanceChangePartyB>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleBindToPartyB(event: BindToPartyB): void {
    let handler = new BindToPartyBHandler<BindToPartyB>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleBlacklistSymbols(event: BlacklistSymbols): void {
    let handler = new BlacklistSymbolsHandler<BlacklistSymbols>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleCancelUnbindRequest(event: CancelUnbindRequest): void {
    let handler = new CancelUnbindRequestHandler<CancelUnbindRequest>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleCancelVirtualExternalTransfer(event: CancelVirtualExternalTransfer): void {
    let handler = new CancelVirtualExternalTransferHandler<CancelVirtualExternalTransfer>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleChargeAccumulatedFundingFee(event: ChargeAccumulatedFundingFee): void {
    let handler = new ChargeAccumulatedFundingFeeHandler<ChargeAccumulatedFundingFee>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleChargeFundingRate(event: ChargeFundingRate): void {
    let handler = new ChargeFundingRateHandler<ChargeFundingRate>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleCompleteUnbindRequest(event: CompleteUnbindRequest): void {
    let handler = new CompleteUnbindRequestHandler<CompleteUnbindRequest>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleCrossLockedValuesMigrated(event: CrossLockedValuesMigrated): void {
    let handler = new CrossLockedValuesMigratedHandler<CrossLockedValuesMigrated>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleDeactivateInstantActionMode(event: DeactivateInstantActionMode): void {
    let handler = new DeactivateInstantActionModeHandler<DeactivateInstantActionMode>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleDeactiveEmergencyMode(event: DeactiveEmergencyMode): void {
    let handler = new DeactiveEmergencyModeHandler<DeactiveEmergencyMode>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleDeallocateForClearingHouse(event: DeallocateForClearingHouse): void {
    let handler = new DeallocateForClearingHouseHandler<DeallocateForClearingHouse>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleDeallocateForPartyB(event: DeallocateForPartyB): void {
    let handler = new DeallocateForPartyBHandler<DeallocateForPartyB>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleDeallocatePartyA(event: DeallocatePartyA): void {
    let handler = new DeallocatePartyAHandler<DeallocatePartyA>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleDeallocateSuspendedUser(event: DeallocateSuspendedUser): void {
    let handler = new DeallocateSuspendedUserHandler<DeallocateSuspendedUser>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleDeferredLiquidatePartyA(event: DeferredLiquidatePartyA): void {
    let handler = new DeferredLiquidatePartyAHandler<DeferredLiquidatePartyA>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleDeposit(event: Deposit): void {
    let handler = new DepositHandler<Deposit>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleDepositToReserveVault(event: DepositToReserveVault): void {
    let handler = new DepositToReserveVaultHandler<DepositToReserveVault>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleDepositVirtualFunds(event: DepositVirtualFunds): void {
    let handler = new DepositVirtualFundsHandler<DepositVirtualFunds>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleDeregisterAffiliate(event: DeregisterAffiliate): void {
    let handler = new DeregisterAffiliateHandler<DeregisterAffiliate>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleDeregisterPartyB(event: DeregisterPartyB): void {
    let handler = new DeregisterPartyBHandler<DeregisterPartyB>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleDisputeForLiquidation(event: DisputeForLiquidation): void {
    let handler = new DisputeForLiquidationHandler<DisputeForLiquidation>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleDistributeForClearingHouse(event: DistributeForClearingHouse): void {
    let handler = new DistributeForClearingHouseHandler<DistributeForClearingHouse>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleEmergencyClosePosition(event: EmergencyClosePosition): void {
    let handler = new EmergencyClosePositionHandler<EmergencyClosePosition>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleExpireQuoteClose(event: ExpireQuoteClose): void {
    let handler = new ExpireQuoteCloseHandler<ExpireQuoteClose>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleExpireQuoteOpen(event: ExpireQuoteOpen): void {
    let handler = new ExpireQuoteOpenHandler<ExpireQuoteOpen>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleExternalTransfer(event: ExternalTransfer): void {
    let handler = new ExternalTransferHandler<ExternalTransfer>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleFillCloseRequest(event: FillCloseRequest): void {
    let handler = new FillCloseRequestHandler<FillCloseRequest>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleForceCancelCloseRequest(event: ForceCancelCloseRequest): void {
    let handler = new ForceCancelCloseRequestHandler<ForceCancelCloseRequest>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleForceCancelQuote(event: ForceCancelQuote): void {
    let handler = new ForceCancelQuoteHandler<ForceCancelQuote>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleForceCloseInitialized(event: ForceCloseInitialized): void {
    let handler = new ForceCloseInitializedHandler<ForceCloseInitialized>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleForceClosePartyBInsolvent(event: ForceClosePartyBInsolvent): void {
    let handler = new ForceClosePartyBInsolventHandler<ForceClosePartyBInsolvent>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleForceClosePosition(event: ForceClosePosition): void {
    let handler = new ForceClosePositionHandler<ForceClosePosition>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleForceFetchAllocated(event: ForceFetchAllocated): void {
    let handler = new ForceFetchAllocatedHandler<ForceFetchAllocated>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleFullyLiquidatedPartyA(event: FullyLiquidatedPartyA): void {
    let handler = new FullyLiquidatedPartyAHandler<FullyLiquidatedPartyA>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleFullyLiquidatedPartyB(event: FullyLiquidatedPartyB): void {
    let handler = new FullyLiquidatedPartyBHandler<FullyLiquidatedPartyB>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleInitiateVirtualExternalTransfer(event: InitiateVirtualExternalTransfer): void {
    let handler = new InitiateVirtualExternalTransferHandler<InitiateVirtualExternalTransfer>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleInternalTransfer(event: InternalTransfer): void {
    let handler = new InternalTransferHandler<InternalTransfer>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleInternalTransferToBalance(event: InternalTransferToBalance): void {
    let handler = new InternalTransferToBalanceHandler<InternalTransferToBalance>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleLegacyFundingDeprecated(event: LegacyFundingDeprecated): void {
    let handler = new LegacyFundingDeprecatedHandler<LegacyFundingDeprecated>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleLegacyWithdrawalDeprecated(event: LegacyWithdrawalDeprecated): void {
    let handler = new LegacyWithdrawalDeprecatedHandler<LegacyWithdrawalDeprecated>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleLiquidateCrossPartyB(event: LiquidateCrossPartyB): void {
    let handler = new LiquidateCrossPartyBHandler<LiquidateCrossPartyB>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleLiquidatePartyA(event: LiquidatePartyA): void {
    let handler = new LiquidatePartyAHandler<LiquidatePartyA>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleLiquidatePartyB(event: LiquidatePartyB): void {
    let handler = new LiquidatePartyBHandler<LiquidatePartyB>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleLiquidatePendingPositionsForClearingHouse(event: LiquidatePendingPositionsForClearingHouse): void {
    let handler = new LiquidatePendingPositionsForClearingHouseHandler<LiquidatePendingPositionsForClearingHouse>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleLiquidatePendingPositionsPartyA(event: LiquidatePendingPositionsPartyA): void {
    let handler = new LiquidatePendingPositionsPartyAHandler<LiquidatePendingPositionsPartyA>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleLiquidatePositionsForClearingHouse(event: LiquidatePositionsForClearingHouse): void {
    let handler = new LiquidatePositionsForClearingHouseHandler<LiquidatePositionsForClearingHouse>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleLiquidatePositionsPartyA(event: LiquidatePositionsPartyA): void {
    let handler = new LiquidatePositionsPartyAHandler<LiquidatePositionsPartyA>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleLiquidatePositionsPartyB(event: LiquidatePositionsPartyB): void {
    let handler = new LiquidatePositionsPartyBHandler<LiquidatePositionsPartyB>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleLiquidationDisputed(event: LiquidationDisputed): void {
    let handler = new LiquidationDisputedHandler<LiquidationDisputed>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleLockQuote(event: LockQuote): void {
    let handler = new LockQuoteHandler<LockQuote>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleOpenPosition(event: OpenPosition): void {
    let handler = new OpenPositionHandler<OpenPosition>()
    handler.handle(event, Version.v_0_8_5)
}


export function handlePauseAccounting(event: PauseAccounting): void {
    let handler = new PauseAccountingHandler<PauseAccounting>()
    handler.handle(event, Version.v_0_8_5)
}


export function handlePauseExternalTransfer(event: PauseExternalTransfer): void {
    let handler = new PauseExternalTransferHandler<PauseExternalTransfer>()
    handler.handle(event, Version.v_0_8_5)
}


export function handlePauseGlobal(event: PauseGlobal): void {
    let handler = new PauseGlobalHandler<PauseGlobal>()
    handler.handle(event, Version.v_0_8_5)
}


export function handlePauseInstantLayer(event: PauseInstantLayer): void {
    let handler = new PauseInstantLayerHandler<PauseInstantLayer>()
    handler.handle(event, Version.v_0_8_5)
}


export function handlePauseInternalTransfer(event: PauseInternalTransfer): void {
    let handler = new PauseInternalTransferHandler<PauseInternalTransfer>()
    handler.handle(event, Version.v_0_8_5)
}


export function handlePauseLiquidation(event: PauseLiquidation): void {
    let handler = new PauseLiquidationHandler<PauseLiquidation>()
    handler.handle(event, Version.v_0_8_5)
}


export function handlePausePartyAActions(event: PausePartyAActions): void {
    let handler = new PausePartyAActionsHandler<PausePartyAActions>()
    handler.handle(event, Version.v_0_8_5)
}


export function handlePausePartyBActions(event: PausePartyBActions): void {
    let handler = new PausePartyBActionsHandler<PausePartyBActions>()
    handler.handle(event, Version.v_0_8_5)
}


export function handlePausePartyBOpenPositions(event: PausePartyBOpenPositions): void {
    let handler = new PausePartyBOpenPositionsHandler<PausePartyBOpenPositions>()
    handler.handle(event, Version.v_0_8_5)
}


export function handlePledgeCollateralDeposited(event: PledgeCollateralDeposited): void {
    let handler = new PledgeCollateralDepositedHandler<PledgeCollateralDeposited>()
    handler.handle(event, Version.v_0_8_5)
}


export function handlePledgeWithdrawApproved(event: PledgeWithdrawApproved): void {
    let handler = new PledgeWithdrawApprovedHandler<PledgeWithdrawApproved>()
    handler.handle(event, Version.v_0_8_5)
}


export function handlePledgeWithdrawCancelled(event: PledgeWithdrawCancelled): void {
    let handler = new PledgeWithdrawCancelledHandler<PledgeWithdrawCancelled>()
    handler.handle(event, Version.v_0_8_5)
}


export function handlePledgeWithdrawRequested(event: PledgeWithdrawRequested): void {
    let handler = new PledgeWithdrawRequestedHandler<PledgeWithdrawRequested>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleProposeToDeactivateInstantActionMode(event: ProposeToDeactivateInstantActionMode): void {
    let handler = new ProposeToDeactivateInstantActionModeHandler<ProposeToDeactivateInstantActionMode>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleQuotesMigrated(event: QuotesMigrated): void {
    let handler = new QuotesMigratedHandler<QuotesMigrated>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleRegisterAffiliate(event: RegisterAffiliate): void {
    let handler = new RegisterAffiliateHandler<RegisterAffiliate>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleRegisterExpressProvider(event: RegisterExpressProvider): void {
    let handler = new RegisterExpressProviderHandler<RegisterExpressProvider>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleRegisterHook(event: RegisterHook): void {
    let handler = new RegisterHookHandler<RegisterHook>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleRegisterPartyB(event: RegisterPartyB): void {
    let handler = new RegisterPartyBHandler<RegisterPartyB>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleRegisterVirtualProvider(event: RegisterVirtualProvider): void {
    let handler = new RegisterVirtualProviderHandler<RegisterVirtualProvider>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleRemoveBridge(event: RemoveBridge): void {
    let handler = new RemoveBridgeHandler<RemoveBridge>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleRemoveRelayerForExternalTransferTarget(event: RemoveRelayerForExternalTransferTarget): void {
    let handler = new RemoveRelayerForExternalTransferTargetHandler<RemoveRelayerForExternalTransferTarget>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleRemoveSymbolTypeFromWhitelist(event: RemoveSymbolTypeFromWhitelist): void {
    let handler = new RemoveSymbolTypeFromWhitelistHandler<RemoveSymbolTypeFromWhitelist>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleRemoveSymbolsFromBlacklist(event: RemoveSymbolsFromBlacklist): void {
    let handler = new RemoveSymbolsFromBlacklistHandler<RemoveSymbolsFromBlacklist>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleRemoveSymbolsFromWhitelist(event: RemoveSymbolsFromWhitelist): void {
    let handler = new RemoveSymbolsFromWhitelistHandler<RemoveSymbolsFromWhitelist>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleRequestToCancelCloseRequest(event: RequestToCancelCloseRequest): void {
    let handler = new RequestToCancelCloseRequestHandler<RequestToCancelCloseRequest>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleRequestToCancelQuote(event: RequestToCancelQuote): void {
    let handler = new RequestToCancelQuoteHandler<RequestToCancelQuote>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleRequestToClosePosition(event: RequestToClosePosition): void {
    let handler = new RequestToClosePositionHandler<RequestToClosePosition>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleRequestToUnbindFromPartyB(event: RequestToUnbindFromPartyB): void {
    let handler = new RequestToUnbindFromPartyBHandler<RequestToUnbindFromPartyB>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleResolveLiquidationDispute(event: ResolveLiquidationDispute): void {
    let handler = new ResolveLiquidationDisputeHandler<ResolveLiquidationDispute>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleRestoreBridgeTransaction(event: RestoreBridgeTransaction): void {
    let handler = new RestoreBridgeTransactionHandler<RestoreBridgeTransaction>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleRoleAdminAdded(event: RoleAdminAdded): void {
    let handler = new RoleAdminAddedHandler<RoleAdminAdded>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleRoleAdminRemoved(event: RoleAdminRemoved): void {
    let handler = new RoleAdminRemovedHandler<RoleAdminRemoved>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleRoleGranted(event: RoleGranted): void {
    let handler = new RoleGrantedHandler<RoleGranted>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleRoleRevoked(event: RoleRevoked): void {
    let handler = new RoleRevokedHandler<RoleRevoked>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleSendQuote(event: SendQuote): void {
    let handler = new SendQuoteHandler<SendQuote>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleSetADLEnabled(event: SetADLEnabled): void {
    let handler = new SetADLEnabledHandler<SetADLEnabled>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleSetAffiliateFee(event: SetAffiliateFee): void {
    let handler = new SetAffiliateFeeHandler<SetAffiliateFee>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleSetAffiliateFeeForUser(event: SetAffiliateFeeForUser): void {
    let handler = new SetAffiliateFeeForUserHandler<SetAffiliateFeeForUser>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleSetBalanceLimitPerUser(event: SetBalanceLimitPerUser): void {
    let handler = new SetBalanceLimitPerUserHandler<SetBalanceLimitPerUser>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleSetCollateral(event: SetCollateral): void {
    let handler = new SetCollateralHandler<SetCollateral>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleSetCrossPartyB(event: SetCrossPartyB): void {
    let handler = new SetCrossPartyBHandler<SetCrossPartyB>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleSetCrossPartyBModeActivated(event: SetCrossPartyBModeActivated): void {
    let handler = new SetCrossPartyBModeActivatedHandler<SetCrossPartyBModeActivated>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleSetDeallocateCooldown(event: SetDeallocateCooldown): void {
    let handler = new SetDeallocateCooldownHandler<SetDeallocateCooldown>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleSetDeallocateDebounceTime(event: SetDeallocateDebounceTime): void {
    let handler = new SetDeallocateDebounceTimeHandler<SetDeallocateDebounceTime>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleSetDefaultFeeCollector(event: SetDefaultFeeCollector): void {
    let handler = new SetDefaultFeeCollectorHandler<SetDefaultFeeCollector>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleSetEntityMetadata(event: SetEntityMetadata): void {
    let handler = new SetEntityMetadataHandler<SetEntityMetadata>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleSetEpochDuration(event: SetEpochDuration): void {
    let handler = new SetEpochDurationHandler<SetEpochDuration>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleSetFeeCollector(event: SetFeeCollector): void {
    let handler = new SetFeeCollectorHandler<SetFeeCollector>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleSetForceCancelCloseCooldown(event: SetForceCancelCloseCooldown): void {
    let handler = new SetForceCancelCloseCooldownHandler<SetForceCancelCloseCooldown>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleSetForceCancelCooldown(event: SetForceCancelCooldown): void {
    let handler = new SetForceCancelCooldownHandler<SetForceCancelCooldown>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleSetForceCloseCooldowns(event: SetForceCloseCooldowns): void {
    let handler = new SetForceCloseCooldownsHandler<SetForceCloseCooldowns>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleSetForceCloseGapRatio(event: SetForceCloseGapRatio): void {
    let handler = new SetForceCloseGapRatioHandler<SetForceCloseGapRatio>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleSetForceCloseMinSigPeriod(event: SetForceCloseMinSigPeriod): void {
    let handler = new SetForceCloseMinSigPeriodHandler<SetForceCloseMinSigPeriod>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleSetForceClosePricePenalty(event: SetForceClosePricePenalty): void {
    let handler = new SetForceClosePricePenaltyHandler<SetForceClosePricePenalty>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleSetInvalidBridgedAmountsPool(event: SetInvalidBridgedAmountsPool): void {
    let handler = new SetInvalidBridgedAmountsPoolHandler<SetInvalidBridgedAmountsPool>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleSetLegacyDeallocateDeprecated(event: SetLegacyDeallocateDeprecated): void {
    let handler = new SetLegacyDeallocateDeprecatedHandler<SetLegacyDeallocateDeprecated>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleSetLiquidationInsuranceVaultParams(event: SetLiquidationInsuranceVaultParams): void {
    let handler = new SetLiquidationInsuranceVaultParamsHandler<SetLiquidationInsuranceVaultParams>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleSetLiquidationTimeout(event: SetLiquidationTimeout): void {
    let handler = new SetLiquidationTimeoutHandler<SetLiquidationTimeout>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleSetLiquidatorShare(event: SetLiquidatorShare): void {
    let handler = new SetLiquidatorShareHandler<SetLiquidatorShare>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleSetLongFundingFee(event: SetLongFundingFee): void {
    let handler = new SetLongFundingFeeHandler<SetLongFundingFee>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleSetMaxPartyAConnectionLimit(event: SetMaxPartyAConnectionLimit): void {
    let handler = new SetMaxPartyAConnectionLimitHandler<SetMaxPartyAConnectionLimit>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleSetMaxWithdrawParts(event: SetMaxWithdrawParts): void {
    let handler = new SetMaxWithdrawPartsHandler<SetMaxWithdrawParts>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleSetMinAffiliateFee(event: SetMinAffiliateFee): void {
    let handler = new SetMinAffiliateFeeHandler<SetMinAffiliateFee>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleSetMinWithdrawCooldown(event: SetMinWithdrawCooldown): void {
    let handler = new SetMinWithdrawCooldownHandler<SetMinWithdrawCooldown>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleSetMuonConfig(event: SetMuonConfig): void {
    let handler = new SetMuonConfigHandler<SetMuonConfig>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleSetMuonIds(event: SetMuonIds): void {
    let handler = new SetMuonIdsHandler<SetMuonIds>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleSetPartyBBindable(event: SetPartyBBindable): void {
    let handler = new SetPartyBBindableHandler<SetPartyBBindable>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleSetPartyBEmergencyStatus(event: SetPartyBEmergencyStatus): void {
    let handler = new SetPartyBEmergencyStatusHandler<SetPartyBEmergencyStatus>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleSetPendingQuotesValidLength(event: SetPendingQuotesValidLength): void {
    let handler = new SetPendingQuotesValidLengthHandler<SetPendingQuotesValidLength>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleSetPureVirtualCancelBlackout(event: SetPureVirtualCancelBlackout): void {
    let handler = new SetPureVirtualCancelBlackoutHandler<SetPureVirtualCancelBlackout>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleSetSettlementCooldown(event: SetSettlementCooldown): void {
    let handler = new SetSettlementCooldownHandler<SetSettlementCooldown>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleSetShortFundingFee(event: SetShortFundingFee): void {
    let handler = new SetShortFundingFeeHandler<SetShortFundingFee>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleSetSignatureVerifierAddress(event: SetSignatureVerifierAddress): void {
    let handler = new SetSignatureVerifierAddressHandler<SetSignatureVerifierAddress>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleSetSoftLiquidationPenaltyCollector(event: SetSoftLiquidationPenaltyCollector): void {
    let handler = new SetSoftLiquidationPenaltyCollectorHandler<SetSoftLiquidationPenaltyCollector>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleSetSpeedUpUser(event: SetSpeedUpUser): void {
    let handler = new SetSpeedUpUserHandler<SetSpeedUpUser>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleSetSuspendedAddress(event: SetSuspendedAddress): void {
    let handler = new SetSuspendedAddressHandler<SetSuspendedAddress>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleSetSymbolAcceptableValues(event: SetSymbolAcceptableValues): void {
    let handler = new SetSymbolAcceptableValuesHandler<SetSymbolAcceptableValues>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleSetSymbolFundingState(event: SetSymbolFundingState): void {
    let handler = new SetSymbolFundingStateHandler<SetSymbolFundingState>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleSetSymbolMaxLeverage(event: SetSymbolMaxLeverage): void {
    let handler = new SetSymbolMaxLeverageHandler<SetSymbolMaxLeverage>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleSetSymbolTradingFee(event: SetSymbolTradingFee): void {
    let handler = new SetSymbolTradingFeeHandler<SetSymbolTradingFee>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleSetSymbolType(event: SetSymbolType): void {
    let handler = new SetSymbolTypeHandler<SetSymbolType>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleSetSymbolValidationState(event: SetSymbolValidationState): void {
    let handler = new SetSymbolValidationStateHandler<SetSymbolValidationState>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleSetSymbolsPrices(event: SetSymbolsPrices): void {
    let handler = new SetSymbolsPricesHandler<SetSymbolsPrices>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleSetUnbindCooldown(event: SetUnbindCooldown): void {
    let handler = new SetUnbindCooldownHandler<SetUnbindCooldown>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleSetWithdrawCooldownPeriod(event: SetWithdrawCooldownPeriod): void {
    let handler = new SetWithdrawCooldownPeriodHandler<SetWithdrawCooldownPeriod>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleSettleCrossPartyBLiquidation(event: SettleCrossPartyBLiquidation): void {
    let handler = new SettleCrossPartyBLiquidationHandler<SettleCrossPartyBLiquidation>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleSettlePartyALiquidation(event: SettlePartyALiquidation): void {
    let handler = new SettlePartyALiquidationHandler<SettlePartyALiquidation>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleSettlePartyATakeover(event: SettlePartyATakeover): void {
    let handler = new SettlePartyATakeoverHandler<SettlePartyATakeover>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleSettleUpnl(event: SettleUpnl): void {
    let handler = new SettleUpnlHandler<SettleUpnl>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleSettleUpnlUnified(event: SettleUpnlUnified): void {
    let handler = new SettleUpnlUnifiedHandler<SettleUpnlUnified>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleSignerSet(event: SignerSet): void {
    let handler = new SignerSetHandler<SignerSet>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleSoftPartyBLiquidation(event: SoftPartyBLiquidation): void {
    let handler = new SoftPartyBLiquidationHandler<SoftPartyBLiquidation>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleSuspendBridgeTransaction(event: SuspendBridgeTransaction): void {
    let handler = new SuspendBridgeTransactionHandler<SuspendBridgeTransaction>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleTakeoverPartyALiquidation(event: TakeoverPartyALiquidation): void {
    let handler = new TakeoverPartyALiquidationHandler<TakeoverPartyALiquidation>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleTradeVolumeRecorded(event: TradeVolumeRecorded): void {
    let handler = new TradeVolumeRecordedHandler<TradeVolumeRecorded>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleTradingFeeCharged(event: TradingFeeCharged): void {
    let handler = new TradingFeeChargedHandler<TradingFeeCharged>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleTransferAllocation(event: TransferAllocation): void {
    let handler = new TransferAllocationHandler<TransferAllocation>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleTransferToBridge(event: TransferToBridge): void {
    let handler = new TransferToBridgeHandler<TransferToBridge>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleUnlockQuote(event: UnlockQuote): void {
    let handler = new UnlockQuoteHandler<UnlockQuote>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleUnpauseAccounting(event: UnpauseAccounting): void {
    let handler = new UnpauseAccountingHandler<UnpauseAccounting>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleUnpauseExternalTransfer(event: UnpauseExternalTransfer): void {
    let handler = new UnpauseExternalTransferHandler<UnpauseExternalTransfer>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleUnpauseGlobal(event: UnpauseGlobal): void {
    let handler = new UnpauseGlobalHandler<UnpauseGlobal>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleUnpauseInstantLayer(event: UnpauseInstantLayer): void {
    let handler = new UnpauseInstantLayerHandler<UnpauseInstantLayer>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleUnpauseInternalTransfer(event: UnpauseInternalTransfer): void {
    let handler = new UnpauseInternalTransferHandler<UnpauseInternalTransfer>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleUnpauseLiquidation(event: UnpauseLiquidation): void {
    let handler = new UnpauseLiquidationHandler<UnpauseLiquidation>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleUnpausePartyAActions(event: UnpausePartyAActions): void {
    let handler = new UnpausePartyAActionsHandler<UnpausePartyAActions>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleUnpausePartyBActions(event: UnpausePartyBActions): void {
    let handler = new UnpausePartyBActionsHandler<UnpausePartyBActions>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleUnpausePartyBOpenPositions(event: UnpausePartyBOpenPositions): void {
    let handler = new UnpausePartyBOpenPositionsHandler<UnpausePartyBOpenPositions>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleUnregisterExpressProvider(event: UnregisterExpressProvider): void {
    let handler = new UnregisterExpressProviderHandler<UnregisterExpressProvider>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleUnregisterVirtualProvider(event: UnregisterVirtualProvider): void {
    let handler = new UnregisterVirtualProviderHandler<UnregisterVirtualProvider>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleUpdateAccumulatedFundingFee(event: UpdateAccumulatedFundingFee): void {
    let handler = new UpdateAccumulatedFundingFeeHandler<UpdateAccumulatedFundingFee>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleUserSlashed(event: UserSlashed): void {
    let handler = new UserSlashedHandler<UserSlashed>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleWhitelistSymbolType(event: WhitelistSymbolType): void {
    let handler = new WhitelistSymbolTypeHandler<WhitelistSymbolType>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleWhitelistSymbols(event: WhitelistSymbols): void {
    let handler = new WhitelistSymbolsHandler<WhitelistSymbols>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleWithdraw(event: Withdraw): void {
    let handler = new WithdrawHandler<Withdraw>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleWithdrawAccepted(event: WithdrawAccepted): void {
    let handler = new WithdrawAcceptedHandler<WithdrawAccepted>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleWithdrawCancelRequested(event: WithdrawCancelRequested): void {
    let handler = new WithdrawCancelRequestedHandler<WithdrawCancelRequested>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleWithdrawCancelled(event: WithdrawCancelled): void {
    let handler = new WithdrawCancelledHandler<WithdrawCancelled>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleWithdrawFinalized(event: WithdrawFinalized): void {
    let handler = new WithdrawFinalizedHandler<WithdrawFinalized>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleWithdrawFromReserveVault(event: WithdrawFromReserveVault): void {
    let handler = new WithdrawFromReserveVaultHandler<WithdrawFromReserveVault>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleWithdrawInitiated(event: WithdrawInitiated): void {
    let handler = new WithdrawInitiatedHandler<WithdrawInitiated>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleWithdrawReceivedBridgeValue(event: WithdrawReceivedBridgeValue): void {
    let handler = new WithdrawReceivedBridgeValueHandler<WithdrawReceivedBridgeValue>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleWithdrawReceivedBridgeValues(event: WithdrawReceivedBridgeValues): void {
    let handler = new WithdrawReceivedBridgeValuesHandler<WithdrawReceivedBridgeValues>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleWithdrawRejected(event: WithdrawRejected): void {
    let handler = new WithdrawRejectedHandler<WithdrawRejected>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleWithdrawSpeedUpAccepted(event: WithdrawSpeedUpAccepted): void {
    let handler = new WithdrawSpeedUpAcceptedHandler<WithdrawSpeedUpAccepted>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleWithdrawSuspended(event: WithdrawSuspended): void {
    let handler = new WithdrawSuspendedHandler<WithdrawSuspended>()
    handler.handle(event, Version.v_0_8_5)
}


export function handleWithdrawSuspendedUser(event: WithdrawSuspendedUser): void {
    let handler = new WithdrawSuspendedUserHandler<WithdrawSuspendedUser>()
    handler.handle(event, Version.v_0_8_5)
}
