import { BigInt } from "@graphprotocol/graph-ts"
import { PartyA, PartyBPartyA, Quote } from "../../generated/schema"
import { getGlobalCounterAndInc } from "../utils"
export function removeQuoteFromPendingList(quoteId: BigInt): void {
    let quote = Quote.load(quoteId.toString())
    if (quote) {

        let partyAEntity = PartyA.load(quote.partyA.toHexString())
        if (partyAEntity) {
            partyAEntity.globalCounter = getGlobalCounterAndInc()
            let temp = partyAEntity.quoteUntilLiquid!.slice(0)
            const indexA = temp.indexOf(quoteId)
            temp.splice(indexA, 1)
            partyAEntity.quoteUntilLiquid = temp.slice(0)
            partyAEntity.save()
        }
        let partyB = quote.partyB
        if (partyB) {
            let partyAPartyBEntity = PartyBPartyA.load(quote.partyA.toHexString() + '-' + partyB.toHexString())
            if (partyAPartyBEntity) {
                partyAPartyBEntity.globalCounter = getGlobalCounterAndInc()
                let temp = partyAPartyBEntity.quoteUntilLiquid!.slice(0)
                const indexB = temp.indexOf(quoteId)
                temp.splice(indexB, 1)
                partyAPartyBEntity.quoteUntilLiquid = temp.slice(0)
                partyAPartyBEntity.save()

            }
        }
    }
}