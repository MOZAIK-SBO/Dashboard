<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { userClientStore } from '$lib/stores/UserClientStore';

	// Make sure that a user cannot navigate to the (authenticated) group if the User Client info is not stored
	if (browser) {
		if ($userClientStore.client_jwt_token == null) {
			goto(base);
		}
	}
</script>

<slot />
