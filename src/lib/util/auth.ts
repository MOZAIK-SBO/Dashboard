import { base } from '$app/paths';
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
	providers: [Keycloak],
	theme: {
		colorScheme: 'light'
	},
	trustHost: true,
	useSecureCookies: true // Needed in production because the default does not understand that the app is running behind a TLS terminated reverse proxy
});
