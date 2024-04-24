import { BaseHandler } from "./BaseHandler"
import { LiquidatePositionsPartyA } from "../../generated/symmio/symmio"
import { Quote } from "../../generated/schema"
import { getGlobalCounterAndInc } from "../helper"

export class LiquidatePositionsPartyAHandler extends BaseHandler {
	protected event: LiquidatePositionsPartyA

	constructor(event: LiquidatePositionsPartyA) {
		super(event)
		this.event = event
	}

	handle(): void {
		// TODO
	}
}