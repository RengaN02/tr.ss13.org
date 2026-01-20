import { Suspense } from 'react';

import Bans from '@/app/ui/player-bans';

async function BansPage() {
	return <Bans/>;
}

export default async function Page() {
	return (
		<Suspense>
			<BansPage/>
		</Suspense>
	);
}
