<script>
	import { ModeWatcher } from 'mode-watcher';
	import '../app.pcss';
	import SiteHeader from '$lib/components/ui/SiteHeader.svelte';
	import { initUserClientStore } from '$lib/stores/UserClientStore';
	import { Toaster } from '$lib/components/ui/sonner';

	initUserClientStore();
</script>

<ModeWatcher />
<Toaster richColors duration={10000} />

<svelte:head>
	<title>MOZAIK - Dashboard</title>
</svelte:head>

<div class="relative flex min-h-screen flex-col bg-background">
	<SiteHeader />
	<div class="container flex-1">
		<slot />
	</div>
</div>
