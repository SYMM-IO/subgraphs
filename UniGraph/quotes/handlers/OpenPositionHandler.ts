
import {OpenPositionHandler as CommonOpenPositionHandler} from "../../common/handlers/OpenPositionHandler"
import {OpenPosition} from "../../generated/symmio/symmio"

export class OpenPositionHandler extends CommonOpenPositionHandler {

    constructor(event: OpenPosition) {
        super(event)
    }

    handle(): void {
		super.handle()
    }
}
