import { PUBLIC_KEYCLOAK_OBELISK } from '$env/static/public';
import { userClientStore } from '$lib/stores/UserClientStore';
import { toast } from 'svelte-sonner';
import { get } from 'svelte/store';

export async function userClientAuthentication(userClientFormData: any, firstAuth = true) {
	await fetch(`${PUBLIC_KEYCLOAK_OBELISK}`, {
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

				if (firstAuth) {
					toast.success('Authentication successful', {
						description: 'You can now perform computations on your data.'
					});
				}
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

export async function getUserClientToken() {
	let userClientData = get(userClientStore);

	if (
		userClientData.client_jwt_token == null ||
		Date.now() - userClientData.client_jwt_token_iat > 200000 // Elapsed time larger than 200 seconds (token is valid for 300 seconds)
	) {
		await userClientAuthentication(
			{
				client_id: userClientData.client_id,
				client_secret: userClientData.client_secret,
				iot_dataset: userClientData.iot_dataset,
				result_dataset: userClientData.result_dataset
			},
			false
		);

		return get(userClientStore).client_jwt_token!;
	} else {
		return userClientData.client_jwt_token!;
	}
}
