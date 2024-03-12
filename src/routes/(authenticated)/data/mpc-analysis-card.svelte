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
		CalendarDate
	} from '@internationalized/date';
	import { Separator } from '$lib/components/ui/separator';
	import { cn } from '$lib/utils.js';
	import { CalendarIcon } from 'lucide-svelte';
	import { Calendar } from '$lib/components/ui/calendar/index.js';
	import { analysisTypes, selectedMpcParties, selectedTimestamps } from './store';

	const df = new DateFormatter('en-US', {
		dateStyle: 'long'
	});

	let expiryDate: DateValue | undefined = undefined;
	let selectedAnalysisType: string | undefined;

	$: selectedAnalysis = {
		label: selectedAnalysisType,
		value: selectedAnalysisType
	};

	$: prepareMpcAnalysisEnabled =
		$selectedTimestamps.length > 0 &&
		$selectedMpcParties.length >= 3 &&
		expiryDate &&
		selectedAnalysisType;
</script>

<Card.Root class="w-full">
	<Card.Header>
		<Card.Title>MPC computation</Card.Title>
		<Card.Description>Queue a computation using Multi Party Computation.</Card.Description>
	</Card.Header>
	<Card.Content class="flex items-center flex-col">
		<!-- Selected data  -->
		<div class="h-48 w-1/2 rounded-md border">
			<p class="ms-4 mt-4 text-sm font-bold">Selected Data</p>
			<ScrollArea class="h-36">
				<div class="p-4">
					{#each $selectedTimestamps as timestamp}
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
			<p class="ms-4 mt-4 text-sm font-bold">Selected MPC parties</p>
			<ScrollArea class="h-36">
				<div class="p-4">
					{#each $selectedMpcParties as mpcParty}
						<div class="text-sm">
							{mpcParty}
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
		<div class="flex w-1/2 gap-3 items-center">
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
		<div class="flex w-1/2 gap-3 items-center">
			<p class="text-sm font-bold">Expiry date:</p>
			<Popover.Root>
				<Popover.Trigger asChild let:builder>
					<Button
						variant="outline"
						class={cn(
							'justify-start text-left font-normal flex-1',
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
			<Button>Queue analysis</Button>
		{:else}
			<Tooltip.Root openDelay={0} closeOnEscape={false} closeOnPointerDown={false}>
				<Tooltip.Trigger>
					<div class="cursor-not-allowed">
						<Button disabled>Queue analysis</Button>
					</div>
				</Tooltip.Trigger>
				<Tooltip.Content>
					Please select at least 3 MPC parties, some data points timestamps, an analysis type and an
					expiry date.
				</Tooltip.Content>
			</Tooltip.Root>
		{/if}
	</Card.Footer>
</Card.Root>
