import { Component } from "../Component";
import { ComponentConfig } from "../types/ComponentConfig";

export class ComponentTest extends Component{
	public hello: string = "Hello world!";
	public toChild: string = "to child string"
	public inputDescribeText: string = "input_name";

	protected config: ComponentConfig ={
		name: "component-test"
	};

	protected getTemplate(): string {
		return `
			<div>{{hello}}</div>
			<input #click="testedMethod" $value="inputDescribeText" type="button"/>
			<component-test-child $fromparent="toChild"></component-test-child>
			<div>
				<component-test-child><component-test-child>
			</div>
		`
	}

	public testedMethod(){
		throw new Error('Not implemented yet');
	}
}