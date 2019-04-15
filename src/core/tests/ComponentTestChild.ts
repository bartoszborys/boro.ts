import { Component } from "../Component";
import { ComponentConfig } from "../types/ComponentConfig";

export class ComponentTestChild extends Component{
	protected config: ComponentConfig ={
		name: "component-test-child"
	};

	public fromparent: string = "Val";
	public greeting = "I'm child";

	protected getTemplate(): string {
		return `
			<div>{{greeting}}</div>
			<span>{{fromparent}}</span>
		`
	}
}