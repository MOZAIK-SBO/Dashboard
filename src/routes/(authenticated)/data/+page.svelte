<script lang="ts">
	import { Separator } from '$lib/components/ui/separator';
	import MetricDataTable from './metric-data-table.svelte';
	import MpcTable from './mpc-table.svelte';
	import PrepareAnalysis from './prepare-analysis.svelte';
</script>

<div class="flex flex-col items-center justify-center mt-10">
	<MetricDataTable />
	<Separator class="my-10" />
	<MpcTable />
	<Separator class="my-10" />
	<PrepareAnalysis />
	<Separator class="my-10" />
</div>
