import { ExpressProviderTemplateRegistration, RegisterExpressProvider as RegisterExpressProviderEntity } from "../../../../generated/schema"
import { ExpressProvider } from "../../../../generated/templates"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { getGlobalCounterAndInc } from "../../../common/utils"

export class RegisterExpressProviderHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new RegisterExpressProviderEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.counterId = getGlobalCounterAndInc()
		entity.source = event.address
		entity.provider = event.params.provider

		entity.blockTimestamp = event.block.timestamp
		entity.blockNumber = event.block.number
		entity.transactionHash = event.transaction.hash
		entity.transactionIndex = event.transaction.index
		entity.logIndex = event.logIndex
		entity.blockHash = event.block.hash
		entity.save()

		let registrationId = event.params.provider.toHexString()
		let registration = ExpressProviderTemplateRegistration.load(registrationId)
		if (registration) return

		registration = new ExpressProviderTemplateRegistration(registrationId)
		registration.provider = event.params.provider
		registration.source = event.address
		registration.timestamp = event.block.timestamp
		registration.blockNumber = event.block.number
		registration.save()
		ExpressProvider.create(event.params.provider)
	}
}
