import { Address, BigInt, ethereum, log } from "@graphprotocol/graph-ts";
import { symmio_0_8_2 } from "../../../generated/symmio_0_8_2/symmio_0_8_2";
import { LiquidatePartyA } from "../../../generated/symmio_0_8_2/symmio_0_8_2";
import { Liquidator } from "../../../generated/schema";

export function getAllocatedBalance(partyA: Address, contractAddress: Address): BigInt {
    let contract = symmio_0_8_2.bind(contractAddress);
    return contract.allocatedBalanceOfPartyA(partyA);
}

export function update_liquidator(_event: ethereum.Event): void {
    // @ts-ignore
    const event = changetype<LiquidatePartyA>(_event)
    const liquidatorAddressID = event.params.liquidator.toHexString();
    let liquidator = Liquidator.load(liquidatorAddressID);
    if (!liquidator) {
        liquidator = new Liquidator(liquidatorAddressID);
        liquidator.profit = BigInt.zero();
        liquidator.balance = BigInt.zero();
    }
    let newBalance = getAllocatedBalance(event.params.liquidator, event.address);
    if (newBalance.lt(liquidator.balance)) {
        log.error("newBalance:{} oldBalance:{}", [newBalance.toString(), liquidator.balance.toString()])
    }
    liquidator.profit = liquidator.profit.plus(newBalance.minus(liquidator.balance));
    liquidator.balance = newBalance;
    liquidator.save();
}