import { ForceClosePartyBInsolventHandler as CommonForceClosePartyBInsolventHandler } from "../../../common/handlers/symmio/ForceClosePartyBInsolventHandler"

// ForceClosePartyBInsolvent is a partyB solvency signal emitted alongside ForceClosePosition
// in cross-partyB mode. It is not a quote lifecycle event. The actual position close is
// fully handled by ForceClosePositionHandler (FORCE_CLOSE QuoteEvent, trade history, volume, OI).
export class ForceClosePartyBInsolventHandler<T> extends CommonForceClosePartyBInsolventHandler<T> {}
