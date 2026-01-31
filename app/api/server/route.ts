import { NextResponse } from 'next/server';

import { get } from '@/app/lib/headers';

const endpoint = process.env.API_URL + '/v2/server';

export async function GET() {
	try {
		const response = await get(endpoint, 30);

		if (!response.ok) {
			throw new Error('Failed to fetch');
		}

		return NextResponse.json(await response.json());
	} catch {
		return new NextResponse('Internal Server Error', { status: 500 });
	}
}
