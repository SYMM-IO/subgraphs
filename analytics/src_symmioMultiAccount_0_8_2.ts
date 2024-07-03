
import {AddAccountHandler} from "./handlers/AddAccountHandler"
import {AddAccount} from "../generated/symmioMultiAccount_0_8_2/symmioMultiAccount_0_8_2" 
import {AddAccountHandler} from "./handlers/AddAccountHandler"
import {AddAccount} from "../generated/symmioMultiAccount_0_8_2/symmioMultiAccount_0_8_2" 
import {AddAccountHandler} from "./handlers/AddAccountHandler"
import {AddAccount} from "../generated/symmioMultiAccount_0_8_2/symmioMultiAccount_0_8_2" 


export function handleAddAccount(event: AddAccount): void {
    let handler = new AddAccountHandler(event, "0_8_2")
    handler.handle()
}
        
export function handleAddAccount(event: AddAccount): void {
    let handler = new AddAccountHandler(event, "0_8_2")
    handler.handle()
}
        
export function handleAddAccount(event: AddAccount): void {
    let handler = new AddAccountHandler(event, "0_8_2")
    handler.handle()
}
        