import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { Suspense } from 'react';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Bans from '@/app/ui/player-bans';
import VerifyMenu from '@/app/ui/verify';

async function BansPage() {
	const session = await getServerSession(authOptions);
	if(!session?.user) notFound();
	if(!session.user.ckey) return <VerifyMenu/>;

	return <Bans ckey={session.user.ckey}/>;
}

export default async function Page() {
	return (
		<Suspense>
			<BansPage/>
		</Suspense>
	);
}
