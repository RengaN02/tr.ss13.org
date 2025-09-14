import { publicLogFiles } from '@/app/lib/constants';
import type { OverviewData, Player, RoundData } from '@/app/lib/definitions';
import headers from '@/app/lib/headers';
import { formatDate } from '@/app/lib/time';

const revalidate = 3_600; // 1 hour

const player_url = process.env.API_URL + '/v2/player?ckey=';
const characters_url = process.env.API_URL + '/v2/player/characters?ckey=';
const roletime_url = process.env.API_URL + '/v2/player/roletime?ckey=';
const activity_url = process.env.API_URL + '/v2/player/activity?ckey=';
const achievements_url = process.env.API_URL + '/v2/player/achievements?achievement_type=achievement&ckey=';
const bans_url = process.env.API_URL + '/v2/player/ban?permanent=true&since=2023-08-23%2023:59:59&ckey=';

const statistics_url = process.env.API_URL + '/v2/events/overview?limit=100';

const round_url = process.env.API_URL + '/v2/round?round_id=';
const picture_logs_url = process.env.CDN_URL + '/picture-logs/';
const logs_folder_url = process.env.PRODUCTION_URL + '/logs/';

export async function getPlayer(ckey: string): Promise<Player> {
	const playerPromise = fetch(player_url + ckey, { headers, next: { revalidate } });
	const charactersPromise = fetch(characters_url + ckey, { headers, next: { revalidate } });
	const roletimePromise = fetch(roletime_url + ckey, { headers, next: { revalidate } });
	const activityPromise = fetch(activity_url + ckey, { headers, next: { revalidate } });
	const achievementsPromise = fetch(achievements_url + ckey, { headers, next: { revalidate } });
	const bansPromise = fetch(bans_url + ckey, { headers, next: { revalidate } });

	const [
		playerResponse, charactersResponse,
		roletimeResponse, activityResponse,
		achievementsResponse, bansResponse
	] = await Promise.all([
		playerPromise, charactersPromise,
		roletimePromise, activityPromise,
		achievementsPromise, bansPromise
	]);

	if (!(
		playerResponse.ok && charactersResponse.ok &&
		roletimeResponse.ok && activityResponse.ok &&
		achievementsResponse.ok && bansResponse.ok
	)) {
		if (playerResponse.status === 404) {
			return null;
		}

		throw new Error('Internal API Error');
	}

	const [
		player, characters,
		roletime, activity,
		achievements, bans
	] = await Promise.all([
		playerResponse.json(), charactersResponse.json(),
		roletimeResponse.json(), activityResponse.json(),
		achievementsResponse.json(), bansResponse.json()
	]);

	for (const ban of bans) {
		delete ban.edits;
	}

	return {
		...player,
		characters,
		roletime,
		activity,
		achievements,
		bans,
	};
}

export async function getStatistics(): Promise<OverviewData[]> {
	const statisticsResponse = await fetch(statistics_url, { headers, next: { revalidate } });

	if (!statisticsResponse.ok) {
		if (statisticsResponse.status === 404) {
			return [];
		}

		throw new Error('Internal API Error');
	}

	return await statisticsResponse.json();
}

export async function getRound(round_id: number): Promise<RoundData | null> {
	const roundRequest = await fetch(round_url + round_id, { headers, next: { revalidate } });
	if (!(roundRequest.ok)) {
		if (roundRequest.status === 404) {
			return null;
		}
		throw new Error('Internal API Error');
	}

	const round = await roundRequest.json();
	const round_pictures: any[] = [];
	const log_files: any[] = [];

	const formatted_date = formatDate(round.initialize_datetime);
	const formatted_path = `${formatted_date}/round-${round_id}`;
	try {
		const photo_metadata_request = await fetch(picture_logs_url + `${formatted_path}/metadata.json`, { headers, next: { revalidate } });
		if (photo_metadata_request.ok) {
			const photo_metadata = await photo_metadata_request.json();
			Object.keys(photo_metadata).forEach((item) => {
				photo_metadata[item].src = photo_metadata[item].logpath.replace('data/picture_logs/', '');
				delete photo_metadata[item].logpath;
				delete photo_metadata[item].tag;
				round_pictures.push(photo_metadata[item]);
			});
		}
	} catch {}
	for (const item of publicLogFiles) {
		const file_url = logs_folder_url + `${formatted_path}/${item}`;
		const log_file: any = {name: item};
		try {
			const logfile_request = await fetch(file_url, { method: 'OPTIONS', headers, next: { revalidate } });
			if (logfile_request.ok) {
				log_file.src = file_url;
			}
		} catch {}
		log_files.push(log_file);
	}

	return {
		...round,
		round_pictures,
		log_files
	};
}

export async function getLogText(url: string | null): Promise<string | null> {
	if(!url) return null;

	const logResponse = await fetch(url, { headers, next: { revalidate } });

	if (!logResponse.ok) {
		if (logResponse.status === 404) {
			return null;
		}

		throw new Error('Internal API Error');
	}

	return await logResponse.text();
}

export async function getLogJson<T>(url: string | null): Promise<T | null> {
	if(!url) return null;

	const logResponse = await fetch(url, { headers, next: { revalidate } });

	if (!logResponse.ok) {
		if (logResponse.status === 404) {
			return null;
		}

		throw new Error('Internal API Error');
	}

	return await logResponse.json();
}
