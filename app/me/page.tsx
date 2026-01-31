import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { Suspense } from 'react';

import { authOptions } from '@/app/lib/auth';
import { getPlayer } from '@/app/lib/data';
import Player from '@/app/ui/player';

async function Me() {
	const session = await getServerSession(authOptions);

	// todo: bunun (!) garantisi ne?
	const player = await getPlayer(session!.user!.ckey!);

	if (!player) notFound();

	return <Player player={player}></Player>;
}

export default async function Page() {
	return (
		<Suspense>
			<Me/>
		</Suspense>
	);
}
