import type { MetricEvent, MpcParty } from '$lib/types';
import { readable, writable } from 'svelte/store';

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
