import { type NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import * as z from 'zod';

import { authOptions } from '@/app/lib/auth';
import { get } from '@/app/lib/headers';

const endpoint = process.env.API_URL + '/v2/player/rounds';

const QuerySchema = z.object({
	fetch_size: z.string().refine(val => {
		const num = Number(val);
		return !isNaN(num) && num >= 1 && num <= 40;
	}, {
		message: 'fetch_size must be a number between 1 and 40',
	}),
	page: z.string().refine(val => {
		const num = Number(val);
		return !isNaN(num) && num >= 1;
	}, {
		message: 'page must be a number greater than or equal to 1',
	}),
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

	const { fetch_size: fetchSize, page } = data;

	try {
		const response = await get(`${endpoint}?ckey=${ckey}&fetch_size=${fetchSize}&page=${page}`, 3_600);

		if (!response.ok) {
			throw new Error('Failed to fetch');
		}

		return NextResponse.json(await response.json());
	} catch {
		return new NextResponse('Internal Server Error', { status: 500 });
	}
}
