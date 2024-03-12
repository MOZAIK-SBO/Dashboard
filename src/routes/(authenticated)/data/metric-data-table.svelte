<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import { createTable, Subscribe, Render, createRender, DataBodyRow } from 'svelte-headless-table';
	import { addPagination, addSelectedRows, addSortBy } from 'svelte-headless-table/plugins';
	import { readable } from 'svelte/store';
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import { ArrowUpDown } from 'lucide-svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { userClientStore } from '$lib/stores/UserClientStore';
	import TableCheckbox from './table-checkbox.svelte';

	// Types
	type MetricEvent = {
		timestamp: number;
		metric: string;
		source: string;
	};

	// Data
	const metricEventData: MetricEvent[] = $page.data.metricEventData;
	const dataLength = metricEventData.length;

	// Table
	const table = createTable(readable(metricEventData), {
		page: addPagination(),
		sort: addSortBy(),
		select: addSelectedRows()
	});

	const columns = table.createColumns([
		table.column({
			accessor: 'timestamp',
			id: 'select-timestamp',
			header: ''
		}),
		table.column({
			accessor: 'timestamp',
			header: 'Timestamp',
			cell: ({ value }) => {
				const date = new Date(value);
				return date.toUTCString();
			}
		}),
		table.column({
			accessor: 'metric',
			header: 'Metric',
			plugins: {
				sort: {
					disable: true
				}
			}
		}),
		table.column({
			accessor: 'source',
			header: 'Source',
			plugins: {
				sort: {
					disable: true
				}
			}
		}),
		table.column({
			accessor: 'timestamp',
			id: 'encrypted-data',
			header: 'Encrypted Data'
		})
	]);

	const { headerRows, pageRows, tableAttrs, tableBodyAttrs, pluginStates } =
		table.createViewModel(columns);
	const { hasNextPage, hasPreviousPage, pageIndex, pageSize } = pluginStates.page;
	const { selectedDataIds, someRowsSelected, getRowState } = pluginStates.select;

	$: smallestSelectedId = Math.min(...Object.keys($selectedDataIds).map(Number));
	$: largestSelectedId = Math.max(...Object.keys($selectedDataIds).map(Number));
</script>

<div class="w-[90%]">
	<div class="mb-2">
		<p class="text-4xl font-bold tracking-tight">Encrypted Data</p>
		<p class="text-lg text-muted-foreground">
			Available in the <span class="font-bold">{$userClientStore.iot_dataset}</span> dataset.
		</p>
	</div>
	<div class="rounded-md border w-full">
		<Table.Root {...$tableAttrs}>
			<Table.Header>
				{#each $headerRows as headerRow}
					<Subscribe rowAttrs={headerRow.attrs()}>
						<Table.Row>
							{#each headerRow.cells as cell (cell.id)}
								<Subscribe attrs={cell.attrs()} let:attrs props={cell.props()} let:props>
									<Table.Head {...attrs}>
										{#if cell.id === 'timestamp'}
											<Button variant="ghost" on:click={props.sort.toggle}>
												<Render of={cell.render()} />
												<ArrowUpDown class={'ml-2 h-4 w-4'} />
											</Button>
										{:else}
											<Render of={cell.render()} />
										{/if}
									</Table.Head>
								</Subscribe>
							{/each}
						</Table.Row>
					</Subscribe>
				{/each}
			</Table.Header>
			<Table.Body {...$tableBodyAttrs}>
				{#each $pageRows as row (row.id)}
					<Subscribe rowAttrs={row.attrs()} let:rowAttrs>
						<Table.Row {...rowAttrs}>
							{#each row.cells as cell (cell.id)}
								<Subscribe attrs={cell.attrs()} let:attrs>
									<Table.Cell {...attrs}>
										{#if cell.id === 'select-timestamp'}
											<TableCheckbox
												checked={getRowState(row).isSelected}
												enabled={$someRowsSelected === false ||
													+row.id === smallestSelectedId ||
													+row.id === largestSelectedId ||
													+row.id === largestSelectedId + 1 ||
													+row.id === smallestSelectedId - 1}
											/>
										{:else if cell.id === 'encrypted-data'}
											<Badge variant="outline">************</Badge>
										{:else}
											<Render of={cell.render()} />
										{/if}
									</Table.Cell>
								</Subscribe>
							{/each}
						</Table.Row>
					</Subscribe>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
	<div class="flex justify-between items-center pt-4">
		<p class="text-sm">
			Showing <span class="font-bold"
				>{$pageIndex * $pageSize + 1}-{($pageIndex + 1) * $pageSize <= dataLength
					? ($pageIndex + 1) * $pageSize
					: dataLength}</span
			>
			of <span class="font-bold">{dataLength}</span>
		</p>
		<div class="flex items-center space-x-4">
			<Button
				variant="outline"
				size="sm"
				on:click={() => ($pageIndex = $pageIndex - 1)}
				disabled={!$hasPreviousPage}>Previous</Button
			>
			<Button
				variant="outline"
				size="sm"
				disabled={!$hasNextPage}
				on:click={() => ($pageIndex = $pageIndex + 1)}>Next</Button
			>
		</div>
	</div>
</div>
