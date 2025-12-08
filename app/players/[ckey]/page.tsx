import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { getBasicPlayer, getPlayer } from '@/app/lib/data';
import { openGraph, title } from '@/app/metadata';
import Player from '@/app/ui/player';

type Props = {
	params: Promise<{
		ckey: string;
	}>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { ckey } = await params;

	let player: Awaited<ReturnType<typeof getBasicPlayer>>;

	try {
		player = await getBasicPlayer(ckey);
	} catch {
		return {
			title: '500',
			openGraph
		};
	}

	return {
		title: player ? player.byond_key : '404',
		openGraph: {
			...openGraph,
			title: player ? `${player.byond_key} – ${title}` : undefined,
		}
	};
}

async function DynamicPage({ params }: Props) {
	const { ckey } = await params;

	const player = await getPlayer(ckey);

	if (!player) {
		notFound();
	}

	return <Player player={player} />;
}

export default async function Page({ params }: Props) {
	return (
		<Suspense>
			<DynamicPage params={params} />
		</Suspense>
	);
}
