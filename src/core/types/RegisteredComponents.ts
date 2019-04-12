import { Component } from "../Component";

export interface RegisteredComponents{
	[key: string]: typeof Component;
}