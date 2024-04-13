
import {AcceptCancelRequestHandler as CommonAcceptCancelRequestHandler} from "../../common/handlers/AcceptCancelRequestHandler"
import {AcceptCancelRequest} from "../../generated/symmio/symmio"

export class AcceptCancelRequestHandler extends CommonAcceptCancelRequestHandler {

    constructor(event: AcceptCancelRequest) {
        super(event)
    }

    handle(): void {
		super.handle()
    }
}
