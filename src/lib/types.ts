export type MpcParty = {
	mpc_id: string;
	host: string;
	mpc_key: string;
	region: string;
};

export type MetricEvent = {
	timestamp: number;
	metric: string;
	source: string;
};

export type Analysis = {
	analysis_id: string;
	user_id: string;
	user_key: string;
	source_dataset: string;
	result_dataset: string;
	metric: string;
	data_index: number[];
	result_timestamps: number[];
	parties: string[];
	analysis_type: string;
	created_at: number;
	keys_exp_at: number;
	latest_status: string;
	invoker: string;
};

export type BatchInfo = {
	batch_id: string;
	batch_size: number;
	analysis_data_point_count: number;
	analysis_ids: string[];
	user_ids: string[];
	analysis_type: string;
	online_only: boolean;
	parties: string[];
	created_at: number;
	first_keys_exp_at: number;
	latest_status: string;
	invoker: string;
};

export type StreamingInfo = {
	is_streaming: boolean;
	analysis_type?: string;
	batch_size?: number;
	keys_exp_at?: number;
	start_time?: number;
	source?: string;
	result?: string;
	submitted_batches?: string[];
	current_analysis_ids?: string[];
};
