import { Component } from "../Component";
import { ComponentConfig } from "../types/ComponentConfig";

export class NotExistsOutputPropertyComponent extends Component{
	protected config: ComponentConfig ={
		name: "not-exist-output-property"
	};

	protected getTemplate(): string {
		return `
			<component-test-child #notExistOutput="outHandler"></component-test-child>
		`
	}

	outHandler(){}
}