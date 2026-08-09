import { BuybackGatewayVersion } from "../common/BaseHandler"
import { BuybackExecutedHandler } from "./handlers/buybackGateway/BuybackExecutedHandler"
import { DepositedHandler } from "./handlers/buybackGateway/DepositedHandler"
import { ensureSyncMeta } from "./src_sync_meta"
import { BuybackExecuted, Deposited } from "../../generated/buybackGateway_1/buybackGateway_1"

export function handleBuybackExecuted(event: BuybackExecuted): void {
	ensureSyncMeta(event.block)
	let handler = new BuybackExecutedHandler<BuybackExecuted>()
	handler.handle(event, BuybackGatewayVersion.v_1)
}

export function handleDeposited(event: Deposited): void {
	ensureSyncMeta(event.block)
	let handler = new DepositedHandler<Deposited>()
	handler.handle(event, BuybackGatewayVersion.v_1)
}
