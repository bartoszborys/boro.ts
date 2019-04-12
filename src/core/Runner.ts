import { Main } from "./tests/components/Main";
import { UserTable } from "./tests/components/UserTable";
import { AnotherComponent } from "./tests/components/AnotherComponent";
import { RegisteredComponents } from "../core/types/RegisteredComponents";
import { ComponentCore } from "../core/types/ComponentCore";

const componentsList = [
	Main,
	UserTable,
	AnotherComponent
]

export const components: RegisteredComponents = {};

function startApp(){
	bindComponentsToTheirNames();
	new Main()
		.setHostNode( getRootHtmlElement() )
		.render()
}

function bindComponentsToTheirNames(): void{
	componentsList.forEach( (ComponentConstructor: any) => {
		const component: ComponentCore = new ComponentConstructor();
		components[component.getName().toLowerCase()] = ComponentConstructor;
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