export interface OverriddenProperties{
	[key: string]: {
		value: any,
		changeHandlers: Array<(value: any)=>void>
	}
}