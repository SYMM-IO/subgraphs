import {ethereum} from "@graphprotocol/graph-ts"
import {TimelockVersion} from "../../../common/BaseHandler"
import {CallExecuted} from "../../../generated/schema"

export class CallExecutedHandler<T> {
    handle(_event: ethereum.Event, version: TimelockVersion): void {
        // @ts-ignore
        const event = changetype<T>(_event)
        let call_execute = new CallExecuted(event.params.id.toHexString())
        call_execute.index = event.params.index
        call_execute.target = event.params.target
        call_execute.value = event.params.value
        call_execute.data = event.params.data
        call_execute.timestamp = event.block.timestamp
        call_execute.address = event.address
        call_execute.save()
    }
}
