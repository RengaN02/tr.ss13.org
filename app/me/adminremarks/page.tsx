import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { Suspense } from 'react';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import AdminRemarks from '@/app/ui/player-messages';
import VerifyMenu from '@/app/ui/verify';

async function AdminRemarksPage() {
	const session = await getServerSession(authOptions);
	if(!session?.user) notFound();
	if(!session.user.ckey) return <VerifyMenu/>;

	return <AdminRemarks />;
}

export default async function Page() {
	return (
		<Suspense>
			<AdminRemarksPage/>
		</Suspense>
	);
}
