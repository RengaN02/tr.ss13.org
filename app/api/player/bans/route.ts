import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/src/lib/auth';
import headers from '@/src/lib/headers';

const endpoint = process.env.API_URL + '/v2/player/ban';

export async function GET() {
	const session = await getServerSession(authOptions);

	if (!session?.user?.ckey) {
		return new NextResponse('Unauthorized', { status: 401 });
	}

	const ckey = session.user.ckey;

	try {
		const response = await fetch(`${endpoint}?ckey=${ckey}`, { headers, next: { revalidate: 3_600 } });

		if (!response.ok) {
			throw new Error('Failed to fetch');
		}

		return NextResponse.json(await response.json());
	} catch {
		return new NextResponse('Internal Server Error', { status: 500 });
	}
}
