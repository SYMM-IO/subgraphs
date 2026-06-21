import { BalanceChangePartyAHandler } from "./handlers/symmio/BalanceChangePartyAHandler"
import { BalanceChangePartyBHandler } from "./handlers/symmio/BalanceChangePartyBHandler"
import { RegisterExpressProviderHandler } from "./handlers/symmio/RegisterExpressProviderHandler"
import { WithdrawAdvancedHandler } from "./handlers/symmio/WithdrawAdvancedHandler"
import { ensureSyncMeta } from "./src_sync_meta"
import { Version } from "../common/BaseHandler"
import { BalanceChangePartyA, BalanceChangePartyB, RegisterExpressProvider, WithdrawAdvanced } from "../../generated/symmio_0_8_6/symmio_0_8_6"

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

export function handleRegisterExpressProvider(event: RegisterExpressProvider): void {
	ensureSyncMeta(event.block)
	let handler = new RegisterExpressProviderHandler<RegisterExpressProvider>()
	handler.handle(event, Version.v_0_8_6)
}

export function handleWithdrawAdvanced(event: WithdrawAdvanced): void {
	ensureSyncMeta(event.block)
	let handler = new WithdrawAdvancedHandler<WithdrawAdvanced>()
	handler.handle(event, Version.v_0_8_6)
}
