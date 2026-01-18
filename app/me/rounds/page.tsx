import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { Suspense } from 'react';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import PlayerRounds from '@/app/ui/player-rounds';
import VerifyMenu from '@/app/ui/verify';

async function PlayerRoundsPage() {
	const session = await getServerSession(authOptions);
	if(!session?.user) notFound();
	if(!session.user.ckey) return <VerifyMenu/>;

	return <PlayerRounds/>;
}

export default async function Page() {
	return (
		<Suspense>
			<PlayerRoundsPage/>
		</Suspense>
	);
}
