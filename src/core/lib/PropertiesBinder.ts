import { UnknownProperties } from "../types/UnknownProperties";
import { OverriddenProperties } from "../types/OverriddenProperties";
import { Observer } from "./Observer";

export class PropertiesBinder{
	private boundProperties: OverriddenProperties = {};
	public constructor(private object: UnknownProperties){};

	public observe(propertyName: string, observer: Observer): void{
		this.bindProperty(propertyName);
		this.boundProperties[propertyName].changeHandlers.push(observer.update.bind(observer));
	}

	private bindProperty(propertyName: string){
		if(this.boundProperties[propertyName] !== undefined){
			return;
		}
		this.initializeProperty(propertyName);
		this.bindProxy(propertyName);
	}

	private initializeProperty(propertyName: string){
		this.boundProperties[propertyName] = {
			value: null,
			changeHandlers: []
		}
	}

	private bindProxy(propertyName: string) {
		const value = this.object[propertyName];
		Object.defineProperty(this.object, propertyName, {
			get: () => this.boundProperties[propertyName].value,
			set: (value: any) => {
				this.boundProperties[propertyName].value = value;
				for(const changeHandler of this.boundProperties[propertyName].changeHandlers){
					changeHandler(value);
				}
			}
		});
		this.object[propertyName] = value;
	}
}
