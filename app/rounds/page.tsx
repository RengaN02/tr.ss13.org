import type { Metadata } from 'next';

import { openGraph, title } from '@/app/metadata';
import RoundSearch from '@/app/ui/round-search';

export const metadata: Metadata = {
	title: 'Roundlar',
	openGraph: {
		...openGraph,
		title: `Roundlar – ${title}`,
	},
};

export default async function Page() {
	return <RoundSearch />;
}
