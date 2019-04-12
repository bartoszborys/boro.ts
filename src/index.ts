import { Main } from "./components/Main";
import { UserTable } from "./components/UserTable";
import { AnotherComponent } from "./components/AnotherComponent";
import { ComponentRegistrator } from "./core/ComponentsRegistrator";

const rootElement: HTMLCollectionOf<Element> = document.getElementsByTagName('main');

if(rootElement.length > 1){
	throw new Error('Found too many main tags.');
}

const componentRegistrator: ComponentRegistrator = new ComponentRegistrator();
componentRegistrator.register([
	Main,
	UserTable,
	AnotherComponent
]);

new Main()
	.setHostNode( <HTMLElement>rootElement.item(0) )
	.injectComponents( componentRegistrator.get() )
	.render()