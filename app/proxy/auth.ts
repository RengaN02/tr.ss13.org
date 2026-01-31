import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

import type { Proxy } from '@/app/lib/definitions';

const secret = process.env.NEXTAUTH_SECRET;

export default {
	matcher: ['/me/:path*', '/verify'],
	condition(request) {
		return request.nextUrl.pathname.startsWith('/me') || request.nextUrl.pathname.startsWith('/verify');
	},
	async action(request) {
		const token = await getToken({ req: request, secret });

		if (!token) {
			const url = request.nextUrl.clone();
			url.pathname = '/sign-in';
			url.searchParams.set('callbackUrl', request.url);

			return NextResponse.redirect(url);
		}

		if(!token.ckey && !request.nextUrl.pathname.startsWith('/verify')) {
			const url = request.nextUrl.clone();
			url.pathname = '/verify';
			url.searchParams.set('callbackUrl', request.url);

			return NextResponse.redirect(url);
		}
	},
} satisfies Proxy;
