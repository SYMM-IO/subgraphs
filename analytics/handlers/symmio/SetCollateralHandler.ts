import {SetCollateralHandler as CommonSetCollateralHandler} from "../../../common/handlers/symmio/SetCollateralHandler"
import {getConfiguration} from "../../utils"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class SetCollateralHandler<T> extends CommonSetCollateralHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let configuration = getConfiguration(event)
		configuration.collateral = event.params.collateral
		configuration.save()
	}
}