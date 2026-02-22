import { BaseHandler, Version } from "../../BaseHandler"
import { ethereum } from "@graphprotocol/graph-ts"
import { Symbol } from "../../../../generated/schema"
import { SetSymbolValidationState as SetSymbolValidationState_8_0 } from "../../../../generated/symmio_0_8_0/symmio_0_8_0"
import { SetSymbolValidationState as SetSymbolValidationState_8_2 } from "../../../../generated/symmio_0_8_2/symmio_0_8_2"
import { SetSymbolValidationState as SetSymbolValidationState_8_3 } from "../../../../generated/symmio_0_8_3/symmio_0_8_3"

export class SetSymbolValidationStateHandler<T> extends BaseHandler {
	handleSymbol(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let symbol: Symbol | null
		if (version == Version.v_0_8_0) {
			// @ts-ignore
			const e = changetype<SetSymbolValidationState_8_0>(_event)
			symbol = Symbol.load(e.params.id.toString() + "-" + event.address.toHexString())
		} else if (version == Version.v_0_8_2) {
			// @ts-ignore
			const e = changetype<SetSymbolValidationState_8_2>(_event)
			symbol = Symbol.load(e.params.id.toString() + "-" + event.address.toHexString())
		} else {
			// @ts-ignore
			const e = changetype<SetSymbolValidationState_8_3>(_event)
			symbol = Symbol.load(e.params.symbolId.toString() + "-" + event.address.toHexString())
		}
		if (!symbol) return
		symbol.isValid = event.params.isValid
		symbol.updateTimestamp = _event.block.timestamp
		symbol.save()
	}
}
