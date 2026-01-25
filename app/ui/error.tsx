'use client';

import { useSearchParams } from 'next/navigation';

export default function Error() {
	const searchParams = useSearchParams();

	const error = searchParams.get('message') || 'Internal Server Error';
	const code = searchParams.get('status') || 500;

	return (
		<div className="flex-1 flex flex-col items-center justify-end">
			<div className="flex items-center font-system">
				<span className="inline-block mr-5 pr-6 border-r border-r-white border-opacity-30 text-2xl leading-[3rem] font-medium">{code}</span>
				<span className="inline-block text-sm leading-[3rem]">{error}</span>
			</div>
		</div>
	);
}
