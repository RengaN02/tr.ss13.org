import { getServerSession } from 'next-auth';
import { Suspense } from 'react';

import Friends from '@/app/ui/player-friends';
import { authOptions } from '@/app/lib/auth';

async function FriendsPage() {
	const session = await getServerSession(authOptions);
	return <Friends ckey={session!.user!.ckey!}/>;
}

export default async function Page() {
	return (
		<Suspense>
			<FriendsPage/>
		</Suspense>
	);
}
