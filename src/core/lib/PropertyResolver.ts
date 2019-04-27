import { UnknownProperties } from "../types/UnknownProperties";

export class PropertyResolver{
	constructor(private object: UnknownProperties){};

	public getResolvedName(propertyName: string): string{
		const matchedKeys = Object.keys(this.object).filter( currentKey => currentKey.toLowerCase() === propertyName.toLowerCase());

		if( matchedKeys.length === 0 ){
			throw new Error(`Unknown object property >> '${propertyName}'.`);
		}

		if( matchedKeys.length > 1){
			throw new Error(`Property >> '${propertyName}' is ambigous in given component.`)
		}

		return matchedKeys[0];
	}
}