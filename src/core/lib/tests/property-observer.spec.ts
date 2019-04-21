import { PropertyObserver } from '../PropertyObserver';
import { UnknownProperties } from '../../types/UnknownProperties';

const observedMock: UnknownProperties = {
	testProperty: null
};
const propertyName = "testProperty";
const testedInstace = new PropertyObserver(observedMock, propertyName);

test('Observer updates object property', ()=>{
	const value = 12;
	testedInstace.update(value);
	expect( observedMock["testProperty"] ).toBe(value);
})