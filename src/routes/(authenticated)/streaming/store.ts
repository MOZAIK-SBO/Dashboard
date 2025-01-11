import { readable, writable } from 'svelte/store';

export const batchSizes = readable([1, 2, 4, 64, 128]);
export const selectedBatchSize = writable<number>(1);

export const analysisTypes = readable([
	'Heartbeat-Demo-1',
	'heartbeat-demo-128',
	'placeholder-1',
	'placeholder-2',
	'placeholder-3',
	'placeholder-4'
]);
