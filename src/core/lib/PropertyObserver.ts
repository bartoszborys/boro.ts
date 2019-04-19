import { UnknownProperties } from "../types/UnknownProperties";
import { Observer } from "./Observer";

export class PropertyObserver implements Observer<any>{
	constructor(private observed: UnknownProperties, private attributeName: string){}

	update(value: any): void {
		this.observed[this.attributeName] = value;
	}
}