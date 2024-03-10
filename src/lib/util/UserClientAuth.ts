import { PUBLIC_KEYCLOAK_OBELISK } from '$env/static/public';
import type { UserClientData } from '$lib/stores/UserClientStore';
import { toast } from 'svelte-sonner';
import { get, type Writable } from 'svelte/store';

export async function userClientAuthentication(
	userClientFormData: any,
	userClientStore: Writable<UserClientData>
) {
	fetch(`${PUBLIC_KEYCLOAK_OBELISK}`, {
		method: 'POST',
		headers: {
			Authorization: `Basic ${btoa(`${userClientFormData.client_id}:${userClientFormData.client_secret}`)}`,
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: 'grant_type=client_credentials'
	})
		.then(async (res) => {
			if (res.status === 200) {
				const resJson = await res.json();

				userClientStore.set({
					...userClientFormData,
					client_jwt_token: resJson.access_token,
					client_jwt_token_iat: Date.now()
				});

				toast.success('Authentication successful', {
					description: 'You can now perform computations on your data.'
				});
			} else {
				userClientStore.update((u) => {
					return {
						...u,
						client_jwt_token: null,
						client_jwt_token_iat: 0
					};
				});

				toast.error(`Authentication failed: ${res.status} (${res.statusText})`, {
					description: 'Check your client credentials.'
				});
			}
		})
		.catch((err) => {
			userClientStore.update((u) => {
				return {
					...u,
					client_jwt_token: null,
					client_jwt_token_iat: 0
				};
			});

			toast.error(`${err}`, { description: 'Check the developer console logs' });
		});
}

export async function getUserClientToken(userClientStore: Writable<UserClientData>) {
	let userClientData = get(userClientStore);

	if (
		userClientData.client_jwt_token == null ||
		Date.now() - userClientData.client_jwt_token_iat < 30000
	) {
		await userClientAuthentication(
			{
				client_id: userClientData.client_id,
				client_secret: userClientData.client_secret,
				iot_dataset: userClientData.iot_dataset,
				result_dataset: userClientData.result_dataset
			},
			userClientStore
		);

		userClientData = get(userClientStore);
	}

	return userClientData.client_jwt_token!;
}
