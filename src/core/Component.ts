import { components } from '../../src/index';
import { ComponentConfig } from 'src/types/ComponentConfig';
import { ComponentCore } from './ComponentCore';
import { OverridedProperties } from 'src/types/OverridedPropeties';
import { BoundInterpolations } from 'src/types/BoundInterpolations';

export abstract class Component implements ComponentCore {
	public abstract readonly config: ComponentConfig;
	protected abstract getTemplate(): string;

	public hostNode: HTMLElement;
	public boundOverridenProperties: OverridedProperties;
	private boundInterpolations: BoundInterpolations;
	private children: Array<ComponentCore>;
	private template: HTMLElement;
	
	protected onInitialize(): void {};
	protected onAfterTemplate(): any {};

	protected triggerOutput: (outputName: string, valueToEmitt: any) => void = (name: string, value: any) => {
		this.hostNode.dispatchEvent(new CustomEvent(name, { detail: value }));
	}

	public constructor() {
		this.children = [];
		this.boundOverridenProperties = {};
		this.boundInterpolations = {};
	}

	public setHostNode(_hostNode: HTMLElement) {
		this.hostNode = _hostNode;
		return this;
	}

	public render() {
		this.generateTemplate();
		this.cleanUp();
		this.onInitialize();
		this.insertTemplate();
		this.createChildrenComponents(this.hostNode.childNodes);
		this.bindChildOutputs();
		this.bindChildInputs();
		this.bindPropertyBindings();
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
		const textNodes: TreeWalker = document.createTreeWalker(this.template, NodeFilter.SHOW_TEXT);
		const generator = this.getComponentIdGenerator();
		const currentObject: ComponentCore = this;
		let textNode = null;
		while(textNode = textNodes.nextNode()){
			const interpolations: string[] = textNode.nodeValue.match(/{{[a-zA-Z0-9]+}}/g);

			if(interpolations === null){
				continue;
			}
			
			for(const interpolation of interpolations){
				const memberName: string = interpolation.replace("}}", "").replace("{{", "");
				
				const currentNodeAttributes = this.getNodeAttributesWithPrefix(this.getComponentIdPrefix(), textNode.parentElement);
				const attributesCount = currentNodeAttributes.length;
				
				if(attributesCount > 1){
					throw new Error('Node has more than 1 boro attribute');
				}

				const currentId = (attributesCount == 1) ? currentNodeAttributes.pop().name : `${generator.next().value}`;

				textNode.parentElement.setAttribute(currentId, "");
				
				if(this.boundInterpolations[currentId] === undefined){
					this.boundInterpolations[currentId] = [];
				}
				this.boundInterpolations[currentId].push(memberName);
				this.defineWatch(currentObject, memberName);
				this.boundOverridenProperties[memberName].changeHandlers.push( () => this.reinterpolateNodeWithId(currentId) )
			}
		}
	}
	
	private bindPropertyBindings(): void{
		const nodeWithAttributesWalker: TreeWalker = document.createTreeWalker(this.hostNode, NodeFilter.SHOW_ELEMENT)
		
		const currentComponent: ComponentCore = this;
		let nodeWithAttributes: HTMLElement;
		while(nodeWithAttributes = <HTMLElement>nodeWithAttributesWalker.nextNode()){
			const currentEventAttributes = this.getNodeAttributesWithPrefix("#", <HTMLElement>nodeWithAttributes);
			if(currentEventAttributes.length){
				for(let currentAttribute of currentEventAttributes){
					const eventName = currentAttribute.name.replace("#", "");
					const actionHandlerName = currentAttribute.value;
					nodeWithAttributes.addEventListener(eventName, () => currentComponent[actionHandlerName]() );
				}
			}
			
			const currentElementPropertyAttributes = this.getNodeAttributesWithPrefix("$", <HTMLElement>nodeWithAttributes);
			if(currentElementPropertyAttributes.length){
				for(let currentAttribute of currentElementPropertyAttributes){
					let inputName = currentAttribute.name.replace("$", "");
					const memberName = currentAttribute.value;
					this.defineWatch(currentComponent, memberName);
					
					if( (<any>nodeWithAttributes)[inputName] == undefined ){
						for(let property in nodeWithAttributes){
							if(property.toLowerCase() == inputName.toLowerCase()){
								inputName = property;
								break;
							}
						}
					}

					if( (<any>nodeWithAttributes)[inputName] != undefined ){
						(<any>nodeWithAttributes)[inputName] = currentComponent[memberName];
						const testNode = nodeWithAttributes;
						this.boundOverridenProperties[memberName].changeHandlers.push( (value: any): void => {
							(<any>testNode)[inputName] = value;
						} )
					}
				}
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
		for(const currentMemberName of boundMemberNames){
			const newValue: string = this.boundOverridenProperties[currentMemberName].value;
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

	private createChildrenComponents(childrenNodes: NodeListOf<ChildNode>) {
		childrenNodes.forEach((childNode: HTMLElement) => this.createChildComponent(childNode))
	}

	private createChildComponent(childNode: HTMLElement) {
		if (childNode.childElementCount > 0) {
			this.createChildrenComponents(childNode.childNodes);
		}

		const nodeName: string = childNode.tagName;
		if (nodeName === undefined) {
			return;
		}

		if (components.hasOwnProperty(nodeName.toLowerCase())) {
			const ComponentConstructor: any = components[nodeName.toLowerCase()];
			this.children.push(new ComponentConstructor().setHostNode(childNode));
		}
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
			const currentObject: ComponentCore = this;
			if (!(currentObject[handlerName] instanceof Function)) {
				throw new Error("Handler is not defined");
			}
			currentObject[handlerName](event.detail);
		}
	}

	private bindChildInputs() {
		const inputPrefix = '$';
		const currentObject: ComponentCore = this;
		for (const childWithAttributes of this.getChildsWithAttributes()) {
			for (const inputAttributes of this.getNodeAttributesWithPrefix(inputPrefix, childWithAttributes.hostNode)) {
				const childInputName = inputAttributes.name.substr(1);
				const parentInputName = inputAttributes.value;

				const updateChildValue = (value: any): void => {
					childWithAttributes[childInputName] = value;
				};
				
				updateChildValue(currentObject[parentInputName]);
				this.defineWatch(currentObject, parentInputName);
				this.boundOverridenProperties[parentInputName].changeHandlers.push( updateChildValue );
				childWithAttributes.hostNode.removeAttribute(`${inputPrefix}${childInputName}`);
			}
		}
	}

	private defineWatch(currentObject: ComponentCore, varToWatch: string){
		if(this.boundOverridenProperties[varToWatch] !== undefined){
			console.warn(`Watch >> ${varToWatch} already set.`);
			return;
		}

		this.boundOverridenProperties[varToWatch] = {
			value: null,
			changeHandlers: []
		}

		const value = currentObject[varToWatch];
		Object.defineProperty(currentObject, varToWatch, {
			get: () => this.boundOverridenProperties[varToWatch].value,
			set: (value: any) => {
				this.boundOverridenProperties[varToWatch].value = value;
				for(const changeHandler of this.boundOverridenProperties[varToWatch].changeHandlers){
					changeHandler(value);
				}
			}
		});
		currentObject[varToWatch] = value;
	}

	private getChildsWithAttributes(): ComponentCore[] {
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