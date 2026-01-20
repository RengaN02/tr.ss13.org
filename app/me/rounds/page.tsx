import { getServerSession } from 'next-auth';
import { Suspense } from 'react';

import PlayerRounds from '@/app/ui/player-rounds';
import { authOptions } from '@/src/lib/auth';

async function PlayerRoundsPage() {
	const session = await getServerSession(authOptions);
	return <PlayerRounds ckey={session!.user!.ckey!}/>;
}

export default async function Page() {
	return (
		<Suspense>
			<PlayerRoundsPage/>
		</Suspense>
	);
}
