import { RoundStats } from '@/app/lib/definitions';

export function gameState(gamestate: number) {
	switch (gamestate) {
		case 0:
			return 'Lobi';
		case 1:
			return 'Lobi';
		case 2:
			return 'Başlıyor';
		case 3:
			return 'Devam ediyor';
		case 4:
			return 'Bitti';
		default:
			return '';
	}
}

export function roundDuration(seconds: number) {
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);

	const pad = (n: number) => n.toString().padStart(2, '0');

	return `${pad(hours)}:${pad(minutes % 60)}:${pad(seconds % 60)}`;
}

function toArray<T>(input: T): T | any[] {
    if (typeof input === 'object' && input !== null) {
        return Object.values(input);
    }
    return input;
}

export async function parseRoundStats(stats: any): Promise<RoundStats | null> {
	if(!stats) return null;
	const escapees = stats.escapees;
	const abandoned = stats.abandoned;

	const humans = [
		...toArray(escapees.humans),
		...toArray(abandoned.humans),
	];
	const silicons = [
		...toArray(escapees.silicons),
		...toArray(abandoned.silicons),
	];
	const others = [
		...toArray(escapees.others),
		...toArray(abandoned.others),
	];
	const ghosts = [
		...toArray(stats.ghosts)
	];

	const living = {
		humans,
		silicons,
		others
	};

	const station_integrity = stats['additional data']['station integrity'];

	return {
		living,
		ghosts,
		station_integrity
	};
}
