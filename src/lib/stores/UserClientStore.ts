import { localStorageStore } from '$lib/util/LocalStorageStore';
import { setContext, getContext } from 'svelte';
import type { Writable } from 'svelte/store';

export interface UserClientData {
	client_id: string;
	client_secret: string;
	user_public_key: string;
	iot_dataset: string;
	result_dataset: string;
	client_jwt_token: string | null;
	client_jwt_token_iat: number;
}

export function initUserClientStore() {
	// Store user data: client ID, client secret, datasets, public key
	const userClientStore: Writable<UserClientData> = localStorageStore('userClientStore', {
		client_id: '',
		client_secret: '',
		user_public_key: '',
		iot_dataset: '',
		result_dataset: '',
		client_jwt_token: null,
		client_jwt_token_iat: 0
	});

	setContext('userClientStore', userClientStore);
}

export function getUserClientStore(): Writable<UserClientData> {
	return getContext('userClientStore');
}
