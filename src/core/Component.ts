import { ComponentConfig } from './types/ComponentConfig';
import { ComponentCore } from './types/ComponentCore';
import { UnknownProperties } from './types/UnknownProperties';
import { BoundInterpolations } from './types/BoundInterpolations';
import { RegisteredComponents } from './types/RegisteredComponents';
import { ChildGenerator } from './lib/ChildGenerator';
import { PropertiesBinder } from './lib/PropertiesBinder';
import { PropertyObserver } from './lib/PropertyObserver';
import { Observer } from './lib/Observer';
import { InterpolationTemplate } from './types/InterpolationTemplate';

export abstract class Component implements ComponentCore, UnknownProperties {
	protected hostNode: HTMLElement;
	protected onInitialize(): void {};
	protected onAfterTemplate(): any {};
	protected abstract getTemplate(): string;
	protected abstract readonly config: ComponentConfig;
	
	private propertiesBinder: PropertiesBinder;
	private components: RegisteredComponents;
	private boundInterpolations: BoundInterpolations;
	private children: Array<UnknownProperties>;

	protected triggerOutput: (outputName: string, valueToEmitt: any) => void = (name: string, value: any) => {
		this.hostNode.dispatchEvent(new CustomEvent(name, { detail: value }));
	}

	public constructor() {
		this.children = [];
		this.boundInterpolations = {};
		this.propertiesBinder = new PropertiesBinder();
	}

	public setHostNode(_hostNode: HTMLElement) {
		this.hostNode = _hostNode;
		return this;
	}

	public getName(): string {
		return this.config.name;
	}

	public injectComponents(components: RegisteredComponents): Component{
		this.components = components;
		return this;
	}

	public render() {
		this.generateTemplate();
		this.onInitialize();
		this.bindDomElementProperties();
		this.createChildrenComponents();
		this.bindChildOutputs();
		this.bindChildInputs();
		this.onAfterTemplate();
		this.renderChilds();
		return this;
	}

	private generateTemplate(): void{
		this.hostNode.innerHTML = this.getTemplate();
		this.bindTemplateInterpolations();
	}
	
	private bindTemplateInterpolations(): void{
		const nodes: TreeWalker = document.createTreeWalker(this.hostNode, NodeFilter.SHOW_TEXT);
		let node: Text = null;
		while(node = <Text>nodes.nextNode()){
			const interpolations: string[] = node.nodeValue.match(/{{[a-zA-Z0-9]+}}/g);
			if(interpolations === null){
				continue;
			}
			let interpolatedNode: Text = node;
			for(const interpolation of interpolations){
				interpolatedNode = this.splitByInterpolation(interpolatedNode, interpolation);
				
				const memberName: string = interpolation.replace("}}", "").replace("{{", "");
				if(this.boundInterpolations[memberName] == undefined){
					this.boundInterpolations[memberName] = [];
				}
				this.boundInterpolations[memberName].push({
					node: node,
					template: node.textContent
				});

				const observer: Observer = {
					update: (value: any)=>{
						this.boundInterpolations[memberName].forEach( (item: InterpolationTemplate) =>{
							item.node.textContent = item.template.replace(/{{[a-zA-Z0-9]+}}/g, value);
						})
					}
				}
				const object = <UnknownProperties>this;
				this.propertiesBinder.observe(this, memberName, observer);
				observer.update(object[memberName]);
			}
		}
	}

	private splitByInterpolation(node: Text, interpolation: string): Text{
		return node.splitText( node.textContent.indexOf(interpolation) + interpolation.length );
	}

	private bindDomElementProperties(): void{
		const nodeWithAttributesWalker: TreeWalker = document.createTreeWalker(this.hostNode, NodeFilter.SHOW_ELEMENT)
		const inputPrefix = '$';
		const eventPrefix = '#';
		
		let nodeWithAttributes: HTMLElement;
		while(nodeWithAttributes = <HTMLElement>nodeWithAttributesWalker.nextNode()){
			if(this.components[nodeWithAttributes.nodeName.toLowerCase()] != undefined){
				continue;
			}
			this.bindProperties(eventPrefix, nodeWithAttributes, this.bindEventProperty);
			this.bindProperties(inputPrefix, nodeWithAttributes, this.bindInputProperty);
		}
	}

