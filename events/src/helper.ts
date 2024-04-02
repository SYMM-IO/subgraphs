import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts"

export function bigIntToArr(bigIntArr: BigInt[]): BigInt[] {
    let newArray: BigInt[] = []
    for (let i = 0, len = bigIntArr.length; i < len; i++) {
        newArray.push(bigIntArr[i])
    }
    return newArray
}
export function bytesToArr(bytesArr: Address[]): Bytes[] {
    let newArray: Bytes[] = []
    for (let i = 0, len = bytesArr.length; i < len; i++) {
        newArray.push(bytesArr[i])
    }
    return newArray
}