import { localStorageStore } from '$lib/util/LocalStorageStore';
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

export const userClientStore: Writable<UserClientData> = localStorageStore('userClientStore', {
	client_id: '',
	client_secret: '',
	user_public_key: '',
	iot_dataset: '',
	result_dataset: '',
	client_jwt_token: null,
	client_jwt_token_iat: 0
});
