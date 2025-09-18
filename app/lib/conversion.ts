import type { RawRoundStats, RoundStats } from '@/app/lib/definitions';

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

export async function parseRoundStats(stats: RawRoundStats): Promise<RoundStats> {
	const escapees = stats.escapees;
	const abandoned = stats.abandoned;

	const humans = [
		...Object.values(escapees.humans),
		...Object.values(abandoned.humans),
	];
	const silicons = [
		...Object.values(escapees.silicons),
		...Object.values(abandoned.silicons),
	];
	const others = [
		...Object.values(escapees.others),
		...Object.values(abandoned.others),
	];
	const ghosts = [
		...Object.values(stats.ghosts)
	];

	const living = { humans, silicons, others };

	const stationIntegrity = stats['additional data']['station integrity'];

	return {
		living,
		ghosts,
		station_integrity: stationIntegrity
	};
}

export function capitalize(str: string) {
	return str.replace(/\b\w/g, char => char.toUpperCase());
}
