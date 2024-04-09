<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Ellipsis } from 'lucide-svelte';
	import AnalysisResultDialog from './analysis-result-dialog.svelte';
	import type { Analysis } from '$lib/types';

	export let analysis: Analysis;
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
		<DropdownMenu.Item on:click={() => navigator.clipboard.writeText(analysis.analysis_id)}
			>Copy analysis ID</DropdownMenu.Item
		>
		{#if analysis.status === 'Completed'}
			<DropdownMenu.Item on:click={() => (openDialog = true)}
				>Reconstruct analysis result</DropdownMenu.Item
			>
		{/if}
	</DropdownMenu.Content>
</DropdownMenu.Root>

<AnalysisResultDialog bind:openDialog {analysis} />
