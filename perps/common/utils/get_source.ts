import { ethereum } from "@graphprotocol/graph-ts";
import { SourceConfig } from "../../../generated/schema";

export function getSource(event: ethereum.Event): SourceConfig {
	let sourceConfig = SourceConfig.load("0")
	if (sourceConfig == null) {
		sourceConfig = new SourceConfig("0")
		sourceConfig.source = event.address // Will be replaced shortly after creation
		sourceConfig.save()
	}
	return sourceConfig
}
