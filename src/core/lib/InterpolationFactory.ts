import { Observer } from "./Observer";

export interface InterpolationFactory{
	get(node: Text, memberName: string): Observer | null;
} 