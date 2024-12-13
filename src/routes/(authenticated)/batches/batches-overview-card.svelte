<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import BatchesTable from './batches-table.svelte';
</script>

<Card.Root class="w-full">
	<Card.Header>
		<Card.Title>Batches overview</Card.Title>
		<Card.Description>All batched computation requests.</Card.Description>
	</Card.Header>
	<Card.Content class="flex flex-col items-center">
		<BatchesTable />
	</Card.Content>
</Card.Root>
