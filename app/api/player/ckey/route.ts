import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/app/lib/auth';
import { get } from '@/app/lib/headers';

const endpoint = process.env.API_URL + '/v2/player/discord';

export async function GET() {
	const session = await getServerSession(authOptions);
	const id = session?.user?.id;

	if (!id) {
		return new NextResponse('Unauthorized', { status: 401 });
	}

	try {
		const response = await get(`${endpoint}?discord_id=${id}`, 3_600);

		if (!response.ok) {
			throw new Error('Failed to fetch');
		}

		return NextResponse.json(await response.json());
	} catch {
		return new NextResponse('Internal Server Error', { status: 500 });
	}
}
