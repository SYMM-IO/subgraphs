import {FeeCollectorVersion} from '../common/BaseHandler'
import {SymmioStakeholderUpdatedHandler} from './handlers/feeCollector/SymmioStakeholderUpdatedHandler'
import {SymmioStakeholderUpdated} from '../../generated/feeCollector_1/feeCollector_1'


export function handleSymmioStakeholderUpdated(event: SymmioStakeholderUpdated): void {
    let handler = new SymmioStakeholderUpdatedHandler<SymmioStakeholderUpdated>()
    handler.handle(event, FeeCollectorVersion.v_1)
}
