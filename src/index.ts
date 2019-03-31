import { Main } from "./components/Main";
import { UserTable } from "./components/UserTable";
import { AnotherComponent } from "./components/AnotherComponent";
import { Component } from "./core/Component";
import { RegisteredComponents } from "./types/RegisteredComponents";

const componentsList = [
	Main,
	UserTable,
	AnotherComponent
]

export const components: RegisteredComponents = {};

function startApp(){
	bindComponentsToTheirNames();
	const rootElement: HTMLElement = getRootHtmlElement();
	new Main()
		.setHostNode( rootElement )
		.render()
}

function bindComponentsToTheirNames(): void{
	componentsList.forEach( (ComponentConstructor: any) => {
		const component: Component = new ComponentConstructor();
		components[component.config.name.toLowerCase()] = ComponentConstructor;
	})
}

function getRootHtmlElement(): HTMLElement{
	const rootElement: HTMLCollectionOf<Element> = document.getElementsByTagName('main');

	if(rootElement.length > 1){
		throw new Error('Found too many main tags.');
	}

	return <HTMLElement>rootElement.item(0);
}

startApp();