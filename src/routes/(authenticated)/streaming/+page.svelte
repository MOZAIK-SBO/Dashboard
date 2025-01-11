<script lang="ts">
	import { page } from '$app/stores';
	import type { StreamingInfo } from '$lib/types';
	import StreamingInfoCard from './streaming-info-card.svelte';
	import { Separator } from '$lib/components/ui/separator';
	import StartStreamingCard from './start-streaming-card.svelte';

	$: streamingInfo = $page.data.streaming as StreamingInfo;
</script>

<div class="mt-10 flex flex-col items-center justify-center">
	<div class="w-[90%]">
		<div class="mb-4">
			<p class="text-4xl font-bold tracking-tight">Streaming</p>
			<p class="text-lg text-muted-foreground">Enable or disable global streaming.</p>
		</div>

		{#if streamingInfo.is_streaming}
			<StreamingInfoCard />
		{:else}
			<StartStreamingCard />
		{/if}
	</div>
	<Separator class="my-10" />
</div>
