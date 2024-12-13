<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Ellipsis } from 'lucide-svelte';
	import type { BatchInfo } from '$lib/types';
	import BatchInfoDialog from './batch-info-dialog.svelte';

	export let batch: BatchInfo;
	let openDialog = false;
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger asChild let:builder>
		<Button variant="ghost" builders={[builder]} size="icon" class="relative h-8 w-8 p-0">
			<span class="sr-only">Open actions menu</span>
			<Ellipsis class="h-4 w-4" />
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Label>Actions</DropdownMenu.Label>
		<DropdownMenu.Item on:click={() => navigator.clipboard.writeText(batch.batch_id)}
			>Copy batch ID</DropdownMenu.Item
		>
		<DropdownMenu.Item on:click={() => (openDialog = true)}>More info</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>

<BatchInfoDialog bind:openDialog {batch} />
