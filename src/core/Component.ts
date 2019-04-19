import { ComponentConfig } from './types/ComponentConfig';
import { ComponentCore } from './types/ComponentCore';
import { UnknownProperties } from './types/UnknownProperties';
import { BoundInterpolations } from './types/BoundInterpolations';
import { RegisteredComponents } from './types/RegisteredComponents';
import { ChildGenerator } from './lib/ChildGenerator';
import { PropertyObserver, Observer } from './lib/PropertyObserver';
import { InputAttributeObserver } from './lib/InputAttributeObserver';

export abstract class Component implements ComponentCore, UnknownProperties {
	protected hostNode: HTMLElement;
	protected onInitialize(): void {};
	protected onAfterTemplate(): any {};
	protected abstract getTemplate(): string;
	protected abstract readonly config: ComponentConfig;
	
	private propertyObserver: PropertyObserver;
	private components: RegisteredComponents;
	private boundInterpolations: BoundInterpolations;
	private children: Array<UnknownProperties>;
	private template: HTMLElement;

	protected triggerOutput: (outputName: string, valueToEmitt: any) => void = (name: string, value: any) => {
		this.hostNode.dispatchEvent(new CustomEvent(name, { detail: value }));
	}

	public constructor() {
		this.children = [];
		this.boundInterpolations = {};
		this.propertyObserver = new PropertyObserver();
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
		this.cleanUp();
		this.onInitialize();
		this.insertTemplate();
		this.bindDomElementProperties();
		this.createChildrenComponents();
		this.bindChildOutputs();
		this.bindChildInputs();
		this.onAfterTemplate();
		this.renderChilds();
		return this;
	}

	private *getComponentIdGenerator(){
		let currentId = 0;
		while(true){
			currentId++;
			yield `${this.getComponentIdPrefix()}${currentId}`;
		}
	}

	private getComponentIdPrefix(){
		return 'boro-element-';
	}

	private generateTemplate(): void{
		this.template = <HTMLElement>this.hostNode.cloneNode(false);
		this.template.innerHTML = this.getTemplate();
		this.bindTemplateInterpolations();
	}
	
	private bindTemplateInterpolations(): void{
		const nodes: TreeWalker = document.createTreeWalker(this.template, NodeFilter.SHOW_TEXT);
		const generator = this.getComponentIdGenerator();
		
		let node: Text = null;
		while(node = <Text>nodes.nextNode()){
			this.bindTextNodeInterpolations(node, generator)
		}
	}

	private bindTextNodeInterpolations(node: Text, generator: IterableIterator<string>){
		const interpolations: string[] = node.nodeValue.match(/{{[a-zA-Z0-9]+}}/g);

		if(interpolations === null){
			return;
		}
		
		const currentId = this.getInterpolatedNodeId(node, generator);
		node.parentElement.setAttribute(currentId, "");
		
		for(const interpolation of interpolations){
			this.bindCurrentInterpolation(currentId, interpolation);
		}
	}
	
	private bindCurrentInterpolation(currentId: string, interpolation: string){
		const currentObject: UnknownProperties = this;
		
		if(this.boundInterpolations[currentId] === undefined){
			this.boundInterpolations[currentId] = [];
		}

		const memberName: string = interpolation.replace("}}", "").replace("{{", "");
		
		const observer: Observer<any> = {
			update: (value: any)=>{
				this.reinterpolateNodeWithId(currentId);
			}
		}

		this.boundInterpolations[currentId].push(memberName);
		this.propertyObserver.observe(currentObject, memberName, observer);
	}

	private getInterpolatedNodeId(node: Text, generator: IterableIterator<string>){
		const currentNodeAttributes = this.getNodeAttributesWithPrefix(this.getComponentIdPrefix(), node.parentElement);
		const attributesCount = currentNodeAttributes.length;
		
		if(attributesCount > 1){
			throw new Error('Node has more than 1 boro attribute');
		}
	
		return (attributesCount == 1) ? currentNodeAttributes.pop().name : `${generator.next().value}`;
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
			const observer: Observer<any> = new InputAttributeObserver(nodeWithAnyProperty, propertyName);
			observer.update( currentComponent[memberName] );
			this.propertyObserver.observe(currentComponent, memberName, observer);
		}
	}

	private getCamelCasePropertyName(searchedProperty: string, node: HTMLElement){
		for(let property in node){
			if(property.toLowerCase() == searchedProperty.toLowerCase()){
				return property;
			}
		}
	}

	private reinterpolateNodeWithId(currentId: string){
		const interpolatedClone: HTMLElement = this.getInterpolatedTemplateNodeClone(currentId);
		const currentView: HTMLElement = this.hostNode.querySelector(`[${currentId}]`);

		if(currentView === null){
			return;
		}
		this.replaceOnlyTextNodes(currentView, interpolatedClone);
	}

	private getInterpolatedTemplateNodeClone(currentId: string): HTMLElement{
		const templateNode: HTMLElement = this.template.querySelector(`[${currentId}]`);
		
		if(templateNode === null){
			return;
		}

		const templateNodeClone: HTMLElement = <HTMLElement>templateNode.cloneNode(true);
		const boundMembersNames: string[] = this.boundInterpolations[currentId];
		this.replaceInterpolationsWithValue(boundMembersNames, templateNodeClone)
		
		return templateNodeClone;
	}

	private replaceInterpolationsWithValue(boundMemberNames: string[], interpolatedNode: HTMLElement){
		const currentObject: UnknownProperties = this;
		for(const currentMemberName of boundMemberNames){
			const newValue: string = currentObject[currentMemberName];
			for(const node of Array.from(interpolatedNode.childNodes)){
				if(node.nodeType === node.TEXT_NODE){
					const textNode: Text = <Text>node;
					textNode.textContent = textNode.textContent.replace(`{{${currentMemberName}}}`, newValue);
				}
			}
		}
	}

	private replaceOnlyTextNodes(oldView: HTMLElement, newView: HTMLElement){
		let oldViewCureentChild = <Node>oldView.firstChild;
		for(let currentNode of Array.from(newView.childNodes)){
			if(currentNode.nodeType === currentNode.TEXT_NODE){
				oldView.replaceChild(currentNode, oldViewCureentChild);
				oldViewCureentChild = currentNode.nextSibling;
			}else{
				oldViewCureentChild = oldViewCureentChild.nextSibling;
			}
		}
	}

	private insertTemplate(): any {
		const clonedTemplate = <HTMLElement>this.template.cloneNode(true);
		this.insertToHostNode(clonedTemplate.childNodes);
		this.updateAllInterpolations();
	}

	private updateAllInterpolations(){
		for( const elementId of Object.keys(this.boundInterpolations)){
			this.reinterpolateNodeWithId(elementId);
		}
	}

	private insertToHostNode(children: NodeListOf<ChildNode>){
		for( const node of Array.from(children) ){
			this.hostNode.appendChild( node );
		}
	}

	private cleanUp(){
		this.children.splice(0, this.children.length);
		this.emptyChildNodes();
	}

	private emptyChildNodes(){
		while (this.hostNode.firstChild) {
			this.hostNode.removeChild(this.hostNode.firstChild);
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

				const observer: Observer<any> = {
					update: (value: any): void => {
						childWithAttributes[childInputName] = value;
					}
				}
				
				this.propertyObserver.observe(currentObject, parentInputName, observer);
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