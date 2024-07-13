import { Address, BigInt, ethereum, log } from "@graphprotocol/graph-ts";
import { symmio_0_8_2 } from "../../../generated/symmio_0_8_2/symmio_0_8_2";
import { LiquidatePartyA } from "../../../generated/symmio_0_8_2/symmio_0_8_2";
import { Liquidator, PartyALiquidator } from "../../../generated/schema";

export function getAllocatedBalance(partyA: Address, contractAddress: Address): BigInt {
	let contract = symmio_0_8_2.bind(contractAddress);
	return contract.allocatedBalanceOfPartyA(partyA);
}

export function update_liquidator(_event: ethereum.Event): void {
	// @ts-ignore
	const event = changetype<LiquidatePartyA>(_event);
	const liquidatorAddressID = event.params.liquidator.toHexString();
	let liquidator = Liquidator.load(liquidatorAddressID);
	if (!liquidator) {
		liquidator = new Liquidator(liquidatorAddressID);
		liquidator.liquidatorAddress = event.params.liquidator;
		liquidator.profit = BigInt.zero();
		liquidator.balance = BigInt.zero();
	}
	let newBalance = getAllocatedBalance(event.params.liquidator, event.address);
	if (newBalance.lt(liquidator.balance)) {
		log.error("newBalance:{} oldBalance:{}", [newBalance.toString(), liquidator.balance.toString()]);
	}
	liquidator.profit = liquidator.profit.plus(newBalance.minus(liquidator.balance));
	liquidator.balance = newBalance;
	liquidator.save();
}

export function addUniqueItem(list: string[] | null, item: string): Array<string> {
	if (list === null) {
		return [item];
	}
	// Check if the item already exists in the list
	for (let i = 0; i < list.length; i++) {
		if (list[i] == item) {
			return list;
		}
	}
	list.push(item);
	return list;
}

export function addLiquidator(_event: ethereum.Event): void {
	// @ts-ignore
	const event = changetype<LiquidatePartyA>(_event);
	const partyAAddress = event.params.partyA.toHexString();
	let partyALiquidator = PartyALiquidator.load(partyAAddress);
	if (!partyALiquidator) {
		partyALiquidator = new PartyALiquidator(partyAAddress);
		partyALiquidator.PartyA = event.params.partyA;
	}
	const liquidatorAddressID = event.params.liquidator.toHexString();
	let liquidator = Liquidator.load(liquidatorAddressID);
	if (!liquidator) {
		liquidator = new Liquidator(liquidatorAddressID);
		liquidator.profit = BigInt.zero();
		liquidator.balance = BigInt.zero();
	}
	partyALiquidator.Liquidators = addUniqueItem(partyALiquidator.Liquidators, liquidator.id);
	partyALiquidator.timeStamp
	liquidator.save();
	partyALiquidator.save();
}