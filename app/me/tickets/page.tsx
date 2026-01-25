import { getServerSession } from 'next-auth';
import { Suspense } from 'react';

import Tickets from '@/app/ui/player-tickets';
import { authOptions } from '@/app/lib/auth';

async function TicketsPage() {
	const session = await getServerSession(authOptions);
	return <Tickets ckey={session!.user!.ckey!}/>;
}

export default async function Page() {
	return (
		<Suspense>
			<TicketsPage/>
		</Suspense>
	);
}
