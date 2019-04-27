import { Component } from "../Component";
import { ComponentConfig } from "../types/ComponentConfig";

export class NotExistsInputPropertyComponent extends Component{
	protected config: ComponentConfig ={
		name: "not-exist-input-property"
	};

	protected getTemplate(): string {
		return `
			<component-test-child $notExistInput="outHandler"></component-test-child>
		`
	}

	outHandler(){}
}