import { PUBLIC_MOZAIK_API_ENDPOINT } from '$env/static/public';
import { getUserClientToken } from '$lib/util/UserClientAuth';
import { toast } from 'svelte-sonner';
import type { PageLoad } from './$types';

export const ssr = false;

export const load: PageLoad = async ({ fetch }) => {
	const batches = await fetch(`${PUBLIC_MOZAIK_API_ENDPOINT}/batches`, {
		method: 'GET',
		headers: {
			authorization: `Bearer ${await getUserClientToken()}`
		}
	})
		.then((res) => {
			if (res.ok) {
				return res.json();
			} else {
				throw res.statusText;
			}
		})
		.catch((err) => {
			toast.error(`Error: ${err.toString()}`, {
				description: 'Check the developer console for more details.'
			});
			console.error(err);
			return [];
		});

	const analyses = await fetch(`${PUBLIC_MOZAIK_API_ENDPOINT}/analysis`, {
		method: 'GET',
		headers: {
			authorization: `Bearer ${await getUserClientToken()}`
		}
	})
		.then((res) => {
			if (res.ok) {
				return res.json();
			} else {
				throw res.statusText;
			}
		})
		.catch((err) => {
			toast.error(`Error: ${err.toString()}`, {
				description: 'Check the developer console for more details.'
			});
			console.error(err);
			return [];
		});

	return { batches, analyses };
};
