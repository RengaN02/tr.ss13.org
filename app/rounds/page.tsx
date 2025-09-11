import type { Metadata } from 'next';

import { openGraph, title } from '@/app/metadata';
import Rounds from '@/app/ui/rounds';

export const metadata: Metadata = {
	title: 'Roundlar',
	openGraph: {
		...openGraph,
		title: `Roundlar – ${title}`,
	},
};

export default async function Page() {
	return <Rounds></Rounds>;
}
