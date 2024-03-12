import { readable, writable } from 'svelte/store';

export const selectedTimestamps = writable<number[]>([]);
export const selectedMpcParties = writable<string[]>([]);

export const analysisTypes = readable([
	'heartbeat-demo-128',
	'placeholder-1',
	'placeholder-2',
	'placeholder-3',
	'placeholder-4'
]);
