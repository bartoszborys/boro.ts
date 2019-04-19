import { RegisteredComponents } from "../types/RegisteredComponents";
import { UnknownProperties } from "../types/UnknownProperties";

export class ChildGenerator{
	private children: Array<UnknownProperties>;
	public constructor(private components: RegisteredComponents){}

	public generate(childrenNodes: NodeListOf<ChildNode>): Array<UnknownProperties>{
		this.children = [];
		this.createChildrenComponents(childrenNodes);
		return this.children;
	}

	private createChildrenComponents(childrenNodes: NodeListOf<ChildNode>){
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

		if (this.components.hasOwnProperty(nodeName.toLowerCase())) {
			const ComponentConstructor: any = this.components[nodeName.toLowerCase()];
			this.children.push(
				new ComponentConstructor()
					.setHostNode(childNode)
					.injectComponents(this.components)
			);
		}
	}

}