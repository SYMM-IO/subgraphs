import {CallExecutedHandler} from './handlers/timelock3D/CallExecutedHandler'
import {CallExecuted} from '../generated/timelock3D_1/timelock3D_1'
import {CallScheduledHandler} from './handlers/timelock3D/CallScheduledHandler'
import {CallScheduled} from '../generated/timelock3D_1/timelock3D_1'
import {CancelledHandler} from './handlers/timelock3D/CancelledHandler'
import {Cancelled} from '../generated/timelock3D_1/timelock3D_1'
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
