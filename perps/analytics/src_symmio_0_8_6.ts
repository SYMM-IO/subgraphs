import {ethereum} from '@graphprotocol/graph-ts'
import {handleLatestAccountBalanceBlock as handleLatestAccountBalanceBlockImpl} from './src_latest_account_balance_block'
import {BalanceChangePartyAHandler} from './handlers/symmio/BalanceChangePartyAHandler'
import {BalanceChangePartyA} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {BalanceChangePartyBHandler} from './handlers/symmio/BalanceChangePartyBHandler'
import {BalanceChangePartyB} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {DepositHandler} from './handlers/symmio/DepositHandler'
import {Deposit} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {FillCloseRequestHandler} from './handlers/symmio/FillCloseRequestHandler'
import {FillCloseRequest} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {LiquidatePositionsPartyAHandler} from './handlers/symmio/LiquidatePositionsPartyAHandler'
import {LiquidatePositionsPartyA} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {LiquidatePositionsPartyBHandler} from './handlers/symmio/LiquidatePositionsPartyBHandler'
import {LiquidatePositionsPartyB} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {OpenPositionHandler} from './handlers/symmio/OpenPositionHandler'
import {OpenPosition} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {RegisterExpressProviderHandler} from './handlers/symmio/RegisterExpressProviderHandler'
import {RegisterExpressProvider} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {SendQuoteHandler} from './handlers/symmio/SendQuoteHandler'
import {SendQuote} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {Version} from '../common/BaseHandler'
import {WithdrawAdvancedHandler} from './handlers/symmio/WithdrawAdvancedHandler'
import {WithdrawAdvanced} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {ensureSyncMeta} from './src_sync_meta'


export function handleBalanceChangePartyA(event: BalanceChangePartyA): void {
    ensureSyncMeta(event.block)
    let handler = new BalanceChangePartyAHandler<BalanceChangePartyA>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleBalanceChangePartyB(event: BalanceChangePartyB): void {
    ensureSyncMeta(event.block)
    let handler = new BalanceChangePartyBHandler<BalanceChangePartyB>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleDeposit(event: Deposit): void {
    ensureSyncMeta(event.block)
    let handler = new DepositHandler<Deposit>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleFillCloseRequest(event: FillCloseRequest): void {
    ensureSyncMeta(event.block)
    let handler = new FillCloseRequestHandler<FillCloseRequest>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleLiquidatePositionsPartyA(event: LiquidatePositionsPartyA): void {
    ensureSyncMeta(event.block)
    let handler = new LiquidatePositionsPartyAHandler<LiquidatePositionsPartyA>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleLiquidatePositionsPartyB(event: LiquidatePositionsPartyB): void {
    ensureSyncMeta(event.block)
    let handler = new LiquidatePositionsPartyBHandler<LiquidatePositionsPartyB>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleOpenPosition(event: OpenPosition): void {
    ensureSyncMeta(event.block)
    let handler = new OpenPositionHandler<OpenPosition>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleRegisterExpressProvider(event: RegisterExpressProvider): void {
    ensureSyncMeta(event.block)
    let handler = new RegisterExpressProviderHandler<RegisterExpressProvider>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleSendQuote(event: SendQuote): void {
    ensureSyncMeta(event.block)
    let handler = new SendQuoteHandler<SendQuote>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleWithdrawAdvanced(event: WithdrawAdvanced): void {
    ensureSyncMeta(event.block)
    let handler = new WithdrawAdvancedHandler<WithdrawAdvanced>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleLatestAccountBalanceBlock(block: ethereum.Block): void {
    handleLatestAccountBalanceBlockImpl(block, Version.v_0_8_6)
}
