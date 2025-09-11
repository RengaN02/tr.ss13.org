'use client';

import Link from 'next/link';
import { useEffect } from 'react';

type ErrorProps = {
	error: Error & { digest?: string };
	reset: () => void;
};

export default function Error({ error }: ErrorProps) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<div className="flex-1 flex flex-col items-center gap-5">
			<span className="text-red-500">An error has occurred: {error.message}</span>
			<Link className="underline" href="/rounds">Geri dön</Link>
		</div>
	);
}