	private bindProperties(attributePrefix: string, nodeWithAttributes: HTMLElement, bindingHandler: (node: HTMLElement, propery: Attr)=>void){
		const currentEventAttributes = this.getNodeAttributesWithPrefix(attributePrefix, nodeWithAttributes);

		if(!currentEventAttributes.length){
			return;
		}

		const handlerWithCorrectPointer = bindingHandler.bind(this);
		for(let currentAttribute of currentEventAttributes){
			handlerWithCorrectPointer(nodeWithAttributes, currentAttribute);
			nodeWithAttributes.removeAttribute(`${currentAttribute.name}`);
		}
	}

	private bindEventProperty(node: HTMLElement, property: Attr){
		const currentComponent: UnknownProperties = this;
		const eventName = property.name.replace("#", "");
		const actionHandlerName = property.value;
		node.addEventListener(eventName, () => currentComponent[actionHandlerName]() );
	}

	private bindInputProperty(node: HTMLElement, attrubute: Attr){
		const currentComponent: UnknownProperties = this;
		const nodeWithAnyProperty: any = <any>node;
		const memberName = attrubute.value;
		let propertyName = attrubute.name.replace("$", "");
		
		if( nodeWithAnyProperty[propertyName] == undefined ){
			propertyName = this.getCamelCasePropertyName(propertyName, node);
		}

		if( nodeWithAnyProperty[propertyName] != undefined ){
			const observer: Observer = new PropertyObserver(nodeWithAnyProperty, propertyName);
			observer.update( currentComponent[memberName] );
			this.propertiesBinder.observe(currentComponent, memberName, observer);
		}
	}

	private getCamelCasePropertyName(searchedProperty: string, node: HTMLElement){
		for(let property in node){
			if(property.toLowerCase() == searchedProperty.toLowerCase()){
				return property;
			}
		}
	}

	private createChildrenComponents() {
		this.children = new ChildGenerator(this.components).generate(this.hostNode.childNodes);
	}

	private bindChildOutputs() {
		const outputPrefix = '#';
		const childrenHostNodes: HTMLElement[] = this.getChildsWithAttributes().map(child => child.hostNode);
		for (const childHostNode of childrenHostNodes) {
			for (const outputAttributes of this.getNodeAttributesWithPrefix(outputPrefix, childHostNode)) {
				const outputName: string = outputAttributes.name.substr(1);
				const handlerName: string = outputAttributes.value;
				childHostNode.addEventListener(outputName, (event: CustomEvent) => this.outputHandler(event, handlerName));
				childHostNode.removeAttribute(`${outputPrefix}${outputName}`);
			}
		}
	}

	private outputHandler(event: CustomEvent, handlerName: string) {
		const eventFromChild = this.children.map(child => child.hostNode).indexOf(event.srcElement as HTMLElement) !== -1;
		if (eventFromChild) {
			const currentObject: UnknownProperties = this;
			if (!(currentObject[handlerName] instanceof Function)) {
				throw new Error("Output handler is not defined");
			}
			currentObject[handlerName](event.detail);
		}
	}

	private bindChildInputs() {
		const inputPrefix = '$';
		const currentObject: UnknownProperties = this;
		for (const childWithAttributes of this.getChildsWithAttributes()) {
			for (const inputAttributes of this.getNodeAttributesWithPrefix(inputPrefix, childWithAttributes.hostNode)) {
				const childInputName = inputAttributes.name.substr(1);
				const parentInputName = inputAttributes.value;

				const observer: Observer = new PropertyObserver(childWithAttributes, childInputName);
				this.propertiesBinder.observe(currentObject, parentInputName, observer);
				observer.update(currentObject[parentInputName]);
				childWithAttributes.hostNode.removeAttribute(`${inputPrefix}${childInputName}`);
			}
		}
	}
	private getChildsWithAttributes(): UnknownProperties[] {
		return this.children.filter(child => child.hostNode.hasAttributes());
	}

	private getNodeAttributesWithPrefix(prefix: string, hostNode: HTMLElement): Attr[] {
		const attrbutes: Attr[] = [];

		for (let currentIndex: number = 0; currentIndex < hostNode.attributes.length; currentIndex++) {
			attrbutes.push(hostNode.attributes.item(currentIndex));
		}

		return attrbutes.filter(attribute => attribute.name.indexOf(prefix) === 0);
	}

	private renderChilds() {
		for (const child of this.children) {
			child.render();
		}
	}
}