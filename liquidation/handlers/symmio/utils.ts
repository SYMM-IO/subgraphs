import { Address, BigInt, Bytes, ethereum, log } from "@graphprotocol/graph-ts";
import { symmio_0_8_2 } from "../../../generated/symmio_0_8_2/symmio_0_8_2";
import { LiquidatePartyA } from "../../../generated/symmio_0_8_2/symmio_0_8_2";
import { Liquidator, PartyALiquidator } from "../../../generated/schema";

export function getAllocatedBalance(partyA: Address, contractAddress: Address): BigInt {
	let contract = symmio_0_8_2.bind(contractAddress);
	return contract.allocatedBalanceOfPartyA(partyA);
}

export function update_liquidator(liquidatorByte: Bytes, contractAddress: Address): void {

	const liquidatorAddress = Address.fromBytes(liquidatorByte)
	const liquidatorStr = liquidatorByte.toHexString()
	let liquidator = Liquidator.load(liquidatorStr);
	if (!liquidator) {
		liquidator = new Liquidator(liquidatorStr);
		liquidator.liquidatorAddress = Bytes.fromHexString(liquidatorStr)
		liquidator.profit = BigInt.zero();
		liquidator.balance = BigInt.zero();
	}
	let newBalance = getAllocatedBalance(liquidatorAddress, contractAddress);
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
	if (!list.includes(item)) {
		list.push(item);
	}
	return list;
}

export function addLiquidator(_event: ethereum.Event): void {
	// @ts-ignore
	const event = changetype<LiquidatePartyA>(_event);
	const partyAStr = event.params.partyA.toHexString();
	const liquidatorAddress: Bytes = event.params.liquidator
	let partyALiquidator = PartyALiquidator.load(partyAStr);
	if (!partyALiquidator) {
		partyALiquidator = new PartyALiquidator(partyAStr);
		partyALiquidator.PartyA = event.params.partyA;
	}
	if (!partyALiquidator.Liquidators) {
		partyALiquidator.Liquidators = [liquidatorAddress]
	}
	else {
		let listOfLiquidators = partyALiquidator.Liquidators!.slice()
		if (!listOfLiquidators.includes(liquidatorAddress)) {
			listOfLiquidators.push(liquidatorAddress)
			partyALiquidator.Liquidators = listOfLiquidators
		}
	}
	partyALiquidator.timeStamp = event.block.number
	partyALiquidator.save();
}