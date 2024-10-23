import {CallExecutedHandler} from './handlers/timelock/CallExecutedHandler'
import {CallExecuted} from '../generated/timelock_1/timelock_1'
import {CallScheduledHandler} from './handlers/timelock/CallScheduledHandler'
import {CallScheduled} from '../generated/timelock_1/timelock_1'
import {CancelledHandler} from './handlers/timelock/CancelledHandler'
import {Cancelled} from '../generated/timelock_1/timelock_1'
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
