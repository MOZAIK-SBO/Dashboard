<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Select from '$lib/components/ui/select';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Separator } from '$lib/components/ui/separator';
	import { CalendarIcon } from 'lucide-svelte';
	import { Calendar } from '$lib/components/ui/calendar/index.js';
	import { cn } from '$lib/utils.js';
	import {
		DateFormatter,
		getLocalTimeZone,
		type DateValue,
		CalendarDate
	} from '@internationalized/date';
	import { Button } from '$lib/components/ui/button';
	import { PUBLIC_MOZAIK_API_ENDPOINT } from '$env/static/public';
	import { getUserClientToken } from '$lib/util/UserClientAuth';
	import { invalidateAll } from '$app/navigation';
	import { analysisTypes, batchSizes, selectedBatchSize } from './store';
	import {
		createAnalysisRequestDataForStreaming,
		mpcKeyToCryptoKey
	} from '$lib/util/cosicLibMozaik';
	import { userClientStore } from '$lib/stores/UserClientStore';
	import { page } from '$app/stores';
	import type { MpcParty } from '$lib/types';
	import { toast } from 'svelte-sonner';

	const df = new DateFormatter('en-US', {
		dateStyle: 'long'
	});

	let expiryDate: DateValue | undefined = undefined;
	let selectedAnalysisType: string | undefined;

	$: selectedAnalysis = {
		label: selectedAnalysisType,
		value: selectedAnalysisType
	};

	$: _selectedBatchSize = {
		label: $selectedBatchSize.toString(),
		value: $selectedBatchSize
	};

	$: startStreamingBtnEnabled = selectedAnalysisType && expiryDate;

	const mpcParties = ($page.data.mpcParties as MpcParty[]).sort((a, b) =>
		a.mpc_id.localeCompare(b.mpc_id)
	);

	async function startStreaming() {
		const currentTimestamp = Date.now();
		const expiryTimestamp = expiryDate?.toDate(getLocalTimeZone()).getTime() || 0;

		// Generate key shares in hex-string encoding
		const mpcKeyShares = (
			await createAnalysisRequestDataForStreaming(
				$userClientStore.client_id,
				new Uint8Array($userClientStore.iot_key),
				'AES-GCM-128',
				await mpcKeyToCryptoKey(mpcParties[0].mpc_key),
				await mpcKeyToCryptoKey(mpcParties[1].mpc_key),
				await mpcKeyToCryptoKey(mpcParties[2].mpc_key),
				selectedAnalysisType!,
				currentTimestamp,
				expiryTimestamp
			)
		).map((keyShare) =>
			new Uint8Array(keyShare).reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), '')
		);

		fetch(`${PUBLIC_MOZAIK_API_ENDPOINT}/streaming`, {
			method: 'POST',
			headers: {
				authorization: `Bearer ${await getUserClientToken()}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				analysis_type: selectedAnalysisType,
				batch_size: $selectedBatchSize,
				key_shares: mpcKeyShares,
				start_time: currentTimestamp,
				keys_exp_at: expiryTimestamp,
				source: $userClientStore.iot_dataset,
				result: $userClientStore.result_dataset
			})
		})
			.then((res) => {
				if (res.ok) {
					return;
				} else {
					throw res.statusText;
				}
			})
			.then(() => {
				toast.success('Success', {
					description: 'Started streaming.'
				});
			})
			.catch((err) => {
				toast.error(`Error: ${err}`, {
					description: 'An error occurred while starting streaming.'
				});
			})
			.finally(() => invalidateAll());
	}
</script>

<Card.Root class="w-full">
	<Card.Header>
		<Card.Title>Start streaming</Card.Title>
		<Card.Description>Enable global streaming.</Card.Description>
	</Card.Header>
	<Card.Content class="flex flex-col">
		<Separator class="my-4 w-full" />

		<!-- Analysis type -->
		<div class="flex w-full flex-col gap-3">
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

		<!-- Expiry date -->
		<div class="flex w-full flex-col gap-3">
			<p class="text-sm font-bold">Expiry date:</p>
			<Popover.Root>
				<Popover.Trigger asChild let:builder>
					<Button
						variant="outline"
						class={cn(
							'flex-1 justify-start text-left font-normal',
							!expiryDate && 'text-muted-foreground'
						)}
						builders={[builder]}
					>
						<CalendarIcon class="mr-2 h-4 w-4" />
						{expiryDate ? df.format(expiryDate.toDate(getLocalTimeZone())) : 'Expiry date'}
					</Button>
				</Popover.Trigger>
				<Popover.Content class="w-auto p-0">
					<Calendar
						bind:value={expiryDate}
						minValue={new CalendarDate(
							new Date().getFullYear(),
							new Date().getMonth() + 1,
							new Date().getDate() + 1
						)}
						initialFocus
					/>
				</Popover.Content>
			</Popover.Root>
		</div>

		<Separator class="my-4 w-full" />
	</Card.Content>
	<Card.Footer class="flex justify-end">
		<Button on:click={startStreaming} disabled={!startStreamingBtnEnabled}>Start streaming</Button>
	</Card.Footer>
</Card.Root>
