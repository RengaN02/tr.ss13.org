import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/src/lib/auth';
import headers from '@/src/lib/headers';

const endpoint = process.env.API_URL + '/v2/player/discord';

export async function GET() {
	const session = await getServerSession(authOptions);

	if (!session?.user?.id) {
		return new NextResponse('Unauthorized', { status: 401 });
	}

	const discord_id = session.user.id;

	try {
		const response = await fetch(`${endpoint}?discord_id=${discord_id}`, { headers });

		if (!response.ok) {
			throw new Error('Failed to fetch');
		}

		return NextResponse.json(await response.json());
	} catch {
		return new NextResponse('Internal Server Error', { status: 500 });
	}
}
