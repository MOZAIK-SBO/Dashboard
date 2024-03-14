import { readable, writable } from 'svelte/store';

export type MpcParty = {
	mpc_id: string;
	host: string;
	mpc_key: string;
	region: string;
};

export type MetricEvent = {
	timestamp: number;
	metric: string;
	source: string;
};

export const selectedMetricEvents = writable<MetricEvent[]>([]);
export const selectedMpcParties = writable<MpcParty[]>([]);

export const analysisTypes = readable([
	'Heartbeat-Demo-1',
	'heartbeat-demo-128',
	'placeholder-1',
	'placeholder-2',
	'placeholder-3',
	'placeholder-4'
]);
