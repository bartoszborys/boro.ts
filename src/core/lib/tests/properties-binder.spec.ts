import { PropertiesBinder } from '../PropertiesBinder';
import { Observer } from '../Observer';

class MockObserver implements Observer{
	public testingElement: jest.Mock<any, any>;

	public update(value: number): void {
		this.testingElement();
	}
}
const mockObject = { "propOne": 12 }
const testedObject = new PropertiesBinder(mockObject);

test('Without observer', ()=>{
	const expectedValue = 13;
	mockObject.propOne = expectedValue;
	expect(mockObject.propOne).toBe(expectedValue);
})

test('One observer', ()=>{
	const observer = new MockObserver();
	observer.testingElement = jest.fn();
	testedObject.addObserver("propOne", observer);
	mockObject.propOne = 13;
	expect(observer.testingElement).toBeCalled();
})

test('More observers', ()=>{
	const observer = new MockObserver();
	const anotherObserver = new MockObserver();
	observer.testingElement = jest.fn();
	anotherObserver.testingElement = jest.fn();
	testedObject.addObserver("propOne", observer);
	testedObject.addObserver("propOne", anotherObserver);
	mockObject.propOne = 13;
	expect(observer.testingElement).toBeCalled();
	expect(anotherObserver.testingElement).toBeCalled();
})
