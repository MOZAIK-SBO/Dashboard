<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import MpcAnalysisCard from './mpc-analysis-card.svelte';
	import FheAnalysisCard from './fhe-analysis-card.svelte';
</script>

<div class="w-[90%]">
	<div class="mb-4">
		<p class="text-4xl font-bold tracking-tight">Prepare Analysis</p>
		<p class="text-lg text-muted-foreground">Queue a computation.</p>
	</div>
	<Tabs.Root value="mpc">
		<Tabs.List class="grid grid-cols-2">
			<Tabs.Trigger value="mpc">MPC</Tabs.Trigger>
			<Tabs.Trigger value="fhe">FHE</Tabs.Trigger>
		</Tabs.List>
		<Tabs.Content value="mpc">
			<MpcAnalysisCard />
		</Tabs.Content>
		<Tabs.Content value="fhe">
			<FheAnalysisCard />
		</Tabs.Content>
	</Tabs.Root>
</div>
