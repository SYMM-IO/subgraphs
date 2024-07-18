import { ethereum } from "@graphprotocol/graph-ts";
import { Version } from "../../../common/BaseHandler";

import { LiquidatePositionsPartyA } from "../../../generated/symmio_0_8_2/symmio_0_8_2";
import { addLiquidator, update_liquidator } from "./utils";

export class LiquidatePositionsPartyAHandler<T> {

    handle(_event: ethereum.Event, version: Version): void {
        // @ts-ignore
        const event = changetype<T>(_event)

        switch (version) {
            case Version.v_0_8_2: {
                // @ts-ignore
                const e = changetype<LiquidatePositionsPartyA>(_event)
                addLiquidator(e)
                break
            }
            case Version.v_0_8_0: {

            }
        }

    }
}
