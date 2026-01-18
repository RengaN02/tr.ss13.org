import { type NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import * as z from 'zod';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import headers from '@/app/lib/headers';

const endpoint = process.env.API_URL + '/v2/player/check_friends';

const QuerySchema = z.object({
	friend_ckey: z.string().min(1).max(32),
});

export async function GET(request: NextRequest) {
	const { success, data } = QuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
	const session = await getServerSession(authOptions);

	if (!success) {
		return new NextResponse('Bad Request', { status: 400 });
	}

	if (!session?.user?.ckey) {
		return new NextResponse('Unauthorized', { status: 401 });
	}

	const ckey = session.user.ckey;

	const { friend_ckey } = data;

	try {
		const response = await fetch(`${endpoint}?ckey=${ckey}&friend=${friend_ckey}`, { headers });

		if (!response.ok) {
			throw new Error('Failed to fetch');
		}

		return NextResponse.json(await response.json());
	} catch {
		return new NextResponse('Internal Server Error', { status: 500 });
	}
}
