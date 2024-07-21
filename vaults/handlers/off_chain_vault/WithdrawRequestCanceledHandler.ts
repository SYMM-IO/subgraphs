import { ethereum } from "@graphprotocol/graph-ts"
import { VaultVersion } from "../../../common/BaseHandler"
import { WithdrawRequestCanceledHandler as CommonWithdrawRequestCanceledHandler } from "../common/WithdrawRequestCanceledHandler"

export class WithdrawRequestCanceledHandler<T> extends CommonWithdrawRequestCanceledHandler<T> {
	handle(_event: ethereum.Event, version: VaultVersion): void {
		super.handle(_event, version)
	}
}
