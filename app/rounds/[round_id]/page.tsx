import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { parseRoundStats } from '@/app/lib/conversion';
import { getLogJson,getLogText, getRound } from '@/app/lib/data';
import { openGraph, title } from '@/app/metadata';
import Round from '@/app/ui/round';

export const revalidate = 3_600; // 1 hour

type Props = {
	params: Promise<{
		round_id: number;
	}>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { round_id } = await params;
	const round = await getRound(round_id);

	return {
		title: round ? `Round ${round_id}` : '404',
		openGraph: {
			...openGraph,
			title: round ? `Round ${round_id} – ${title}` : undefined,
		}
	};
}

export default async function Page({ params }: Props) {
	const { round_id } = await params;
	let round = await getRound(round_id);
	if (!round) {
		notFound();
	}

	const roundend_report_file = round.log_files.find(obj => obj.name.startsWith('round_end_data.html') && obj.src !== undefined);
	const roundend_stats_file = round.log_files.find(obj => obj.name.startsWith('round_end_data.json') && obj.src !== undefined);
	const round_report = await getLogText(roundend_report_file?.src || null);

	let roundend_stats = await getLogJson<any>(roundend_stats_file?.src || null);
	roundend_stats = await parseRoundStats(roundend_stats);
	round = {
		...round,
		roundend_stats
	};

	return <Round round={round} round_report={round_report} github_url={process.env.SERVER_GITHUB}/>;
}
