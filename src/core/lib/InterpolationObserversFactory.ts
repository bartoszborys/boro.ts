import { BoundInterpolations } from "../types/BoundInterpolations";
import { InterpolationObserver } from "./InterpolationObserver";
import { Observer } from "./Observer";
import { InterpolationFactory } from "./InterpolationFactory";

export class InterpolationObserversFactory implements InterpolationFactory{
	private boundInterpolations: BoundInterpolations = {};
	public constructor(){}

	public get(node: Text, memberName: string): Observer | null {
		this.bindTextInterpolations(node, memberName);
		return new InterpolationObserver(this.boundInterpolations[memberName]);
	}

	private bindTextInterpolations(node: Text, memberName: string){
		this.initializeInterpolation(memberName);
		this.addInterpolation(memberName, node);
	}

	private initializeInterpolation(memberName: string){
		if(this.boundInterpolations[memberName] == undefined){
			this.boundInterpolations[memberName] = [];
		}
	}

	private addInterpolation(memberName: string, interpolatedNode: Text) {
		this.boundInterpolations[memberName].push({
			node: interpolatedNode,
			template: interpolatedNode.textContent
		});
	}
}