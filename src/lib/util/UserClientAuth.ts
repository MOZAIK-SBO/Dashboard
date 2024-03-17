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
			if (res.ok) {
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

			toast.error(`Error: ${err.toString()}`, {
				description: 'Check the developer console for more details.'
			});
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
				...userClientData
			},
			false
		);

		return get(userClientStore).client_jwt_token!;
	} else {
		return userClientData.client_jwt_token!;
	}
}
