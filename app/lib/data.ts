import type { OverviewData, Player } from '@/app/lib/definitions';
import headers from '@/app/lib/headers';

const revalidate = 3_600; // 1 hour

const player_url = process.env.API_URL + '/v2/player?ckey=';
const characters_url = process.env.API_URL + '/v2/player/characters?ckey=';
const roletime_url = process.env.API_URL + '/v2/player/roletime?ckey=';
const activity_url = process.env.API_URL + '/v2/player/activity?ckey=';
const achievements_url = process.env.API_URL + '/v2/player/achievements?achievement_type=achievement&ckey=';
const bans_url = process.env.API_URL + '/v2/player/ban?permanent=true&since=2023-08-23%2023:59:59&ckey=';

const statistics_url = process.env.API_URL + '/v2/events/overview?limit=100';

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
