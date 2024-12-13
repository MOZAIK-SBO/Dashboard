<script lang="ts">
	import { page } from '$app/stores';
	import { Render, Subscribe, createRender, createTable } from 'svelte-headless-table';
	import { addPagination, addSortBy } from 'svelte-headless-table/plugins';
	import { readable } from 'svelte/store';
	import * as Table from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import { ArrowUpDown } from 'lucide-svelte';
	import BatchesTableActions from './batches-table-actions.svelte';
	import { DateFormatter } from '@internationalized/date';
	import type { BatchInfo } from '$lib/types';

	const df = new DateFormatter('en-US', {
		dateStyle: 'medium',
		timeStyle: 'medium'
	});

	// Data
	$: batches = $page.data.batches as BatchInfo[];
	$: dataLength = batches.length;

	// Table
	$: table = createTable(readable(batches), {
		page: addPagination(),
		sort: addSortBy()
	});

	$: columns = table.createColumns([
		table.column({
			accessor: 'created_at',
			header: 'Created',
			cell: ({ value }) => {
				return df.format(new Date(value));
			}
		}),
		table.column({
			accessor: 'first_keys_exp_at',
			header: 'Earliest Key Expiration',
			cell: ({ value }) => {
				return df.format(new Date(value));
			}
		}),
		table.column({
			accessor: 'analysis_type',
			header: 'Type'
		}),
		table.column({
			accessor: 'batch_size',
			header: 'Batch Size'
		}),
		table.column({
			accessor: 'analysis_ids',
			header: 'Analyses',
			cell: ({ value }) => {
				return value.length;
			}
		}),
		table.column({
			accessor: 'latest_status',
			header: 'Status'
		}),
		table.column({
			accessor: (value) => value,
			header: '',
			cell: ({ value }) => {
				return createRender(BatchesTableActions, {
					batch: value
				});
			}
		})
	]);

	$: ({ headerRows, pageRows, tableAttrs, tableBodyAttrs, pluginStates } =
		table.createViewModel(columns));
	$: ({ hasNextPage, hasPreviousPage, pageIndex, pageSize } = pluginStates.page);
</script>

<div class="w-full">
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
										<Render of={cell.render()} />
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
