import { base } from '$app/paths';
import { KEYCLOAK_CLIENT_ID, KEYCLOAK_CLIENT_SECRET, KEYCLOAK_ISSUER } from '$env/static/private';
import Keycloak from '@auth/core/providers/keycloak';
import { SvelteKitAuth } from '@auth/sveltekit';
import { redirect, type Handle } from '@sveltejs/kit';

// Authorization handle that will redirect the user to login page if not authenticated
export const authorizationHandle: Handle = async ({ event, resolve }) => {
	const session = await event.locals.auth();

	if (!session) {
		redirect(303, `${base}/auth/signin`);
	}

	return resolve(event);
};

export const {
	handle: authInitHandle,
	signIn,
	signOut
} = SvelteKitAuth({
	providers: [
		Keycloak({
			clientId: KEYCLOAK_CLIENT_ID,
			clientSecret: KEYCLOAK_CLIENT_SECRET,
			issuer: KEYCLOAK_ISSUER
		})
	],
	theme: {
		colorScheme: 'light'
	},
	trustHost: true
});
