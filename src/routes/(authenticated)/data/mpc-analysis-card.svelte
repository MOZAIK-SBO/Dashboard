<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Select from '$lib/components/ui/select';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { Button } from '$lib/components/ui/button';
	import {
		DateFormatter,
		getLocalTimeZone,
		type DateValue,
		CalendarDate,
		today
	} from '@internationalized/date';
	import { Separator } from '$lib/components/ui/separator';
	import { cn } from '$lib/utils.js';
	import { CalendarIcon } from 'lucide-svelte';
	import { Calendar } from '$lib/components/ui/calendar/index.js';
	import { analysisTypes, selectedMetricEvents, selectedMpcParties } from './store';
	import { PUBLIC_MOZAIK_API_ENDPOINT } from '$env/static/public';
	import { getUserClientToken } from '$lib/util/UserClientAuth';
	import { createEncryptedKeyShares, mpcKeyToCryptoKey } from '$lib/util/cosicLibMozaik';
	import { userClientStore } from '$lib/stores/UserClientStore';
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

	$: selectedTimestamps = $selectedMetricEvents.map((metricEvent) => metricEvent.timestamp);

	$: prepareMpcAnalysisEnabled =
		$selectedMetricEvents.length > 0 &&
		$selectedMpcParties.length >= 3 &&
		expiryDate &&
		selectedAnalysisType;

	async function prepareMpcAnalysis() {
		const metricSet: Set<string> = new Set();

		for (const metricEvent of $selectedMetricEvents) {
			metricSet.add(metricEvent.metric);
		}

		if (metricSet.size > 1) {
			toast.error('Error', {
				description: 'You can only perform an analysis on the same metric type.'
			});
			return;
		}

		// Generate key shares in hex-string encoding
		const mpcKeyShares = (
			await createEncryptedKeyShares(
				$userClientStore.client_id,
				new Uint8Array($userClientStore.iot_key),
				'AES-GCM-128',
				await mpcKeyToCryptoKey($selectedMpcParties[0].mpc_key),
				await mpcKeyToCryptoKey($selectedMpcParties[1].mpc_key),
				await mpcKeyToCryptoKey($selectedMpcParties[2].mpc_key),
				selectedAnalysisType!,
				selectedTimestamps
			)
		).map((keyShare) =>
			new Uint8Array(keyShare).reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), '')
		);

		fetch(`${PUBLIC_MOZAIK_API_ENDPOINT}/analysis/mpc/prepare`, {
			method: 'POST',
			headers: {
				authorization: `Bearer ${await getUserClientToken()}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				parties: mpcKeyShares.map((keyShare, i) => ({
					mpc_id: $selectedMpcParties[i].mpc_id,
					key_share: keyShare
				})),
				exp_hours: expiryDate!.compare(today(getLocalTimeZone())) * 24,
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
					description: `MPC analysis has been prepared with id: ${data.analysis_id}.`
				});
			})
			.catch((err) => {
				toast.error(`Error: ${err}`, {
					description: 'An error occurred while preparing the MPC analysis.'
				});
			});
	}
</script>

<Card.Root class="w-full">
	<Card.Header>
		<Card.Title>MPC computation</Card.Title>
		<Card.Description
			>Prepare a computation using Multi Party Computation. <small
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

		<!-- Selected MPC parties -->
		<div class="h-48 w-1/2 rounded-md border">
			<p class="ms-4 mt-4 text-sm font-bold">Selected MPC Parties</p>
			<ScrollArea class="h-36">
				<div class="p-4">
					{#each $selectedMpcParties as mpcParty}
						<div class="text-sm">
							{mpcParty.mpc_id}
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

		<Separator class="my-4 w-1/2" />

		<!-- Expiry date -->
		<div class="flex w-1/2 items-center gap-3">
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
	</Card.Content>
	<Card.Footer class="flex justify-end">
		{#if prepareMpcAnalysisEnabled}
			<Button on:click={prepareMpcAnalysis}>Prepare analysis</Button>
		{:else}
			<Tooltip.Root openDelay={0} closeOnEscape={false} closeOnPointerDown={false}>
				<Tooltip.Trigger>
					<div class="cursor-not-allowed">
						<Button disabled>Prepare analysis</Button>
					</div>
				</Tooltip.Trigger>
				<Tooltip.Content>
					Please select at least 3 MPC parties, some data point timestamps, an analysis type and an
					expiry date.
				</Tooltip.Content>
			</Tooltip.Root>
		{/if}
	</Card.Footer>
</Card.Root>
