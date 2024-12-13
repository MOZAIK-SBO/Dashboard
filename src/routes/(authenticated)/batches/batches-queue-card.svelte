<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import * as Select from '$lib/components/ui/select';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { Separator } from '$lib/components/ui/separator';
	import SelectAnalysisTable from './select-analysis-table.svelte';
	import {
		batchSizes,
		selectedBatchSize,
		selectedAnalysesCountInBatch,
		dataPointsPerAnalysis,
		selectedAnalyses,
		totalSelectedDataPoints
	} from './store';
	import { PUBLIC_MOZAIK_API_ENDPOINT } from '$env/static/public';
	import { getUserClientToken } from '$lib/util/UserClientAuth';
	import { toast } from 'svelte-sonner';

	$: _selectedBatchSize = {
		label: $selectedBatchSize.toString(),
		value: $selectedBatchSize
	};

	$: queueBtnEnabled = $totalSelectedDataPoints === $selectedBatchSize;

	async function queueBatch() {
		const typeSet: Set<string> = new Set();

		for (const analysis of $selectedAnalyses) {
			typeSet.add(analysis.analysis_type);
		}

		if (typeSet.size > 1) {
			toast.error('Error', {
				description: 'You can only perform a batched computation on the same analysis type.'
			});
			return;
		}

		fetch(`${PUBLIC_MOZAIK_API_ENDPOINT}/batches`, {
			method: 'POST',
			headers: {
				authorization: `Bearer ${await getUserClientToken()}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				batch_size: $selectedBatchSize,
				analysis_data_point_count: $dataPointsPerAnalysis,
				analysis_ids: $selectedAnalyses.map((analysis) => analysis.analysis_id),
				analysis_type: $selectedAnalyses[0].analysis_type
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
					description: `Batch queued with id: ${data.batch_info_id}.`
				});
			})
			.catch((err) => {
				toast.error(`Error: ${err}`, {
					description: 'An error occurred while queuing the batch.'
				});
			});
	}
</script>

<Card.Root class="w-full">
	<Card.Header>
		<Card.Title>Queue Batch</Card.Title>
		<Card.Description>Request batched computation.</Card.Description>
	</Card.Header>
	<Card.Content class="flex flex-col items-center">
		<Separator class="my-4 w-full" />

		<div class="flex w-full flex-col gap-3">
			<p class="text-sm font-bold">Batch size:</p>
			<Select.Root
				selected={_selectedBatchSize}
				onSelectedChange={(v) => {
					v && ($selectedBatchSize = v.value);
				}}
			>
				<Select.Trigger class="flex-1">
					<Select.Value placeholder="Batch size" />
				</Select.Trigger>
				<Select.Content>
					{#each $batchSizes as bs}
						<Select.Item value={bs}>{bs}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>

		<Separator class="my-4 w-full" />

		<div class="flex w-full flex-col gap-3">
			<p class="flex-shrink-0 text-sm font-bold">Analyses in batch:</p>
			<Input
				id="analyses-count"
				type="number"
				min="1"
				max={$selectedBatchSize}
				bind:value={$selectedAnalysesCountInBatch}
			/>
		</div>

		<Separator class="my-4 w-full" />

		<div class="flex w-full flex-col gap-3">
			<p class="flex-shrink-0 text-sm font-bold">Data points per analysis:</p>
			<code class={$dataPointsPerAnalysis % 1 === 0 ? '' : 'bg-red-500'}
				>{$dataPointsPerAnalysis}</code
			>
		</div>

		<Separator class="my-4 w-full" />

		<div class="flex w-full flex-col gap-3">
			<p class="flex-shrink-0 text-sm font-bold">Analyses:</p>
			<SelectAnalysisTable />
		</div>

		<Separator class="mt-4 w-full" />
	</Card.Content>
	<Card.Footer class="flex justify-end">
		{#if queueBtnEnabled}
			<Button on:click={queueBatch}>Queue batch</Button>
		{:else}
			<Tooltip.Root openDelay={0} closeOnEscape={false} closeOnPointerDown={false}>
				<Tooltip.Trigger>
					<div class="cursor-not-allowed">
						<Button disabled>Queue batch</Button>
					</div>
				</Tooltip.Trigger>
				<Tooltip.Content>
					Make sure that the amount of selected data points matches the batch size.
				</Tooltip.Content>
			</Tooltip.Root>
		{/if}
	</Card.Footer>
</Card.Root>
