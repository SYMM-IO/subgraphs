import { SymmioStakeholderUpdatedHandler } from "./handlers/feeCollector/SymmioStakeholderUpdatedHandler"
import { SymmioStakeholderUpdated } from "../../generated/feeCollector_1/feeCollector_1"
import { FeeCollectorVersion } from "../common/BaseHandler";
import {ensureSyncMeta} from './src_sync_meta'

export function handleSymmioStakeholderUpdated(event: SymmioStakeholderUpdated): void {
	ensureSyncMeta(event.block)
	let handler = new SymmioStakeholderUpdatedHandler<SymmioStakeholderUpdated>()
	handler.handle(event, FeeCollectorVersion.v_1)
}
