<script lang="ts">
	import { PUBLIC_MOZAIK_API_ENDPOINT } from '$env/static/public';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { getUserClientToken } from '$lib/util/UserClientAuth';
	import { toast } from 'svelte-sonner';
	import { DateFormatter } from '@internationalized/date';
	import type { Analysis, MpcParty } from '$lib/types';
	import { page } from '$app/stores';
	import { Separator } from '$lib/components/ui/separator';
	import { Button } from '$lib/components/ui/button';
	import { hexToBuffer, mpcKeyToCryptoKey, reconstructResult } from '$lib/util/MpcKeyShares';
	import { userClientStore } from '$lib/stores/UserClientStore';

	// Props
	export let openDialog = false;
	export let analysis: Analysis;

	const df = new DateFormatter('en-US', {
		dateStyle: 'full',
		timeStyle: 'medium'
	});

	type AnalysisResult = {
		timestamp: number;
		metric: string;
		source: string;
		value: { empty: boolean; map: { c_result: string; is_combined: boolean } };
	};

	type AnalysisResultsQuery = {
		items: AnalysisResult[];
		cursor: string;
	};

	let analysisResult: AnalysisResultsQuery;
	let involvedMpcParties: MpcParty[] = $page.data.mpcParties.filter((party: MpcParty) =>
		analysis.parties.includes(party.mpc_id)
	);

	async function fetchAnalysisResult() {
		analysisResult = await fetch(
			`${PUBLIC_MOZAIK_API_ENDPOINT}/analysis/result/${analysis.analysis_id}`,
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
				return { items: [] };
			});
	}

	// Fetch analysis result
	$: {
		if (openDialog) {
			fetchAnalysisResult();
		}
	}

	let reconstructedAnalysisResults: string[] = [];

	async function reconstructAnalysisResults() {
		try {
			for (const result of analysisResult.items) {
				reconstructedAnalysisResults.push(
					new Uint8Array(
						await reconstructResult(
							analysis.user_id,
							new Uint8Array($userClientStore.iot_key),
							await mpcKeyToCryptoKey(involvedMpcParties[0].mpc_key),
							await mpcKeyToCryptoKey(involvedMpcParties[1].mpc_key),
							await mpcKeyToCryptoKey(involvedMpcParties[2].mpc_key),
							analysis.analysis_id,
							analysis.analysis_type,
							hexToBuffer(result.value.map.c_result)
						)
					).reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), '')
				);
				reconstructedAnalysisResults = reconstructedAnalysisResults; //https://learn.svelte.dev/tutorial/updating-arrays-and-objects
			}
		} catch (e: any) {
			toast.error(`Error: ${e}`, {
				description:
					'Did you provide the correct IoT device key? Check the developer console for more details.'
			});
			console.error(e);
		}
	}
</script>

<Dialog.Root bind:open={openDialog}>
	<Dialog.Trigger />
	{#if analysisResult}
		<Dialog.Content class="md:max-w-xl lg:max-w-4xl">
			<Dialog.Header>
				<Dialog.Title>Analysis result</Dialog.Title>
				<Dialog.Description>Reconstruct the analysis result(s).</Dialog.Description>
			</Dialog.Header>
			<div class="grid gap-2 py-4">
				<div class="grid grid-cols-5 items-center">
					<p class="text-sm font-bold">Analysis ID</p>
					<p class="col-span-4 text-sm">{analysis.analysis_id}</p>
				</div>
				<div class="grid grid-cols-5 items-center">
					<p class="text-sm font-bold">Created at</p>
					<p class="col-span-4 text-sm">
						{df.format(new Date(analysis.created_at))}
					</p>
				</div>
				<div class="grid grid-cols-5 items-center">
					<p class="text-sm font-bold">Status</p>
					<p class="col-span-4 text-sm">{analysis.status}</p>
				</div>
				<div class="grid grid-cols-5 items-center">
					<p class="text-sm font-bold">Metric</p>
					<p class="col-span-4 text-sm">{analysis.metric}</p>
				</div>
				<div class="grid grid-cols-5 items-center">
					<p class="text-sm font-bold">Analysis type</p>
					<p class="col-span-4 text-sm">{analysis.analysis_type}</p>
				</div>
				<div class="grid grid-cols-5 items-center">
					<p class="text-sm font-bold">Involved parties</p>
					<p class="col-span-4 text-sm">{analysis.parties.join(', ')}</p>
				</div>
				<div class="grid grid-cols-5 items-center">
					<p class="text-sm font-bold">Results are</p>
					<p class="col-span-4 text-sm">
						{analysisResult.items[0].value.map.is_combined ? 'Combined' : 'Shares'}
					</p>
				</div>
				<div class="grid grid-cols-5 items-center">
					<p class="text-sm font-bold">Computations</p>
					<p class="col-span-4 text-sm">{analysis.data_index.length}</p>
				</div>
				<div class="grid grid-cols-5 items-center">
					<p class="text-sm font-bold">Results</p>
					<p class="col-span-4 text-sm">{analysisResult.items.length}</p>
				</div>
			</div>
			<Separator />
			<div class="grid gap-2 pt-4">
				<div class="mb-4 grid grid-cols-5 items-center">
					<Button class="col-span-5" size="sm" on:click={() => reconstructAnalysisResults()}>
						Reconstruct analysis result(s)
					</Button>
				</div>
				{#if reconstructedAnalysisResults.length === analysisResult.items.length}
					{#each reconstructedAnalysisResults as result, i}
						<div class="grid grid-cols-5 items-center">
							<p class="text-sm font-bold">Result {i + 1}</p>
							<p class="col-span-4 text-sm">{result}</p>
						</div>
					{/each}
				{/if}
			</div>
		</Dialog.Content>
	{/if}
</Dialog.Root>
