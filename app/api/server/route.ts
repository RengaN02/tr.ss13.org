import { NextResponse } from 'next/server';

import headers from '@/app/lib/headers';

export const revalidate = 30; // 30 seconds

const url = process.env.NEXT_PUBLIC_API_URL + '/v2/server';

export async function GET() {
	try {
		const response = await fetch(url, { headers, next: { revalidate } });

		if (!response.ok) {
			return new NextResponse('Internal API Error', { status: 500 });
		}

		return NextResponse.json(await response.json());
	} catch {
		return new NextResponse('Internal Server Error', { status: 500 });
	}
}
