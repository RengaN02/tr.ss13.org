import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { Suspense } from 'react';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Friends from '@/app/ui/player-friends';
import VerifyMenu from '@/app/ui/verify';

async function FriendsPage() {
	const session = await getServerSession(authOptions);
	if(!session?.user) notFound();
	if(!session.user.ckey) return <VerifyMenu/>;

	return <Friends ckey={session.user.ckey}/>;
}

export default async function Page() {
	return (
		<Suspense>
			<FriendsPage/>
		</Suspense>
	);
}
