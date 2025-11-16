import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

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

export default async function Page({ params }: Props) {
	const { ckey } = await params;
	const player = await getPlayer(ckey);

	if (!player) {
		notFound();
	}

	return <Player player={player} />;
}
