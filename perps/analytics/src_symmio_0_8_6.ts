import { RegisterExpressProviderHandler } from "./handlers/symmio/RegisterExpressProviderHandler"
import { WithdrawAdvancedHandler } from "./handlers/symmio/WithdrawAdvancedHandler"
import { ensureSyncMeta } from "./src_sync_meta"
import { Version } from "../common/BaseHandler"
import { RegisterExpressProvider, WithdrawAdvanced } from "../../generated/symmio_0_8_6/symmio_0_8_6"

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
