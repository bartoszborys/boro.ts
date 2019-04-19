export interface Observer<Type>{
	update(value: Type): void;
}