<script lang="ts">
	import { page } from '$app/stores';
	import { Render, Subscribe, createTable } from 'svelte-headless-table';
	import { addPagination, addSelectedRows } from 'svelte-headless-table/plugins';
	import { readable } from 'svelte/store';
	import * as Table from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import TableCheckbox from './table-checkbox.svelte';

	// Types
	type MpcParty = {
		mpc_id: string;
		host: string;
		mpc_key: string;
		region: string;
	};

	// Data
	const mpcParties: MpcParty[] = $page.data.mpcParties;
	const dataLength = mpcParties.length;

	// Table
	const table = createTable(readable(mpcParties), {
		page: addPagination(),
		select: addSelectedRows()
	});

	const columns = table.createColumns([
		table.column({
			accessor: 'mpc_id',
			id: 'select-mpc_id',
			header: ''
		}),
		table.column({
			accessor: 'mpc_id',
			header: 'MPC ID'
		}),
		table.column({
			accessor: 'host',
			header: 'Host'
		}),
		table.column({
			accessor: 'region',
			header: 'Region'
		})
	]);

	const { headerRows, pageRows, tableAttrs, tableBodyAttrs, pluginStates } =
		table.createViewModel(columns);
	const { hasNextPage, hasPreviousPage, pageIndex, pageSize } = pluginStates.page;
	const { selectedDataIds, someRowsSelected, getRowState } = pluginStates.select;
</script>

<div class="w-[90%]">
	<div class="mb-2">
		<p class="text-4xl font-bold tracking-tight">MPC Parties</p>
		<p class="text-lg text-muted-foreground">Registered MPC parties.</p>
	</div>
	<div class="rounded-md border w-full">
		<Table.Root {...$tableAttrs}>
			<Table.Header>
				{#each $headerRows as headerRow}
					<Subscribe rowAttrs={headerRow.attrs()}>
						<Table.Row>
							{#each headerRow.cells as cell (cell.id)}
								<Subscribe attrs={cell.attrs()} let:attrs props={cell.props()}>
									<Table.Head {...attrs}>
										<Render of={cell.render()} />
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
										{#if cell.id === 'select-mpc_id'}
											<TableCheckbox checked={getRowState(row).isSelected} enabled={true} />
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
	<div class="flex justify-between items-center py-4">
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
