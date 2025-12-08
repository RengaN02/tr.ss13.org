import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { getPlayer } from '@/app/lib/data';
import { openGraph, title } from '@/app/metadata';
import Player from '@/app/ui/player';

type Props = {
	params: Promise<{
		ckey: string;
	}>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { ckey } = await params;
	const player = await getPlayer(ckey);

	return {
		title: player ? player.byond_key : '404',
		openGraph: {
			...openGraph,
			title: player ? `${player.byond_key} – ${title}` : undefined,
		}
	};
}

// i'm too lazy rn to figure out a proper solution (context: migrating next 15->16)
async function Page_({ ckey }: { ckey: Promise<string> }) {
	const player = await getPlayer(await ckey);

	if (!player) {
		notFound();
	}

	return <Player player={player} />;
}

export default async function Page({ params }: Props) {
	const ckey = params.then(p => p.ckey);

	return (
		<Suspense>
			<Page_ ckey={ckey} />
		</Suspense>
	);
}
