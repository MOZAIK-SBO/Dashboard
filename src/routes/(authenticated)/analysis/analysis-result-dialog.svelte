<script lang="ts">
	import { PUBLIC_MOZAIK_API_ENDPOINT } from '$env/static/public';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import { Separator } from '$lib/components/ui/separator';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Button } from '$lib/components/ui/button';
	import LoaderCircle from 'lucide-svelte/icons/loader-circle';
	import { getUserClientToken } from '$lib/util/UserClientAuth';
	import { toast } from 'svelte-sonner';
	import { DateFormatter } from '@internationalized/date';
	import type { Analysis, MpcParty } from '$lib/types';
	import { page } from '$app/stores';
	import {
		hexToBuffer,
		mpcKeyToCryptoKey,
		reconstructResult,
		reconstructResultFHE
	} from '$lib/util/cosicLibMozaik';
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
		value: { empty: boolean; map: { c_result: string; is_combined: boolean; analysis_id: string } };
	};

	type AnalysisResultsQuery = {
		items: AnalysisResult[];
		cursor: string;
	};

	let analysisResultsQuery: AnalysisResultsQuery;
	let involvedMpcParties: MpcParty[] = $page.data.mpcParties.filter((party: MpcParty) =>
		analysis.parties.includes(party.mpc_id)
	);

	async function fetchAnalysisResult() {
		analysisResultsQuery = await fetch(
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

	// FHE
	$: isFhe = analysis.source_dataset.toLowerCase().includes('fhe');

	let cc_ser_files: FileList | undefined = undefined;
	let sk_ser_files: FileList | undefined = undefined;

	let cc_ser: string | undefined = undefined;
	let sk_ser: string | undefined = undefined;

	$: if (cc_ser_files && sk_ser_files) {
		readFheFiles();
	}

	async function readFheFiles() {
		cc_ser = await cc_ser_files![0].text();
		sk_ser = await sk_ser_files![0].text();
	}

	// Decryption

	type ReconstructedAnalysisResult = {
		raw: string;
		decoded_confidence_levels: string[];
	};

	// Map MPC party ID to array of results by that party
	let reconstructedAnalysisResults: Map<string, ReconstructedAnalysisResult[]> = new Map();

	// Loading spinner
	let isDecrypting = false;

	async function reconstructAnalysisResults() {
		isDecrypting = true;

		if (isFhe) {
			try {
				const fheDecryptionResult = (
					await reconstructResultFHE(
						analysis.user_id,
						cc_ser!,
						sk_ser!,
						analysisResultsQuery.items[0].value.map.c_result
					)
				).map((res) => res.toFixed(4));

				reconstructedAnalysisResults.set('fhe', [
					{ raw: '', decoded_confidence_levels: fheDecryptionResult }
				]);
			} catch (e: any) {
				toast.error(`Error: ${e}`, {
					description:
						'Did you provide the correct decryption files? Check the developer console for more details.'
				});
				console.error(e);
			}
		} else {
			try {
				// Loop over MPC responses
				for (const result of analysisResultsQuery.items) {
					// Decrypt the full MPC response (can contain multiple computation results)
					const raw_result_decrypted = new Uint8Array(
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
					).reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), '');

					// Loop over computation results of this MPC party
					for (let computation = 0; computation < analysis.data_index.length; computation++) {
						// Slice the raw result hex-string for this computation
						const raw_result_slice = raw_result_decrypted.slice(
							computation * 80,
							(computation + 1) * 80
						);

						const reconstructedResult: ReconstructedAnalysisResult = {
							raw: raw_result_slice,
							decoded_confidence_levels: []
						};

						// Every 16 characters in the raw result hex-string is an 8 byte number in little endian format, with 8-bit fixed-point precision.
						if (raw_result_slice.length % 16 === 0) {
							// Split the raw hex-string result into 16 character chunks (every chunk represents an 8 byte little endian number)
							const raw_hex_strings: string[] = raw_result_slice.match(/.{1,16}/g) || [];

							for (const raw_hex_string of raw_hex_strings) {
								// Get hex-byte parts
								const raw_hex_string_bytes: string[] = raw_hex_string.match(/.{1,2}/g) || [];

								// Convert little endian hex to integer
								const buffer = new ArrayBuffer(8);
								const dataView = new DataView(buffer);

								for (const [i, hex_part] of raw_hex_string_bytes.entries()) {
									dataView.setUint8(i, parseInt(hex_part, 16));
								}

								const raw_number = Number(dataView.getBigUint64(0, true));

								// convert 8-bit precision integer to decimal
								reconstructedResult.decoded_confidence_levels.push((raw_number / 256).toFixed(4));
							}
						}

						if (!reconstructedAnalysisResults.has(result.source)) {
							reconstructedAnalysisResults.set(result.source, []);
						}

						reconstructedAnalysisResults.get(result.source)?.push(reconstructedResult);
					}
				}

				reconstructedAnalysisResults = new Map(
					[...reconstructedAnalysisResults].sort((a, b) => a[0].localeCompare(b[0]))
				);
			} catch (e: any) {
				toast.error(`Error: ${e}`, {
					description:
						'Did you provide the correct IoT device key? Check the developer console for more details.'
				});
				console.error(e);
			}
		}

		isDecrypting = false;
	}

	// On dialog open
	$: if (openDialog) {
		// Clean up from last dialog opening
		reconstructedAnalysisResults = new Map();
		cc_ser = undefined;
		cc_ser_files = undefined;
		sk_ser = undefined;
		sk_ser_files = undefined;
		isDecrypting = false;

		fetchAnalysisResult();
	}
