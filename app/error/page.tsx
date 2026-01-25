import type { Metadata } from 'next';

import Error from '@/app/ui/error';

export const metadata: Metadata = {
	title: 'Hata',
};

export default function Page() {
	return <Error/>;
}
