import {CallExecutedHandler} from './handlers/timelock12H/CallExecutedHandler'
import {CallExecuted} from '../generated/timelock12H_1/timelock12H_1'
import {CallScheduledHandler} from './handlers/timelock12H/CallScheduledHandler'
import {CallScheduled} from '../generated/timelock12H_1/timelock12H_1'
import {CancelledHandler} from './handlers/timelock12H/CancelledHandler'
import {Cancelled} from '../generated/timelock12H_1/timelock12H_1'
import {TimelockVersion} from '../common/BaseHandler'


export function handleCallExecuted(event: CallExecuted): void {
    let handler = new CallExecutedHandler<CallExecuted>()
    handler.handle(event, TimelockVersion.v_1)
}


export function handleCallScheduled(event: CallScheduled): void {
    let handler = new CallScheduledHandler<CallScheduled>()
    handler.handle(event, TimelockVersion.v_1)
}


export function handleCancelled(event: Cancelled): void {
    let handler = new CancelledHandler<Cancelled>()
    handler.handle(event, TimelockVersion.v_1)
}
