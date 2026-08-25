import { Bytes, dataSource } from "@graphprotocol/graph-ts"

export function currentDeploymentId(): string | null {
	let context = dataSource.context()
	return context.isSet("deploymentId") ? context.getString("deploymentId") : null
}

export function currentAccountLayerSource(): Bytes | null {
	let context = dataSource.context()
	return context.isSet("accountLayerSource") ? context.getBytes("accountLayerSource") : null
}
