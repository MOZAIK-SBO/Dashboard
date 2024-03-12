import { writable } from 'svelte/store';

export const selectedTimestamps = writable<number[]>([]);
export const selectedMpcParties = writable<string[]>([]);
