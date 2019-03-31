import { ComponentConfig } from 'src/types/ComponentConfig';
import { Component } from '../core/Component';

export class UserTable extends Component{
	public config: ComponentConfig = {
		name: "user-table"
	};
	public input: number;
	public title: string;

	callChange(){
		this.triggerOutput('parenttitle', (<HTMLInputElement>this.hostNode.querySelector(".action-change")).value);
	}
	
	callPlus(){
		this.triggerOutput('plus', "UserTable Call -- plus");
	}
	
	callMinus(){
		this.triggerOutput('minus', "UserTable Call -- minus");
	}

	public getTemplate(){
		return `
			<div style="margin: 5px;">
				<div $class="title">UserTable component, Input Value: {{input}}</div>
				<input #click="callPlus" value="+" type="button"/>
				<input #click="callMinus" value="-" type="button"/>
				<input class="action-change" $value="title" #input="callChange" type="text"/>
				<another-component style="display: block; background: #00a7e6;" $input="input"></another-component>
			</div>
		`
	}
}