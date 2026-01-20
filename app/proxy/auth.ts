import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

import type { Proxy } from '@/app/lib/definitions';

export default {
	matcher: ['/me/:path*', '/verify'],
	condition(request) {
		return request.nextUrl.pathname.startsWith('/me') || request.nextUrl.pathname.startsWith('/verify');
	},
	async action(request) {
		const token = await getToken({
			req: request,
			secret: process.env.NEXTAUTH_SECRET
		});

		if (!token) {
			const url = request.nextUrl.clone();
			url.pathname = '/login';
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
