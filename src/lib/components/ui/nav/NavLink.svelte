<script lang="ts">
	import { page } from '$app/stores';
	import * as Tooltip from '$lib/components/ui/tooltip';

	export let linkName: string;
	export let href: string;
	export let disabled = false;
</script>

{#if disabled}
	<Tooltip.Root openDelay={0} closeOnEscape={false} closeOnPointerDown={false} group="nav-tooltip">
		<Tooltip.Trigger>
			<a
				href={null}
				class="text-sm font-medium transition-colors cursor-not-allowed text-muted-foreground"
				>{linkName}</a
			>
		</Tooltip.Trigger>
		<Tooltip.Content>Save client settings first!</Tooltip.Content>
	</Tooltip.Root>
{:else}
	<a
		{href}
		class="text-sm font-medium transition-colors hover:text-primary"
		class:text-muted-foreground={$page.url.pathname !== href}>{linkName}</a
	>
{/if}
