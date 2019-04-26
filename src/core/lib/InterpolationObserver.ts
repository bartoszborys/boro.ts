import { Observer } from "./Observer";
import { InterpolationTemplate } from "../types/InterpolationTemplate";

export class InterpolationObserver implements Observer{
	public constructor(private interpolations: InterpolationTemplate[]){}
	
	public update(value: any): void {
		this.interpolations.forEach( (item: InterpolationTemplate) =>{
			item.node.textContent = item.template.replace(/{{[a-zA-Z0-9]+}}/g, value);
		})
	}
}