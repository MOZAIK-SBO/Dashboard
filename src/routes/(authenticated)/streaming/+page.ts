import { PUBLIC_MOZAIK_API_ENDPOINT } from '$env/static/public';
import { getUserClientToken } from '$lib/util/UserClientAuth';
import { toast } from 'svelte-sonner';
import type { PageLoad } from './$types';

export const ssr = false;

export const load: PageLoad = async ({ fetch }) => {
	const streaming = await fetch(`${PUBLIC_MOZAIK_API_ENDPOINT}/streaming`, {
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

	const mpcParties = await fetch(`${PUBLIC_MOZAIK_API_ENDPOINT}/mpc/parties`, {
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
		.then((mpcParties) => {
			return mpcParties;
		})
		.catch((err) => {
			toast.error(`Error: ${err.toString()}`, {
				description: 'Check the developer console for more details.'
			});
			console.error(err);
			return [];
		});

	return { streaming, mpcParties };
};
