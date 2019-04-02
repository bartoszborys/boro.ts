export interface OverridedProperties{
	[key: string]: {
		value: any,
		changeHandlers: Array<(value: any)=>void>
	}
}