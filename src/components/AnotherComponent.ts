import { Component } from '../core/Component';
import { ComponentConfig } from 'src/types/ComponentConfig';

export class AnotherComponent extends Component{
	public config: ComponentConfig = {
		name: "another-component"
	};

	public input: number;
	public value: number = 0;

	plus(){
		this.value++;
	}

	
	minus(){
		this.value--;
	}

	public getTemplate(){
		return `
			<input type="button" value="+" #click="plus"/>
			<input type="button" value="-" #click="minus"/4>
			<div>AnotherComponent component, Inside value: {{value}}</div>
			<div>AnotherComponent component, Input value: {{input}}</div>
		`
	}
}