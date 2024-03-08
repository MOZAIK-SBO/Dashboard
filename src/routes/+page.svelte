<script lang="ts">
	import { page } from '$app/stores';
</script>

<p>
	{#if $page.data.session?.user}
		<p>
			Welcome {$page.data.session.user.email} expires {$page.data.session.expires}
		</p>
	{/if}
</p>
