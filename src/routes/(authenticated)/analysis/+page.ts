import { PUBLIC_MOZAIK_API_ENDPOINT } from '$env/static/public';
import { getUserClientToken } from '$lib/util/UserClientAuth';
import { toast } from 'svelte-sonner';
import type { PageLoad } from './$types';

export const ssr = false;

export const load: PageLoad = async ({ fetch }) => {
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

	for (const analysis of analyses) {
		// Every analysis has a status from each MPC party
		analysis.statuses = await fetch(
			`${PUBLIC_MOZAIK_API_ENDPOINT}/analysis/status/${analysis.analysis_id}`,
			{
				method: 'GET',
				headers: {
					authorization: `Bearer ${await getUserClientToken()}`
				}
			}
		)
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

		const analysisStatusesSet = new Set(
			analysis.statuses.map(({ status }: { status: string }) => status.toLowerCase())
		);

		// Always show the least advanced status
		if (analysisStatusesSet.has('failed')) {
			analysis.status = 'Failed';
		} else if (analysisStatusesSet.has('queued')) {
			analysis.status = 'Queued';
		} else if (analysisStatusesSet.has('running')) {
			analysis.status = 'Running';
		} else if (analysisStatusesSet.has('completed')) {
			analysis.status = 'Completed';
		} else {
			analysis.status = 'Unknown';
		}
	}

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

	return { analyses, mpcParties };
};
