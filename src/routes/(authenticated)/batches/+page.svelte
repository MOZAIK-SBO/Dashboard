<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import BatchesOverviewCard from './batches-overview-card.svelte';
	import { Separator } from '$lib/components/ui/separator';
	import BatchesQueueCard from './batches-queue-card.svelte';
	import { invalidateAll } from '$app/navigation';

	function reloadPageData(tab: string | undefined) {
		if (tab === 'overview') {
			invalidateAll();
		}
	}
</script>

<div class="mt-10 flex flex-col items-center justify-center">
	<div class="w-[90%]">
		<div class="mb-4">
			<p class="text-4xl font-bold tracking-tight">Batches</p>
			<p class="text-lg text-muted-foreground">Manage and queue batches.</p>
		</div>
		<Tabs.Root value="overview" onValueChange={reloadPageData}>
			<Tabs.List class="grid grid-cols-2">
				<Tabs.Trigger value="overview">Overview</Tabs.Trigger>
				<Tabs.Trigger value="queue">Queue</Tabs.Trigger>
			</Tabs.List>
			<Tabs.Content value="overview">
				<BatchesOverviewCard />
			</Tabs.Content>
			<Tabs.Content value="queue">
				<BatchesQueueCard />
			</Tabs.Content>
		</Tabs.Root>
	</div>
	<Separator class="my-10" />
</div>
