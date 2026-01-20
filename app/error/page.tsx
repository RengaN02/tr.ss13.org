import type { Metadata } from 'next';
import { Suspense } from 'react';

import Error from '@/app/ui/error';

export const metadata: Metadata = {
	title: 'Hata',
};

export default async function Page() {
	return (
		<Suspense>
			<Error/>
		</Suspense>
	);
}
