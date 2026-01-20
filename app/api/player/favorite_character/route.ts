import { NextRequest, NextResponse } from 'next/server';
import * as z from 'zod';

import headers from '@/src/lib/headers';

const endpoint = process.env.API_URL + '/v2/player/favorite_character';

const QuerySchema = z.object({
	ckey: z.string().min(1).max(32)
});

export async function GET(request: NextRequest) {
	const { success, data } = QuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));

	if (!success) {
		return new NextResponse('Bad Request', { status: 400 });
	}

	const { ckey } = data;

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
