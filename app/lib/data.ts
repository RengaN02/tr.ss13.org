import { publicLogFiles } from '@/app/lib/constants';
import type { OverviewData, Picture, Player, RoundData } from '@/app/lib/definitions';
import headers from '@/app/lib/headers';
import { convertToUTC, formatDate } from '@/app/lib/time';

const revalidate = 3_600; // 1 hour

const player_url = process.env.API_URL + '/v2/player?ckey=';
const characters_url = process.env.API_URL + '/v2/player/characters?ckey=';
const roletime_url = process.env.API_URL + '/v2/player/roletime?ckey=';
const activity_url = process.env.API_URL + '/v2/player/activity?ckey=';
const achievements_url = process.env.API_URL + '/v2/player/achievements?achievement_type=achievement&ckey=';
const bans_url = process.env.API_URL + '/v2/player/ban?permanent=true&since=2023-08-23%2023:59:59&ckey=';

const statistics_url = process.env.API_URL + '/v2/events/overview?limit=100';

const round_url = process.env.API_URL + '/v2/round?round_id=';
const picture_logs_url = process.env.CDN_URL + '/pictures';
const logs_folder_url = process.env.PRODUCTION_URL + '/logs';

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

export async function getRound(round_id: number): Promise<Omit<RoundData, 'roundend_stats'> | null> {
	const roundResponse = await fetch(round_url + round_id, { headers, next: { revalidate } });

	if (!roundResponse.ok) {
		if (roundResponse.status === 404) {
			return null;
		}

		throw new Error('Internal API Error');
	}

	const round: Omit<RoundData, 'round_pictures' | 'log_files' | 'roundend_stats'> = await roundResponse.json();

	const roundPictures: RoundData['round_pictures'] = [];
	const logFiles: RoundData['log_files'] = [];

	const formattedPath = `${formatDate(convertToUTC(round.initialize_datetime))}/round-${round_id}`;

	try {
		const picturesMetadataRequest = await fetch(picture_logs_url + `/${formattedPath}/metadata.json`, { headers, next: { revalidate } });

		if (picturesMetadataRequest.ok) {
			const picturesMetadata: Record<string, Picture> = await picturesMetadataRequest.json();

			for (const picture of Object.values(picturesMetadata)) {
				roundPictures.push({
					id: picture.id,
					desc: picture.desc,
					name: picture.name,
					caption: picture.caption,
					pixel_size_x: picture.pixel_size_x,
					pixel_size_y: picture.pixel_size_y,
					src: picture.logpath.replace('data/picture_logs/', '')
				});
			}
		}
	} catch {
		// todo: handle error?
	}

	for (const file of publicLogFiles) {
		const fileUrl = `${logs_folder_url}/${formattedPath}/${file}`;

		const logFile: RoundData['log_files'][number] = {
			name: file,
			src: null,
		};

		try {
			const logFileResponse = await fetch(fileUrl, { method: 'HEAD', headers, next: { revalidate } });

			if (logFileResponse.ok) {
				logFile.src = fileUrl;
			}
		} catch {
			// todo: handle error?
		}

		logFiles.push(logFile);
	}

	return {
		...round,
		round_pictures: roundPictures,
		log_files: logFiles
	};
}

export async function getLogText(url: string): Promise<string | null> {
	const logResponse = await fetch(url, { headers, next: { revalidate } });

	if (!logResponse.ok) {
		if (logResponse.status === 404) {
			return null;
		}

		throw new Error('Internal API Error');
	}

	return await logResponse.text();
}

export async function getLogJson<T>(url: string): Promise<T | null> {
	const logResponse = await fetch(url, { headers, next: { revalidate } });

	if (!logResponse.ok) {
		if (logResponse.status === 404) {
			return null;
		}

		throw new Error('Internal API Error');
	}

	return await logResponse.json();
}
