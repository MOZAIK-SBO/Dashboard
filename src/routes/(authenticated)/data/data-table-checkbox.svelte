<script lang="ts">
	import { Checkbox } from '$lib/components/ui/checkbox';
	import type { Writable } from 'svelte/store';

	export let checked: Writable<boolean>;
	export let timestamp: number;
</script>

<Checkbox bind:checked={$checked} />
