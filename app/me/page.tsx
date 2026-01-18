import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { Suspense } from 'react';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getPlayer } from '@/app/lib/data';
import Player from '@/app/ui/player';
import VerifyMenu from '@/app/ui/verify';

async function MePage() {
	const session = await getServerSession(authOptions);
	if(!session?.user) notFound();
	if(!session.user.ckey) return <VerifyMenu/>;
	const player = await getPlayer(session.user.ckey);

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
