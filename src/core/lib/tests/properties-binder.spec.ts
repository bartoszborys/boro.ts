import { PropertiesBinder } from '../PropertiesBinder';
import { Observer } from '../Observer';

class MockObserver implements Observer{
	public testingElement: jest.Mock<any, any>;

	public update(value: number): void {
		this.testingElement();
	}
}
const mockObject = { 
	"propOne": 12,
	"ambigous": 13,
	"AmbiGous": 13
}
const testedObject = new PropertiesBinder(mockObject);

test('Should bind one observer', ()=>{
	const observer = new MockObserver();
	observer.testingElement = jest.fn();
	testedObject.addObserver("propOne", observer);
	mockObject.propOne = 13;
	expect(observer.testingElement).toBeCalled();
})

test('Should bind property case-insensitive', ()=>{
	const observer = new MockObserver();
	observer.testingElement = jest.fn();
	testedObject.addObserver("PrOpOnE", observer);
	mockObject.propOne = 13;
	expect(observer.testingElement).toBeCalled();
})

test('Should bind more than one observer', ()=>{
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

test("Shouldn't bind observer to unset property", ()=>{
	const observer = new MockObserver();
	observer.testingElement = jest.fn();
	expect( () => testedObject.addObserver("unsetProperty", observer) ).toThrowError("Unknown object property >> 'unsetProperty'.")
})

test("Shouldn't bind observer to ambigous property", ()=>{
	const observer = new MockObserver();
	observer.testingElement = jest.fn();
	expect( () => testedObject.addObserver("ambigous", observer) ).toThrowError("Property >> 'ambigous' is ambigous in given component.")
})