import type { Analysis, MetricEvent, MpcParty } from '$lib/types';
import { readable, writable, derived } from 'svelte/store';

export const batchSizes = readable([1, 2, 4, 64, 128]);

export const selectedBatchSize = writable<number>(1);
export const selectedAnalysesCountInBatch = writable<number>(1);

export const dataPointsPerAnalysis = derived(
	[selectedBatchSize, selectedAnalysesCountInBatch],
	([$selectedBatchSize, $selectedAnalysesCountInBatch]) =>
		$selectedBatchSize / $selectedAnalysesCountInBatch
);

export const selectedAnalyses = writable<Analysis[]>([]);

export const totalSelectedDataPoints = derived(selectedAnalyses, ($selectedAnalyses) =>
	$selectedAnalyses.reduce((acc, analysis) => acc + analysis.data_index.length, 0)
);
