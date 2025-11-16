import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { parseRoundStats } from '@/app/lib/conversion';
import { getLogJson, getLogText, getRound } from '@/app/lib/data';
import type { RawRoundStats } from '@/app/lib/definitions';
import { openGraph, title } from '@/app/metadata';
import Round from '@/app/ui/round';

type Props = {
	params: Promise<{
		round: number;
	}>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { round: roundId } = await params;

	const round = await getRound(roundId);

	return {
		title: round ? `Round ${roundId}` : '404',
		openGraph: {
			...openGraph,
			title: round ? `Round ${roundId} – ${title}` : undefined,
		}
	};
}

export default async function Page({ params }: Props) {
	const { round: roundId } = await params;

	const round = await getRound(roundId);

	if (!round) {
		notFound();
	}

	const reportFile = round.log_files.find(log => log.name.startsWith('round_end_data.html') && log.src !== undefined);
	const statsFile = round.log_files.find(log => log.name.startsWith('round_end_data.json') && log.src !== undefined);

	const report = reportFile?.src ? await getLogText(reportFile.src) : null;

	const stats = statsFile?.src ? await getLogJson<RawRoundStats>(statsFile.src) : null;
	const parsedStats = stats ? await parseRoundStats(stats) : null;

	const fullRound = { ...round, roundend_stats: parsedStats };

	return <Round round={fullRound} roundReport={report} github={process.env.SERVER_GITHUB}/>;
}
