import { Version } from "../common/BaseHandler"
import { OpenPosition } from "../../generated/symmioLegacyOpen_0_8_5/symmioLegacyOpen_0_8_5"
import { OpenPositionHandler } from "./handlers/symmio/OpenPositionHandler"
import { ensureSyncMeta } from "./src_sync_meta"

export function handleOpenPosition(event: OpenPosition): void {
	ensureSyncMeta(event.block)
	let handler = new OpenPositionHandler<OpenPosition>()
	handler.handle(event, Version.v_0_8_5)
}
