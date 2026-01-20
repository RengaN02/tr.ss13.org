import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { Suspense } from 'react';

import { getPlayer } from '@/app/lib/data';
import Player from '@/app/ui/player';
import { authOptions } from '@/src/lib/auth';

async function MePage() {
	const session = await getServerSession(authOptions);
	const player = await getPlayer(session!.user!.ckey!);

	if (!player) notFound();

	return <Player player={player}></Player>;
}

export default async function Page() {
	return (
		<Suspense>
			<MePage/>
		</Suspense>
	);
}
