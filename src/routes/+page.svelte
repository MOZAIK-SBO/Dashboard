<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { userClientStore } from '$lib/stores/UserClientStore';
	import { userClientAuthentication } from '$lib/util/UserClientAuth';

	let inputChanged = false;
	$: saveBtnEnabled = $userClientStore.client_jwt_token == null || inputChanged ? true : false;

	interface UserClientForm {
		client_id: string;
		client_secret: string;
		user_public_key: string;
		iot_dataset: string;
		result_dataset: string;
	}

	const userClientFormData: UserClientForm = {
		client_id: $userClientStore.client_id,
		client_secret: $userClientStore.client_secret,
		user_public_key: $userClientStore.user_public_key,
		iot_dataset: $userClientStore.iot_dataset,
		result_dataset: $userClientStore.result_dataset
	};

	function handleUserClientFormSubmit() {
		userClientAuthentication(userClientFormData).then(() => {
			inputChanged = false;
		});
	}

	function resetForm() {
		$userClientStore = {
			client_id: '',
			client_secret: '',
			user_public_key: '',
			iot_dataset: '',
			result_dataset: '',
			client_jwt_token: null,
			client_jwt_token_iat: 0
		};
	}
</script>

<div class="flex justify-center mt-10">
	<Card.Root class="xl:w-1/2 md:w-3/4 w-full">
		<Card.Header>
			<Card.Title>Client settings</Card.Title>
			<Card.Description>Provide client credentials and datasets.</Card.Description>
		</Card.Header>
		<Card.Content>
			<form
				id="userClientForm"
				on:submit|preventDefault={handleUserClientFormSubmit}
				on:input={() => (inputChanged = true)}
			>
				<div class="grid w-full items-center gap-5">
					<div class="flex flex-col space-y-2">
						<Label for="client_id">Client ID</Label>
						<Input
							id="client_id"
							name="client_id"
							placeholder="Client ID"
							required
							bind:value={userClientFormData.client_id}
						/>
					</div>
					<div class="flex flex-col space-y-2">
						<Label for="client_secret">Client secret</Label>
						<Input
							id="client_secret"
							name="client_secret"
							type="password"
							placeholder="Client secret"
							required
							bind:value={userClientFormData.client_secret}
						/>
					</div>
					<div class="flex flex-col space-y-2">
						<Label for="user_public_key">User public key (base64)</Label>
						<Input
							id="user_public_key"
							name="user_public_key"
							placeholder="Public key (base64)"
							required
							bind:value={userClientFormData.user_public_key}
						/>
					</div>
					<div class="flex flex-col space-y-2">
						<Label for="iot_dataset">IoT dataset</Label>
						<Input
							id="iot_dataset"
							name="iot_dataset"
							placeholder="Dataset with IoT data"
							required
							bind:value={userClientFormData.iot_dataset}
						/>
					</div>
					<div class="flex flex-col space-y-2">
						<Label for="result_dataset">Result dataset</Label>
						<Input
							id="result_dataset"
							name="result_dataset"
							placeholder="Dataset where the result needs to be stored"
							required
							bind:value={userClientFormData.result_dataset}
						/>
					</div>
				</div>
			</form>
		</Card.Content>
		<Card.Footer class="flex justify-between">
			<Button type="reset" form="userClientForm" variant="destructive" on:click={resetForm}
				>Reset</Button
			>
			<div class:cursor-not-allowed={!saveBtnEnabled}>
				<Button type="submit" form="userClientForm" disabled={!saveBtnEnabled}>Save</Button>
			</div>
		</Card.Footer>
	</Card.Root>
</div>
