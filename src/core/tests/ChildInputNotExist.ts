import { Component } from "../Component";
import { ComponentConfig } from "../types/ComponentConfig";

export class ChildInputNotExist extends Component{
	protected config: ComponentConfig ={
		name: "child-input-not-exist"
	};

	protected getTemplate(): string {
		return `
			<component-test-child $notExistInput="outHandler"></component-test-child>
		`
	}

	outHandler(){}
}