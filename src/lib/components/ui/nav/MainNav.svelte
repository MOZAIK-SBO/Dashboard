<script>
	import { base } from '$app/paths';
	import { userClientStore } from '$lib/stores/UserClientStore';
	import LightSwitch from '../LightSwitch.svelte';
	import NavLink from './NavLink.svelte';

	$: userClientAvailable = $userClientStore.client_jwt_token != null;
</script>

<nav class="flex w-full justify-between">
	<div class="flex items-center space-x-4 lg:space-x-6">
		<NavLink linkName="Home" href="{base}/" disabled={false} />
		<NavLink linkName="Data" href="{base}/data" disabled={!userClientAvailable} />
		<NavLink linkName="Analysis" href="{base}/analysis" disabled={!userClientAvailable} />
		<NavLink linkName="Batches" href="{base}/batches" disabled={!userClientAvailable} />
		<NavLink linkName="Streaming" href="{base}/streaming" disabled={!userClientAvailable} />
	</div>
	<div class="flex items-center space-x-4">
		<a
			href="{base}/auth/signout"
			class="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
			>Sign out</a
		>
		<LightSwitch />
	</div>
</nav>
