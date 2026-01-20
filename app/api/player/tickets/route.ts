import { type NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import * as z from 'zod';

import { authOptions } from '@/src/lib/auth';
import headers from '@/src/lib/headers';

const endpoint = process.env.API_URL + '/v2/player/tickets';

const QuerySchema = z.object({
	fetch_size: z.string().refine(val => {
		const num = Number(val);
		return !isNaN(num) && num >= 1 && num <= 20;
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
	const session = await getServerSession(authOptions);

	if (!success) {
		return new NextResponse('Bad Request', { status: 400 });
	}

	if (!session?.user?.ckey) {
		return new NextResponse('Unauthorized', { status: 401 });
	}

	const ckey = session.user.ckey;

	const { fetch_size: fetchSize, page } = data;

	try {
		const response = await fetch(`${endpoint}?ckey=${ckey}&fetch_size=${fetchSize}&page=${page}`, { headers, next: { revalidate: 3_600 } });

		if (!response.ok) {
			throw new Error('Failed to fetch');
		}

		return NextResponse.json(await response.json());
	} catch {
		return new NextResponse('Internal Server Error', { status: 500 });
	}
}
