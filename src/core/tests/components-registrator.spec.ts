import { ComponentRegistrator } from '../ComponentsRegistrator';
import { Component } from '../Component';
import { ComponentConfig } from '../types/ComponentConfig';
import { RegisteredComponents } from '../types/RegisteredComponents';

class ComponentMock extends Component{
	protected getTemplate(): string {
		throw new Error("Method not implemented.");
	}
	protected config: ComponentConfig = {
		name: 'component-mock'
	};
}

class AnotherComponentMock extends Component{
	protected getTemplate(): string {
		throw new Error("Method not implemented.");
	}
	protected config: ComponentConfig = {
		name: 'another-component-mock'
	};
}

const testedInstance = new ComponentRegistrator();
testedInstance.register([
	ComponentMock,
	AnotherComponentMock
])

test('Components are registered', ()=>{
	const expectedResult: RegisteredComponents = {
		"component-mock": ComponentMock,
		"another-component-mock": AnotherComponentMock
	};
	expect( testedInstance.get() ).toMatchObject( expectedResult );
})