<script>
	import { base } from '$app/paths';
	import { getUserClientStore } from '$lib/stores/UserClientStore';
	import LightSwitch from '../LightSwitch.svelte';
	import NavLink from './NavLink.svelte';

	const userClientStore = getUserClientStore();
	$: userClientAvailable = $userClientStore.client_jwt_token != null;
</script>

<nav class="w-full flex justify-between">
	<div class="flex items-center space-x-4 lg:space-x-6">
		<NavLink linkName="Home" href="{base}/" disabled={false} />

		<NavLink linkName="Data" href="{base}/data" disabled={!userClientAvailable} />

		<NavLink linkName="Analysis" href="{base}/analysis" disabled={!userClientAvailable} />

		<NavLink linkName="Results" href="{base}/results" disabled={!userClientAvailable} />
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
