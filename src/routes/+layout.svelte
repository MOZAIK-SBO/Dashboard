<script>
	import { ModeWatcher } from 'mode-watcher';
	import '../app.pcss';
	import SiteHeader from '$lib/components/ui/SiteHeader.svelte';
	import { Toaster } from '$lib/components/ui/sonner';
	import { navigating } from '$app/stores';
</script>

<ModeWatcher />
<Toaster richColors duration={3000} />

<svelte:head>
	<title>MOZAIK - Dashboard</title>
</svelte:head>

<div class="relative flex min-h-screen flex-col bg-background">
	<SiteHeader />
	<div class="container flex-1">
		{#if $navigating}
			Loading ...
		{:else}
			<slot />
		{/if}
	</div>
</div>
