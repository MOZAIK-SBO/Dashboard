<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { DateFormatter } from '@internationalized/date';
	import type { BatchInfo } from '$lib/types';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';

	// Props
	export let openDialog = false;
	export let batch: BatchInfo;

	const df = new DateFormatter('en-US', {
		dateStyle: 'full',
		timeStyle: 'medium'
	});
</script>

<Dialog.Root bind:open={openDialog}>
	<Dialog.Trigger />
	<Dialog.Content class="md:max-w-xl lg:max-w-5xl">
		<Dialog.Header>
			<Dialog.Title>Batch info</Dialog.Title>
			<Dialog.Description>Detailed info about this batch.</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-2 py-4">
			<div class="grid grid-cols-5 items-center">
				<p class="text-sm font-bold">Batch ID</p>
				<p class="col-span-4 text-sm">{batch.batch_id}</p>
			</div>
			<div class="grid grid-cols-5 items-center">
				<p class="text-sm font-bold">Status</p>
				<p class="col-span-4 text-sm">{batch.latest_status}</p>
			</div>
			<div class="grid grid-cols-5 items-center">
				<p class="text-sm font-bold">Created at</p>
				<p class="col-span-4 text-sm">
					{df.format(new Date(batch.created_at))}
				</p>
			</div>
			<div class="grid grid-cols-5 items-center">
				<p class="text-sm font-bold">Earliest key expiration</p>
				<p class="col-span-4 text-sm">
					{df.format(new Date(batch.first_keys_exp_at))}
				</p>
			</div>
			<div class="grid grid-cols-5 items-center">
				<p class="text-sm font-bold">Involved parties</p>
				<p class="col-span-4 text-sm">{batch.parties.join(', ')}</p>
			</div>
			<div class="grid grid-cols-5 items-center">
				<p class="text-sm font-bold">Batch size</p>
				<p class="col-span-4 text-sm">{batch.batch_size}</p>
			</div>
			<div class="grid grid-cols-5 items-center">
				<p class="text-sm font-bold">Analyses in batch</p>
				<p class="col-span-4 text-sm">{batch.analysis_ids.length}</p>
			</div>
			<div class="grid grid-cols-5 items-center">
				<p class="text-sm font-bold">Data points per analysis</p>
				<p class="col-span-4 text-sm">{batch.analysis_data_point_count}</p>
			</div>
			<div class="grid grid-cols-5 items-center">
				<p class="text-sm font-bold">Analysis type</p>
				<p class="col-span-4 text-sm">{batch.analysis_type}</p>
			</div>
			<div class="grid grid-cols-5 items-center">
				<p class="text-sm font-bold">Unique users in batch</p>
				<p class="col-span-4 text-sm">{new Set(batch.user_ids).size}</p>
			</div>
			<div class="grid grid-cols-5 items-center">
				<p class="text-sm font-bold">Analysis IDs</p>
				<p class="col-span-4 text-sm">[</p>
			</div>
			<ScrollArea class="max-h-96">
				{#each batch.analysis_ids as id, i}
					<div class="grid grid-cols-5 items-center">
						<p class="text-sm font-bold"></p>
						<p class="col-span-4 ml-5 text-sm">
							{id}{i < batch.analysis_ids.length - 1 ? ',' : ''}
						</p>
					</div>
				{/each}
			</ScrollArea>
			<div class="grid grid-cols-5 items-center">
				<p class="text-sm font-bold"></p>
				<p class="col-span-4 text-sm">]</p>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>
