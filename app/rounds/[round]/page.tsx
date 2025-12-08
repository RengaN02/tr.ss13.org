import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { parseRoundStats } from '@/app/lib/conversion';
import { getBasicRound, getLogJson, getLogText, getRound } from '@/app/lib/data';
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

	let round: Awaited<ReturnType<typeof getBasicRound>>;

	try {
		round = await getBasicRound(roundId);
	} catch {
		return {
			title: '500',
			openGraph
		};
	}

	return {
		title: round ? `Round ${roundId}` : '404',
		openGraph: {
			...openGraph,
			title: round ? `Round ${roundId} – ${title}` : undefined,
		}
	};
}

async function DynamicPage({ params }: Props) {
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

export default async function Page({ params }: Props) {
	return (
		<Suspense>
			<DynamicPage params={params} />
		</Suspense>
	);
}
