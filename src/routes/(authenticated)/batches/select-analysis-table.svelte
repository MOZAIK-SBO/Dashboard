<script lang="ts">
	import { page } from '$app/stores';
	import { Render, Subscribe, createRender, createTable } from 'svelte-headless-table';
	import {
		addPagination,
		addSelectedRows,
		addSortBy,
		addTableFilter
	} from 'svelte-headless-table/plugins';
	import { readable } from 'svelte/store';
	import * as Table from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import { ArrowUpDown } from 'lucide-svelte';
	import { DateFormatter } from '@internationalized/date';
	import type { Analysis } from '$lib/types';
	import TableCheckbox from '$lib/components/ui/table-checkbox.svelte';
	import {
		dataPointsPerAnalysis,
		selectedAnalyses,
		selectedBatchSize,
		totalSelectedDataPoints
	} from './store';

	const df = new DateFormatter('en-US', {
		dateStyle: 'medium',
		timeStyle: 'medium'
	});

	// Data
	let analyses: Analysis[] = $page.data.analyses;

	$: {
		analyses = $page.data.analyses.filter(
			(analysis: Analysis) =>
				analysis.latest_status === 'Prepared' &&
				analysis.data_index.length === $dataPointsPerAnalysis
		);
	}

	$: dataLength = analyses.length;

	// Table
	$: table = createTable(readable(analyses), {
		page: addPagination(),
		sort: addSortBy(),
		select: addSelectedRows(),
		filter: addTableFilter()
	});

	$: columns = table.createColumns([
		table.column({
			accessor: 'analysis_id',
			id: 'select-analysis_id',
			header: ''
		}),
		table.column({
			accessor: 'created_at',
			header: 'Created',
			cell: ({ value }) => {
				return df.format(new Date(value));
			}
		}),
		table.column({
			accessor: 'keys_exp_at',
			header: 'Key Expiration',
			cell: ({ value }) => {
				return df.format(new Date(value));
			}
		}),
		table.column({
			accessor: 'analysis_type',
			header: 'Type'
		}),
		table.column({
			accessor: 'invoker',
			header: 'Manual/Streaming',
			cell: ({ value }) => {
				return value.charAt(0).toUpperCase() + value.slice(1);
			}
		}),
		table.column({
			accessor: 'metric',
			header: 'Metric'
		}),
		table.column({
			accessor: 'data_index',
			header: 'Data points',
			cell: ({ value }) => {
				return value.length;
			}
		}),
		table.column({
			accessor: 'latest_status',
			header: 'Status'
		})
	]);

	// Reactivity
	$: ({ headerRows, pageRows, tableAttrs, tableBodyAttrs, pluginStates } =
		table.createViewModel(columns));
	$: ({ hasNextPage, hasPreviousPage, pageIndex, pageSize } = pluginStates.page);
	$: ({ selectedDataIds, getRowState } = pluginStates.select);

	$: $selectedAnalyses = Object.keys($selectedDataIds).map((key) => {
		return analyses[+key];
	});

	$: selectEnabled = $totalSelectedDataPoints < $selectedBatchSize;
</script>

<div class="w-full">
	<p>Selected data points: <code>{$totalSelectedDataPoints}</code></p>
	<div class="w-full rounded-md border">
		<Table.Root {...$tableAttrs}>
			<Table.Header>
				{#each $headerRows as headerRow}
					<Subscribe rowAttrs={headerRow.attrs()}>
						<Table.Row>
							{#each headerRow.cells as cell (cell.id)}
								<Subscribe attrs={cell.attrs()} let:attrs props={cell.props()} let:props>
									<Table.Head {...attrs}>
										{#if cell.id === 'created_at'}
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
										{#if cell.id === 'select-analysis_id'}
											<TableCheckbox
												checked={getRowState(row).isSelected}
												enabled={selectEnabled}
											/>
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
	<div class="flex items-center justify-between pt-3">
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
