import { Suspense } from 'react';

import AdminRemarks from '@/app/ui/player-messages';

async function AdminRemarksPage() {
	return <AdminRemarks />;
}

export default async function Page() {
	return (
		<Suspense>
			<AdminRemarksPage/>
		</Suspense>
	);
}
