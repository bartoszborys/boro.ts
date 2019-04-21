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
			<component-test-child #fromchild="fromChild" $fromparent="toChild"></component-test-child>
			<input #click="testedMethod" $value="inputDescribeText" type="button"/>
			<div>
				<component-test-child><component-test-child>
			</div>
		`
	}

	public fromChild(){
		throw new Error("Not implemented yet");
	}

	public testedMethod(){
		throw new Error('Not implemented yet');
	}
}