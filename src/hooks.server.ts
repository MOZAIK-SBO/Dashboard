import { authInitHandle, authorizationHandle } from '$lib/util/auth';
import { sequence } from '@sveltejs/kit/hooks';

export const handle = sequence(authInitHandle, authorizationHandle);
