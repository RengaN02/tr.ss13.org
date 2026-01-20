import { type NextRequest, NextResponse } from 'next/server';
import * as z from 'zod';

import headers from '@/src/lib/headers';

const endpoint = process.env.API_URL + '/v2/events/crimes';

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

	const { fetch_size: fetchSize, page } = data;

	try {
		const response = await fetch(`${endpoint}?fetch_size=${fetchSize}&page=${page}`, { headers, next: { revalidate: 3_600 } });

		if (!response.ok) {
			throw new Error('Failed to fetch');
		}

		return NextResponse.json(await response.json());
	} catch {
		return new NextResponse('Internal Server Error', { status: 500 });
	}
}
