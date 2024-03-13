import { readable, writable } from 'svelte/store';

export type MpcParty = {
	mpc_id: string;
	host: string;
	mpc_key: string;
	region: string;
};

export const selectedTimestamps = writable<number[]>([]);
export const selectedMpcParties = writable<MpcParty[]>([]);

export const analysisTypes = readable([
	'heartbeat-demo-128',
	'placeholder-1',
	'placeholder-2',
	'placeholder-3',
	'placeholder-4'
]);
