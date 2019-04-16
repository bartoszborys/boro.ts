import {PropertyObserver, Observer} from '../PropertyObserver';

class MockObserver implements Observer<number>{
	public testingElement: jest.Mock<any, any>;

	public update(value: number): void {
		this.testingElement();
	}
}
const mockObject = { "propOne": 12 }
const testedObject = new PropertyObserver();

test('Without observer', ()=>{
	const expectedValue = 13;
	mockObject.propOne = expectedValue;
	expect(mockObject.propOne).toBe(expectedValue);
})

test('One observer', ()=>{
	const observer = new MockObserver();
	observer.testingElement = jest.fn();
	testedObject.observe(mockObject, "propOne", observer);
	mockObject.propOne = 13;
	expect(observer.testingElement).toBeCalled();
})

test('More observers', ()=>{
	const observer = new MockObserver();
	const anotherObserver = new MockObserver();
	observer.testingElement = jest.fn();
	anotherObserver.testingElement = jest.fn();
	testedObject.observe(mockObject, "propOne", observer);
	testedObject.observe(mockObject, "propOne", anotherObserver);
	mockObject.propOne = 13;
	expect(observer.testingElement).toBeCalled();
	expect(anotherObserver.testingElement).toBeCalled();
})
