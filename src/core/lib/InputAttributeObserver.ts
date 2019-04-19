import { Observer } from "./PropertiesBinder";

export class InputAttributeObserver implements Observer<any>{
	constructor(private node: Node, private attributeName: string){}

	update(value: any): void {
		(<any>this.node)[this.attributeName] = value;
	}
}