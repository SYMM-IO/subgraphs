import { ethereum } from "@graphprotocol/graph-ts"
import { VaultVersion } from "../../../common/BaseHandler"
import { WithdrawClaimedEventHandler as CommonWithdrawClaimedEventHandler } from "../common/WithdrawClaimedEventHandler"

export class WithdrawClaimedEventHandler<T> extends CommonWithdrawClaimedEventHandler<T> {
	handle(_event: ethereum.Event, version: VaultVersion): void {
		super.handle(_event, version)
	}
}
