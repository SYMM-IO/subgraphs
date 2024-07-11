import { ethereum } from "@graphprotocol/graph-ts";
import { Version } from "../../../common/BaseHandler";

import { LiquidatePendingPositionsPartyA } from "../../../generated/symmio_0_8_2/symmio_0_8_2";
import { update_liquidator } from "./utils";

export class LiquidatePendingPositionsPartyAHandler<T> {

    handle(_event: ethereum.Event, version: Version): void {
        // @ts-ignore
        const event = changetype<T>(_event)
        update_liquidator(event);
        switch (version) {
            case Version.v_0_8_2: {
                // @ts-ignore
                const e = changetype<LiquidatePendingPositionsPartyA>(_event)
            }
            case Version.v_0_8_0: {

            }
        }

    }
}