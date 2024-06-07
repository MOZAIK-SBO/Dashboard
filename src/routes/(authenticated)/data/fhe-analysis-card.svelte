<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Select from '$lib/components/ui/select';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import { analysisTypes, selectedMetricEvents } from './store';
	import { PUBLIC_MOZAIK_API_ENDPOINT } from '$env/static/public';
	import { getUserClientToken } from '$lib/util/UserClientAuth';
	import { userClientStore } from '$lib/stores/UserClientStore';
	import { toast } from 'svelte-sonner';

	$: selectedTimestamps = $selectedMetricEvents.map((metricEvent) => metricEvent.timestamp);

	let selectedAnalysisType: string | undefined;

	$: selectedAnalysis = {
		label: selectedAnalysisType,
		value: selectedAnalysisType
	};

	$: prepareFheAnalysisEnabled = $selectedMetricEvents.length > 0 && selectedAnalysisType;

	async function prepareFheAnalysis() {
		fetch(`${PUBLIC_MOZAIK_API_ENDPOINT}/analysis/fhe/prepare`, {
			method: 'POST',
			headers: {
				authorization: `Bearer ${await getUserClientToken()}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				user_key: $userClientStore.user_public_key,
				data: {
					source: $userClientStore.iot_dataset,
					result: $userClientStore.result_dataset,
					metric: $selectedMetricEvents[0].metric,
					index: selectedTimestamps
				},
				analysis_type: selectedAnalysisType!
			})
		})
			.then((res) => {
				if (res.ok) {
					return res.json();
				} else {
					throw res.statusText;
				}
			})
			.then((data) => {
				toast.success('Success', {
					description: `FHE analysis has been queued with id: ${data.analysis_id}.`
				});
			})
			.catch((err) => {
				toast.error(`Error: ${err}`, {
					description: 'An error occurred while queuing the FHE analysis.'
				});
			});
	}
</script>

<Card.Root class="w-full">
	<Card.Header>
		<Card.Title>FHE computation</Card.Title>
		<Card.Description
			>Queue a computation using Fully Homomorphic Encryption. <small
				><b>Make sure to provide the correct datasets in the client settings.</b></small
			></Card.Description
		>
	</Card.Header>
	<Card.Content class="flex flex-col items-center">
		<!-- Selected data  -->
		<div class="h-48 w-1/2 rounded-md border">
			<p class="ms-4 mt-4 text-sm font-bold">Selected Data</p>
			<ScrollArea class="h-36">
				<div class="p-4">
					{#each selectedTimestamps as timestamp}
						<div class="text-sm">
							{timestamp}
						</div>
						<Separator class="my-2" />
					{:else}
						<div class="text-sm">None</div>
					{/each}
				</div>
			</ScrollArea>
		</div>

		<Separator class="my-4 w-1/2" />

		<!-- Analysis type -->
		<div class="flex w-1/2 items-center gap-3">
			<p class="text-sm font-bold">Analysis type:</p>
			<Select.Root
				selected={selectedAnalysis}
				onSelectedChange={(v) => {
					v && (selectedAnalysisType = v.value);
				}}
			>
				<Select.Trigger class="flex-1">
					<Select.Value placeholder="Analysis type" />
				</Select.Trigger>
				<Select.Content>
					{#each $analysisTypes as analysisType}
						<Select.Item value={analysisType}>{analysisType}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>
	</Card.Content>
	<Card.Footer class="flex justify-end">
		{#if prepareFheAnalysisEnabled}
			<Button on:click={prepareFheAnalysis}>Queue analysis</Button>
		{:else}
			<Tooltip.Root openDelay={0} closeOnEscape={false} closeOnPointerDown={false}>
				<Tooltip.Trigger>
					<div class="cursor-not-allowed">
						<Button disabled>Queue analysis</Button>
					</div>
				</Tooltip.Trigger>
				<Tooltip.Content>
					Please select at least one data point timestamp and an analysis type.
				</Tooltip.Content>
			</Tooltip.Root>
		{/if}
	</Card.Footer>
</Card.Root>
