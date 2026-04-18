import { BaseAccountLayerHandler } from "../../BaseHandler"

// AccountLayer global signer change (ControlFacet.updateSigner). Not mirrored:
// schema has no signer-tracking entity. Audit trail lives only in raw event logs.
// To persist on-chain signer state, add a Configuration-like entity with signer field.
export class SignerUpdatedHandler<T> extends BaseAccountLayerHandler {
}
