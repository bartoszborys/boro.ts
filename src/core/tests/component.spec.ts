import { ComponentTest } from './ComponentTest';
import { ComponentRegistrator } from '../ComponentsRegistrator';
import { ComponentTestChild } from './ComponentTestChild';

const componentRegistrator: ComponentRegistrator = new ComponentRegistrator();
componentRegistrator.register([
	ComponentTest,
	ComponentTestChild
]);

function getTestedInstance(hostNode: HTMLElement): ComponentTest{
	return new ComponentTest()
		.setHostNode(hostNode)
		.injectComponents( componentRegistrator.get() ) as ComponentTest
}

test('Children generated', ()=>{
	const hostNode = document.createElement('test');
	getTestedInstance(hostNode).render();
	expect( hostNode.hasChildNodes() ).toBeTruthy();
})

test('Children first level is ok', ()=>{
	const hostNode = document.createElement('test');
	getTestedInstance(hostNode).render();
	const expectedChildren = ['DIV', 'COMPONENT-TEST-CHILD', 'INPUT', 'DIV'];
	
	for(const [index, expectedChildTagName] of Object.entries(expectedChildren)){
		expect(hostNode.children.item( parseInt(index) ).nodeName).toBe(expectedChildTagName);
	}
})

test('Second level child generated', ()=>{
	const expectedChildren = ['DIV', 'SPAN'];
	const hostNode = document.createElement('test');
	getTestedInstance(hostNode).render();
	const childrenHostNode = hostNode.children.item(3).children.item(0);
	for(const [index, expectedChildTagName] of Object.entries(expectedChildren)){
		expect(childrenHostNode.children.item( parseInt(index) ).nodeName).toBe(expectedChildTagName);
	}
})

test('First child interpolated correctly', ()=>{
	const hostNode = document.createElement('test');
	getTestedInstance(hostNode).render();
	expect(hostNode.children.item(0).hasAttribute('boro-element-1')).toBeTruthy()
	expect(hostNode.children.item(0).textContent).toBe('Hello world!');
})

test('First child reinterpolated correctly', ()=>{
	const hostNode = document.createElement('test');
	const testedComponent = getTestedInstance(hostNode).render();
	const expectedText = "Changed";
	testedComponent.hello = expectedText;
	expect(hostNode.children.item(0).textContent).toBe(expectedText);
})

test('Output property bound correctly', ()=>{
	const hostNode = document.createElement('test');
	const testedComponent = getTestedInstance(hostNode);
	testedComponent.testedMethod = jest.fn();
	testedComponent.render();

	( <HTMLInputElement>hostNode.querySelector('input') ).click();
	expect(testedComponent.testedMethod).toBeCalledTimes(1);
})

test('Input property bound correctly', ()=>{
	const hostNode = document.createElement('test');
	const testedComponent = getTestedInstance(hostNode).render();

	const buttonName = ( <HTMLInputElement>hostNode.querySelector('input') ).value
	expect(buttonName).toBe(testedComponent.inputDescribeText);
})

test('Child generated', ()=>{
	const hostNode = document.createElement('test');
	getTestedInstance(hostNode).render();
	const childComponentNode = hostNode.querySelector('component-test-child');

	expect(childComponentNode.hasChildNodes()).toBeTruthy();
	expect(childComponentNode.querySelector('div').textContent).toBe(new ComponentTestChild().greeting)
})

test('Child inpunt binding work', ()=>{
	const hostNode = document.createElement('test');
	const testedComponent = getTestedInstance(hostNode).render();
	const childComponentNode = hostNode.querySelector('component-test-child');
	expect(childComponentNode.querySelector('span').textContent).toBe(testedComponent.toChild);
	
	const newMessage: string = "MessageToChild";
	testedComponent.toChild = newMessage;
	expect(childComponentNode.querySelector('span').textContent).toBe(newMessage);
})

test('Child output binding work', ()=>{
	const hostNode = document.createElement('test');
	const testedComponent = getTestedInstance(hostNode).render();
	const mockFunction = jest.fn();
	testedComponent.fromChild = () => mockFunction()
	const childNodeButton = hostNode.querySelector('component-test-child button') as HTMLButtonElement;
	childNodeButton.click();
	expect(mockFunction).toBeCalled();
})

test('Case while redefined overriden properties was breaking production while not breaking tests', ()=>{
	throw new Error('Not implemented yet');
})