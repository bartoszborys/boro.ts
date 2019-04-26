import { Component } from '../core/Component';
import { ComponentConfig } from '../core/types/ComponentConfig';

export class Main extends Component{
	public config: ComponentConfig = {
		name: "main"
	};
	
	public header: string = "I am Parent!";
	public anotherHeaderPart: string = "Second header";
	public firstCounter: number = 0;
	public firstComponentTitle: string = "First child title";
	public power: string = "12";
	public powerValue: string;

	onAfterTemplate(){
		this.changePower();
	}

	public getTemplate(){
		return `
			<div style="display: block; background: #7fff83; padding: 5px;">
				<div>Main component</div>
				<h1>{{header}} -> {{anotherHeaderPart}}</h1>
				<h2>{{firstComponentTitle}} -> {{firstComponentTitle}}, Counter = <span style="color: red">{{firstCounter}}</span></h2>
				<user-table style="display: block; background: #a7a7e6;" #parenttitle="firstComponentTitleChange" #plus="increaseFirstCounter" #minus="decreaseFirstCounter" $input="firstCounter" $title="firstComponentTitle"></user-table>
				<div style="display:flex; flex-direction: column;">
					<input $disabled="disable" #input="changePower" $value="power" type="number" class="power"/>
					<span>
						<span>{{firstCounter}}</span>
						<sup>{{power}}</sup>
						<span>=</span> 
						<span>{{powerValue}}</span>
					</span>
					<div boro-id="power" #mouseover="over" #mouseout="out">Current power: {{power}}</div>
				</div>
			</div>
		`
	}

	public over(){
		const element = this.hostNode.querySelector('[boro-id="power"]') as HTMLElement
		element.style.background = "red";
	}

	public out(){
		const element = this.hostNode.querySelector('[boro-id="power"]') as HTMLElement
		element.style.background = "green";
	}
	
	public disable = false;

	increaseFirstCounter(){
		this.firstCounter++;
		this.changePower();
		this.disable = true;
	}
	
	decreaseFirstCounter(){
		this.firstCounter--;
		this.changePower();
		this.disable = false;
	}

	firstComponentTitleChange(value: string){
		this.firstComponentTitle = value;
	}

	changePower(): any {
		const value = (<HTMLInputElement>this.hostNode.querySelector(".power")).value;
		this.power = parseInt(value) == NaN ? "0" : value;
		this.powerValue = Math.pow(this.firstCounter, parseInt(this.power)).toString();
	}
}