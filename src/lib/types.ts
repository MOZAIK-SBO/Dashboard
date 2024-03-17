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
	statuses: { mpc_id: string; status: string }[];
	status: string;
};
