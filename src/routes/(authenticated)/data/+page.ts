import { get } from 'svelte/store';
import type { PageLoad } from './$types';
import { getUserClientToken } from '$lib/util/UserClientAuth';
import { PUBLIC_MOZAIK_API_ENDPOINT } from '$env/static/public';
import { userClientStore } from '$lib/stores/UserClientStore';
import { toast } from 'svelte-sonner';

export const ssr = false;

export const load: PageLoad = async ({ fetch }) => {
	const metricEventData = await fetch(`${PUBLIC_MOZAIK_API_ENDPOINT}/data/query`, {
		method: 'POST',
		headers: {
			authorization: `Bearer ${await getUserClientToken()}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			dataRange: {
				datasets: [get(userClientStore).iot_dataset]
			},
			limit: 250000
		})
	})
		.then((res) => {
			if (res.ok) {
				return res.json();
			} else {
				throw res.statusText;
			}
		})
		.then((metricEventData) => {
			return metricEventData.items;
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

	return { metricEventData, mpcParties };
};
