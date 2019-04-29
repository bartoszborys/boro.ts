import { Component } from "../Component";
import { ComponentConfig } from "../types/ComponentConfig";

export class ParentOutputHandlerNotExist extends Component{
	protected config: ComponentConfig ={
		name: "parent-output-handler-not-exist"
	};

	protected getTemplate(): string {
		return `
			<component-test-child #notExistOutput="outHandler"></component-test-child>
		`
	}
}