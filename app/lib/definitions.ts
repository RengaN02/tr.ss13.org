import type { NextRequest } from 'next/server';

export type ServerStatus = {
	connection_info: string;
	gamestate: number;
	map: string;
	name: string;
	players: number;
	round_duration: number;
	round_id: number;
	security_level: string;
	server_status: number;
	err_str?: string;
};

export type Player = {
	ckey: string;
	byond_key: string;
	first_seen: string;
	last_seen: string;
	first_seen_round: number;
	last_seen_round: number;
	byond_age: string;
	characters: [string, number][];
	roletime: { job: string; minutes: number }[];
	activity: [string, number][];
	achievements: {
		achievement_key: string;
		achievement_version: number;
		achievement_type: string | null;
		achievement_name: string | null;
		achievement_description: string | null;
		value: number | null;
		timestamp: string;
	}[];
	bans: {
		bantime: string;
		round_id: number | null;
		roles: string | null;
		expiration_time: string | null;
		reason: string;
		ckey: string | null;
		a_ckey: string;
		unbanned_datetime: string | null;
		unbanned_ckey: string | null;
	}[];
} | null;

export type Death = {
	name: string;
	job: string;
	pod: string;
	bruteloss: number;
	fireloss: number;
	oxyloss: number;
	toxloss: number;
	last_words: string | null;
	suicide: boolean;
	round_id: number | null;
	tod: string;
};

export type Citation = {
	sender: string;
	recipient: string;
	crime: string;
	crime_desc: string | null;
	fine: number | null;
	timestamp: string;
	round_id: number | null;
};

export type OverviewData = {
	round_id: number;
	threat_level: number;
	citations: number;
	deaths: number;
	readied_players: number;
	players: number;
	duration: number;
	time: string;
};

export type RoundData = {
	round_id: number;
	map_name: string;
	station_name: string | null;
	commit_hash: string | null;
	shuttle_name: string | null;
	initialize_datetime: string;
	start_datetime: string | null;
	end_datetime: string | null;
	shutdown_datetime: string | null;
	dynamic_tier: number | null;
	population: [string, number][];
	antagonists: Antagonist[];
	nukedisk: {
		x: number | null,
		y: number | null,
		z: number | null,
		holder: string | null,
	} | null;
	round_pictures: {
		id: string;
		desc: string | null;
		name: string | null;
		caption: string | null;
		pixel_size_x: number;
		pixel_size_y: number;
		src: string;
	}[] | null;
	log_files: {
		name: string;
		src: string | null;
	}[];
	roundend_stats: RoundStats | null
};

export type RoundStats = {
	living: {
		humans: MobType[];
		silicons: MobType[];
		others: MobType[];
	};
	ghosts: MobType[];
	station_integrity: number;
} | null;

export type MobType = {
	name: string;
	ckey: string | null;
	job: string | null;
	species: string | null;
	module: string | null;
}

export type Antagonist = {
	key: string;
	name: string;
	antagonist_name: string;
	objectives: {
		text: string;
		result: string;
	}[];
}

export interface Middleware {
	matcher: string[];
	condition: (request: NextRequest) => boolean;
	action: (request: NextRequest) => Response | void;
}
