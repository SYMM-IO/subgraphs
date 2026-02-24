
import { StakeholdersUpdatedHandler as CommonStakeholdersUpdatedHandler } from "../../../common/handlers/accountLayer/StakeholdersUpdatedHandler"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"

export class StakeholdersUpdatedHandler<T> extends CommonStakeholdersUpdatedHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		super.handle(_event, version)
	}
}
