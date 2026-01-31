import { type NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import * as z from 'zod';

import { authOptions } from '@/app/lib/auth';
import { get } from '@/app/lib/headers';

const endpoint = process.env.API_URL + '/v2/player/check_friends';

const QuerySchema = z.object({
	friend: z.string().min(1).max(32),
});

export async function GET(request: NextRequest) {
	const { success, data } = QuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));

	if (!success) {
		return new NextResponse('Bad Request', { status: 400 });
	}

	const session = await getServerSession(authOptions);
	const ckey = session?.user?.ckey;

	if (!ckey) {
		return new NextResponse('Unauthorized', { status: 401 });
	}

	const { friend } = data;

	try {
		const response = await get(`${endpoint}?ckey=${ckey}&friend=${friend}`, 3_600);

		if (!response.ok) {
			throw new Error('Failed to fetch');
		}

		return NextResponse.json(await response.json());
	} catch {
		return new NextResponse('Internal Server Error', { status: 500 });
	}
}
