import { NextResponse } from 'next/server';

import headers from '@/src/lib/headers';

const endpoint = process.env.API_URL + '/v2/server';

export async function GET() {
	try {
		const response = await fetch(endpoint, { headers, next: { revalidate: 30 } });

		if (!response.ok) {
			throw new Error('Failed to fetch');
		}

		return NextResponse.json(await response.json());
	} catch {
		return new NextResponse('Internal Server Error', { status: 500 });
	}
}
