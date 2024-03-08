<script>
	import { ModeWatcher } from 'mode-watcher';
	import '../app.pcss';
	import SiteHeader from '$lib/components/ui/SiteHeader.svelte';
	import { initUserClientStore } from '$lib/stores/UserClientStore';

	initUserClientStore();
</script>

<ModeWatcher />

<svelte:head>
	<title>MOZAIK - Dashboard</title>
</svelte:head>

<div class="relative flex min-h-screen flex-col bg-background">
	<SiteHeader />
	<div class="container flex-1">
		<div class="mx-6 mt-4 h-screen">
			<slot />
		</div>
	</div>
</div>
