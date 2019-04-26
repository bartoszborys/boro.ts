import { InterpolationObserversFactory } from "../InterpolationObserversFactory";
import { InterpolationFactory } from "../InterpolationFactory";
import { InterpolationObserver } from "../InterpolationObserver";

const domMock = document.createElement('span');
domMock.innerHTML = `{{value}}`;

const factory: InterpolationFactory = new InterpolationObserversFactory();

test('Should generate observer', ()=>{
	expect( factory.get(<Text>domMock.childNodes.item(0), "value" ) ).toBeInstanceOf(InterpolationObserver);
});

test('Observer should update correct node', ()=>{
	const value = "TEST VALUE";
	const textNode = <Text>domMock.childNodes.item(0);
	factory.get(textNode, "value").update(value);
	expect( textNode.textContent ).toBe(value);
})