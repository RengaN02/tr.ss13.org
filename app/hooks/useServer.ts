import useSWR from 'swr';

import type { ServerStatus } from '@/app//lib/definitions';
import fetcher from '@/app/lib/fetcher';

export default function useServer() {
	const { data, error, isLoading } = useSWR<ServerStatus[]>('/api/server', fetcher, {
		refreshInterval: 30_000,
		refreshWhenHidden: true,
		revalidateOnFocus: false,
	});

	return {
		servers: data,
		error,
		isLoading,
	};
}
