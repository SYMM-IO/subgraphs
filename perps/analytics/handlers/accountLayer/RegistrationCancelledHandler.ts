
import { RegistrationCancelledHandler as CommonRegistrationCancelledHandler } from "../../../common/handlers/accountLayer/RegistrationCancelledHandler"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"

export class RegistrationCancelledHandler<T> extends CommonRegistrationCancelledHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		super.handle(_event, version)
	}
}
