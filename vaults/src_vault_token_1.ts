import {TransferHandler} from './handlers/vault_token/TransferHandler'
import {Transfer} from '../generated/vault_token_1/vault_token_1'
import {VaultTokenVersion} from '../common/BaseHandler'


export function handleTransfer(event: Transfer): void {
    let handler = new TransferHandler<Transfer>()
    handler.handle(event, VaultTokenVersion.v_1)
}
