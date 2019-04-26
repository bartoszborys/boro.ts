import { Observer } from "../lib/Observer";

export interface PropertyObservable{
	addObserver(propertyName: string, observer: Observer): void;
}