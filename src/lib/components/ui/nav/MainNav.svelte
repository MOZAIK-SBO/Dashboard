<script>
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import { getUserClientStore } from '$lib/stores/UserClientStore';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import LightSwitch from '../LightSwitch.svelte';

	const userClientStore = getUserClientStore();
	$: userClientAvailable = $userClientStore.client_jwt_token != null;
</script>

<nav class="mx-6 w-full flex justify-between">
	<div class="flex items-center space-x-4 lg:space-x-6">
		<a
			href="{base}/"
			class="text-sm font-medium transition-colors hover:text-primary"
			class:text-muted-foreground={$page.url.pathname !== `${base}/`}>Home</a
		>

		<Tooltip.Root openDelay={0}>
			<Tooltip.Trigger>
				<a
					href={userClientAvailable ? `${base}/data` : null}
					class="text-sm font-medium transition-colors"
					class:hover:text-primary={userClientAvailable}
					class:cursor-not-allowed={!userClientAvailable}
					class:text-muted-foreground={$page.url.pathname !== `${base}/data`}>Data</a
				>
			</Tooltip.Trigger>
			<Tooltip.Content>Save client settings first!</Tooltip.Content>
		</Tooltip.Root>

		<Tooltip.Root openDelay={0}>
			<Tooltip.Trigger>
				<a
					href={userClientAvailable ? `${base}/analysis` : null}
					class="text-sm font-medium transition-colors"
					class:hover:text-primary={userClientAvailable}
					class:cursor-not-allowed={!userClientAvailable}
					class:text-muted-foreground={$page.url.pathname !== `${base}/analysis`}>Analysis</a
				>
			</Tooltip.Trigger>
			<Tooltip.Content>Save client settings first!</Tooltip.Content>
		</Tooltip.Root>

		<Tooltip.Root openDelay={0}>
			<Tooltip.Trigger>
				<a
					href={userClientAvailable ? `${base}/results` : null}
					class="text-sm font-medium transition-colors"
					class:hover:text-primary={userClientAvailable}
					class:cursor-not-allowed={!userClientAvailable}
					class:text-muted-foreground={$page.url.pathname !== `${base}/results`}>Results</a
				>
			</Tooltip.Trigger>
			<Tooltip.Content>Save client settings first!</Tooltip.Content>
		</Tooltip.Root>
	</div>
	<div class="flex items-center space-x-4">
		<a
			href="{base}/auth/signout"
			class="text-sm font-medium transition-colors text-muted-foreground hover:text-primary"
			>Sign out</a
		>
		<LightSwitch />
	</div>
</nav>
