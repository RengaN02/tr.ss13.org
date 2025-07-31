import { type NextRequest, NextResponse } from 'next/server';

import headers from '@/app/lib/headers';

export const revalidate = 3_600; // 1 hour

const url = process.env.API_URL + '/v2/events/deaths';

export async function GET(request: NextRequest) {
	const fetchSize = request.nextUrl.searchParams.get('fetch_size');
	const page = request.nextUrl.searchParams.get('page');

	if (!fetchSize) {
		return new NextResponse('Missing fetch_size param', { status: 400 });
	}

	if (+fetchSize > 40) {
		return new NextResponse('fetch_size param is too large', { status: 400 });
	}

	if (!page) {
		return new NextResponse('Missing page param', { status: 400 });
	}

	try {
		const response = await fetch(url + `?fetch_size=${fetchSize}&page=${page}`, { headers, next: { revalidate } });

		if (!response.ok) {
			return new NextResponse('Internal API Error', { status: 500 });
		}

		return NextResponse.json(await response.json());
	} catch {
		return new NextResponse('Internal Server Error', { status: 500 });
	}
}