</script>

<Dialog.Root bind:open={openDialog}>
	<Dialog.Trigger />
	{#if analysisResultsQuery}
		<Dialog.Content class="md:max-w-xl lg:max-w-5xl">
			<Dialog.Header>
				<Dialog.Title>Analysis result</Dialog.Title>
				<Dialog.Description>Decrypt the analysis result(s).</Dialog.Description>
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
					<p class="col-span-4 text-sm">{analysis.latest_status}</p>
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
						{analysisResultsQuery.items[0].value.map.is_combined ? 'Combined' : 'Shares'}
					</p>
				</div>
				<div class="grid grid-cols-5 items-center">
					<p class="text-sm font-bold">Computations</p>
					<p class="col-span-4 text-sm">{analysis.data_index.length}</p>
				</div>
				<div class="grid grid-cols-5 items-center">
					<p class="text-sm font-bold">{isFhe ? 'FHE' : 'MPC'} Responses</p>
					<p class="col-span-4 text-sm">{analysisResultsQuery.items.length}</p>
				</div>
			</div>
			<Separator />
			{#if isFhe}
				<div class="grid gap-2 py-4">
					<p class="text-sm text-muted-foreground">
						Provide decryption files. These files don't leave your browser.
					</p>
					<div class="flex gap-2">
						<div class="flex-1">
							<Label for="cc_ser_file_input">Crypto context</Label>
							<input
								id="cc_ser_file_input"
								class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
								type="file"
								bind:files={cc_ser_files}
							/>
						</div>
						<div class="flex-1">
							<Label for="sk_ser_file_input">Secret key</Label>
							<input
								id="sk_ser_file_input"
								class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
								type="file"
								bind:files={sk_ser_files}
							/>
						</div>
					</div>
				</div>
				<Separator />
			{/if}
			<div class="grid gap-2 pt-4">
				<div class="mb-4 grid grid-cols-5 items-center">
					<Button
						class="col-span-5"
						size="sm"
						on:click={() => reconstructAnalysisResults()}
						disabled={isDecrypting || (isFhe && (!cc_ser || !sk_ser))}
					>
						{#if isDecrypting}
							<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
						{/if}
						Decrypt analysis result(s)
					</Button>
				</div>
				{#if reconstructedAnalysisResults.size === analysisResultsQuery.items.length}
					<ScrollArea class="max-h-96">
						{#each reconstructedAnalysisResults as [party, computations], i}
							<div class={i != reconstructedAnalysisResults.size - 1 ? 'mb-4' : ''}>
								<p class="text-sm">Results from party <b>{party}</b></p>

								{#each computations as computation, j}
									<div class="grid grid-cols-5 items-center">
										<p class="row-span-2 ms-5 text-sm font-bold">Result {j + 1}</p>
										<p class="col-span-4 text-sm"><code>{computation.raw}</code></p>
										<p class="col-span-4 col-start-2 text-sm">
											<code
												>[{computation.decoded_confidence_levels
													.toString()
													.replaceAll(',', ', ')}]</code
											>
										</p>
									</div>
								{/each}
							</div>
						{/each}
					</ScrollArea>
				{/if}
			</div>
		</Dialog.Content>
	{/if}
</Dialog.Root>
