import { ethereum } from "@graphprotocol/graph-ts"
import { Configuration } from "../../../../generated/schema"
import { ExpressProvider } from "../../../../generated/templates"
import { BaseHandler, Version } from "../../../common/BaseHandler"
import { ZERO_ADDRESS_BYTES } from "../../utils/constants"
import { ensureExpressProviderSource } from "../../utils/affiliateExpressWithdrawComponents"

export class RegisterExpressProviderHandler<T> extends BaseHandler {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let configuration = Configuration.load("0")
		let collateral = configuration ? configuration.collateral : ZERO_ADDRESS_BYTES
		let isNewProvider = ensureExpressProviderSource(event.params.provider, _event.address, collateral, _event.block.timestamp, _event.block.number)
		if (isNewProvider) {
			ExpressProvider.create(event.params.provider)
		}
	}
}
