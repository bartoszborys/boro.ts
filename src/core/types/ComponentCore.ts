export interface ComponentCore{
	getName(): string;
	setHostNode(_hostNode: HTMLElement): void;
	render(): void;
}