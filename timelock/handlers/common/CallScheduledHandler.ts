import {ethereum} from "@graphprotocol/graph-ts"
import {TimelockVersion} from "../../../common/BaseHandler"
import {CallScheduled} from "../../../generated/schema"

export class CallScheduledHandler<T> {
    handle(_event: ethereum.Event, version: TimelockVersion): void {
        // @ts-ignore
        const event = changetype<T>(_event)
        let call_execute = new CallScheduled(event.params.id.toString())
        call_execute.index = event.params.index
        call_execute.target = event.params.target
        call_execute.value = event.params.value
        call_execute.data = event.params.data
        call_execute.predecessor = event.params.predecessor
        call_execute.delay = event.params.delay
		call_execute.save()
    }
}
