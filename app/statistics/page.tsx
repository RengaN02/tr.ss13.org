import type { Metadata } from 'next';

import { getStatistics } from '@/app/lib/data';
import { openGraph, title } from '@/app/metadata';
import Statistics from '@/app/ui/statistics';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
	title: 'İstatistikler',
	openGraph: {
		...openGraph,
		title: `İstatistikler – ${title}`,
	},
};

export default async function Page() {
	const statistics = await getStatistics();

	return <Statistics statistics={statistics.reverse()} />;
}
