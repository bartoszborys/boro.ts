import { Component } from "./Component";
import { ComponentCore } from "./types/ComponentCore";
import { RegisteredComponents } from "../core/types/RegisteredComponents";

export class ComponentRegistrator{
	private components: RegisteredComponents;
	
	constructor(){
		this.components = {};
	}

	public register( componentsToRegister: Array<typeof Component> ): void{
		componentsToRegister.forEach( (ComponentConstructor: any) => {
			const component: ComponentCore = new ComponentConstructor();
			this.components[component.getName().toLowerCase()] = ComponentConstructor;
		})
	}

	public get(): RegisteredComponents{
		return this.components;
	}
}