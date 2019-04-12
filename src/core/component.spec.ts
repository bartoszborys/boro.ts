import { components } from './Runner';
import { Main } from './tests/components/Main';
console.log(Main);

const testedComponent: Main = new Main();
const hostNode = document.createElement('span');

console.log(hostNode);

testedComponent.setHostNode(hostNode).injectComponents(components);