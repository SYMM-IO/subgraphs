import { ethereum } from "@graphprotocol/graph-ts"
import { VaultVersion } from "../../../common/BaseHandler"
import { WithdrawRequestEventHandler as CommonWithdrawRequestEventHandler } from "../common/WithdrawRequestEventHandler"

export class WithdrawRequestEventHandler<T> extends CommonWithdrawRequestEventHandler<T> {
	handle(_event: ethereum.Event, version: VaultVersion): void {
		super.handle(_event, version)
	}
}
