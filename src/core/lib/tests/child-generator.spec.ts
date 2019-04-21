import { ChildGenerator } from '../ChildGenerator';
import { RegisteredComponents } from '../../types/RegisteredComponents'
import { Component } from '../../Component';
import { ComponentConfig } from '../../types/ComponentConfig';

class ComponentMock extends Component{
	protected config: ComponentConfig = {name: ""};

	protected getTemplate(): string {
		return "<div></div>"
	}
}
class AnotherComponentMock extends Component{
	protected config: ComponentConfig = {name: ""};

	protected getTemplate(): string {
		return "<div></div>"
	}
}

const componentsMock: RegisteredComponents = {
	'component-mock-test': ComponentMock,
	'another-component-mock-test': AnotherComponentMock
}
const testedInstance = new ChildGenerator(componentsMock);

function generate(templateMock: string){
	const htmlMock = document.createElement('span');
	htmlMock.innerHTML = templateMock;

	return testedInstance.generate(htmlMock.childNodes);
}

test('Component is recognized and generated', ()=>{
	const generated = generate(`
		<component-mock-test></component-mock-test>
	`);

	expect(generated.length).toBe(1);
	expect(generated[0]).toBeInstanceOf(ComponentMock);
})

test('Not registered Component is not recognized', ()=>{
	const generated = generate(`
		<component-mock-test-not-registreted></component-mock-test-not-registreted>
	`);

	expect(generated.length).toBe(0);
})

test('Generate registered and skip not', ()=>{
	const generated = generate(`
		<component-mock-test></component-mock-test>
		<component-mock-test-not-registreted></component-mock-test-not-registreted>
	`);

	expect(generated.length).toBe(1);
	expect(generated[0]).toBeInstanceOf(ComponentMock);
})


test('Generate component while host node is child of another', ()=>{
	const generated = generate(`
		<div>
			<component-mock-test></component-mock-test>
		</div>
	`);

	expect(generated.length).toBe(1);
	expect(generated[0]).toBeInstanceOf(ComponentMock);
})

test('Generate component while host node is child of another', ()=>{
	const generated = generate(`
		<component-mock-test></component-mock-test>
		<another-component-mock-test></another-component-mock-test>
	`);

	expect(generated.length).toBe(2);
	expect(generated[0]).toBeInstanceOf(ComponentMock);
	expect(generated[1]).toBeInstanceOf(AnotherComponentMock);
})