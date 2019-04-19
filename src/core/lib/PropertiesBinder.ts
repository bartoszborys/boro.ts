import { UnknownProperties } from "../types/UnknownProperties";
import { OverriddenProperties } from "../types/OverriddenProperties";
import { Observer } from "./Observer";

export class PropertiesBinder{
	public constructor(private boundProperties: OverriddenProperties = {}){};

	public observe(object: UnknownProperties, propertyName: string, observer: Observer<any>): void{
		this.bindProperty(object, propertyName);
		this.boundProperties[propertyName].changeHandlers.push(observer.update.bind(observer));
	}

	private bindProperty(object: UnknownProperties, propertyName: string){
		if(this.boundProperties[propertyName] !== undefined){
			return;
		}
		this.initializeProperty(propertyName);
		this.bindProxy(object, propertyName);
	}

	private initializeProperty(propertyName: string){
		this.boundProperties[propertyName] = {
			value: null,
			changeHandlers: []
		}
	}

	private bindProxy(object: UnknownProperties, propertyName: string) {
		const value = object[propertyName];
		Object.defineProperty(object, propertyName, {
			get: () => this.boundProperties[propertyName].value,
			set: (value: any) => {
				this.boundProperties[propertyName].value = value;
				for(const changeHandler of this.boundProperties[propertyName].changeHandlers){
					changeHandler(value);
				}
			}
		});
		object[propertyName] = value;
	}
}
