import { UnknownComponent } from "../types/UnknownComponent";
import { OverridedProperties } from "../types/OverridedPropeties";

export interface Observer<Type>{
	update(value: Type): void;
}

export class PropertyObserver{
	public constructor(private boundProperties: OverridedProperties = {}){};

	public observe(object: UnknownComponent, propertyName: string, observer: Observer<any>): void{
		this.bindProperty(object, propertyName);
		this.boundProperties[propertyName].changeHandlers.push(observer.update.bind(observer));
	}

	private bindProperty(currentObject: UnknownComponent, propertyName: string){
		if(this.boundProperties[propertyName] !== undefined){
			return;
		}
		this.initializeProperty(propertyName);
		this.bindProxy(currentObject, propertyName);
	}

	private initializeProperty(propertyName: string){
		this.boundProperties[propertyName] = {
			value: null,
			changeHandlers: []
		}
	}

	private bindProxy(currentObject: UnknownComponent, propertyName: string) {
		const value = currentObject[propertyName];
		Object.defineProperty(currentObject, propertyName, {
			get: () => this.boundProperties[propertyName].value,
			set: (value: any) => {
				this.boundProperties[propertyName].value = value;
				for(const changeHandler of this.boundProperties[propertyName].changeHandlers){
					changeHandler(value);
				}
			}
		});
		currentObject[propertyName] = value;
	}
}
