import { Component } from "../Component";
import { ComponentConfig } from "../types/ComponentConfig";

export class ParentInputHandlerNotExist extends Component{
	protected config: ComponentConfig ={
		name: "parent-input-handler-not-exist"
	};

	protected getTemplate(): string {
		return `
			<component-test-child $greeting="notExistInput"></component-test-child>
		`
	}
}