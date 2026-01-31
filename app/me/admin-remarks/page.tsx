import { Suspense } from 'react';

import AdminRemarks from '@/app/ui/player-messages';

export default async function Page() {
	return (
		<Suspense>
			<AdminRemarks/>
		</Suspense>
	);
}
