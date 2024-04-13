
import {RequestToCancelCloseRequestHandler as CommonRequestToCancelCloseRequestHandler} from "../../common/handlers/RequestToCancelCloseRequestHandler"
import {RequestToCancelCloseRequest} from "../../generated/symmio/symmio"

export class RequestToCancelCloseRequestHandler extends CommonRequestToCancelCloseRequestHandler {

    constructor(event: RequestToCancelCloseRequest) {
        super(event)
    }

    handle(): void {
		super.handle()
    }
}
