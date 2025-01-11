<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { DateFormatter } from '@internationalized/date';
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import type { StreamingInfo } from '$lib/types';
	import { PUBLIC_MOZAIK_API_ENDPOINT } from '$env/static/public';
	import { getUserClientToken } from '$lib/util/UserClientAuth';
	import { invalidateAll } from '$app/navigation';
	import { toast } from 'svelte-sonner';

	$: streamingInfo = $page.data.streaming as StreamingInfo;

	const df = new DateFormatter('en-US', {
		dateStyle: 'full',
		timeStyle: 'medium'
	});

	async function stopStreaming() {
		fetch(`${PUBLIC_MOZAIK_API_ENDPOINT}/streaming`, {
			method: 'DELETE',
			headers: {
				authorization: `Bearer ${await getUserClientToken()}`
			}
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
					description: 'Stopped streaming.'
				});
			})
			.catch((err) => {
				toast.error(`Error: ${err}`, {
					description: 'An error occurred.'
				});
			})
			.finally(() => invalidateAll());
	}
</script>

<Card.Root class="w-full">
	<Card.Header>
		<Card.Title>Streaming info</Card.Title>
		<Card.Description>Currently streaming.</Card.Description>
	</Card.Header>
	<Card.Content class="flex flex-col">
		<div class="grid">
			<div class="grid grid-cols-5 items-center">
				<p class="text-sm font-bold">Started at</p>
				<p class="col-span-4 text-sm">
					{streamingInfo.start_time ? df.format(new Date(streamingInfo.start_time)) : ''}
				</p>
			</div>
			<div class="grid grid-cols-5 items-center">
				<p class="text-sm font-bold">Expires at</p>
				<p class="col-span-4 text-sm">
					{streamingInfo.keys_exp_at ? df.format(new Date(streamingInfo.keys_exp_at)) : ''}
				</p>
			</div>
			<div class="grid grid-cols-5 items-center">
				<p class="text-sm font-bold">Analysis type</p>
				<p class="col-span-4 text-sm">{streamingInfo.analysis_type}</p>
			</div>
			<div class="grid grid-cols-5 items-center">
				<p class="text-sm font-bold">Batch size</p>
				<p class="col-span-4 text-sm">{streamingInfo.batch_size}</p>
			</div>
			<div class="grid grid-cols-5 items-center">
				<p class="text-sm font-bold">Submitted batches</p>
				<p class="col-span-4 text-sm">[</p>
			</div>
			<ScrollArea class="max-h-96">
				{#each streamingInfo.submitted_batches ? streamingInfo.submitted_batches : [] as id, i}
					<div class="grid grid-cols-5 items-center">
						<p class="text-sm font-bold"></p>
						<p class="col-span-4 ml-5 text-sm">
							{id}{i <
							(streamingInfo.submitted_batches ? streamingInfo.submitted_batches.length - 1 : 0)
								? ','
								: ''}
						</p>
					</div>
				{/each}
			</ScrollArea>
			<div class="grid grid-cols-5 items-center">
				<p class="text-sm font-bold"></p>
				<p class="col-span-4 text-sm">]</p>
			</div>
		</div>
	</Card.Content>
	<Card.Footer class="flex justify-end">
		<Button on:click={stopStreaming}>Stop streaming</Button>
	</Card.Footer>
</Card.Root>
