import { Main } from '../../components/Main';
import { ComponentRegistrator } from '../ComponentsRegistrator';

const componentRegistrator: ComponentRegistrator = new ComponentRegistrator();
componentRegistrator.register([
	Main
]);

const testedComponent: Main = new Main();
const hostNode = document.createElement('main');

testedComponent
	.setHostNode(hostNode)
	.injectComponents(componentRegistrator.get())
	.render();

test('Children generated', ()=>{
	expect( hostNode.hasChildNodes() ).toBeTruthy();
})

test('First level is ok', ()=>{
	expect(hostNode.children.item(0).nodeName).toBe('DIV');
})
test('Second level is ok', ()=>{
	const expected = ['DIV', 'H1', 'H2', 'USER-TABLE', 'DIV'];
	expected.forEach((value: string , index: number)=>{
		expect(hostNode.children.item(0).children.item(index).nodeName).toBe(value);
	})
})