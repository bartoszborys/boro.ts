import { OverridedProperties } from "./OverridedPropeties";

export interface ComponentCore{
	[key: string]: any;
	boundOverridenProperties: OverridedProperties;
	hostNode: HTMLElement;

	setHostNode(_hostNode: HTMLElement): void;
	render(): void;
}