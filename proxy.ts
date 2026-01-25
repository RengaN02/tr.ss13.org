import { type NextRequest, NextResponse } from 'next/server';

import auth from '@/app/proxy/auth';
import players from '@/app/proxy/players';

const proxies = [players, auth];

// there is a reason why it's not `middlewares.flatMap((m) => m.matcher)`
// have to be able to statically parsed at compiled-time
// so need to add entries manually
export const config = {
	matcher: ['/players/:ckey*', '/me/:path*', '/verify'],
};

export async function proxy(request: NextRequest) {
	for (const proxy of proxies) {
		if (proxy.condition(request)) {
			const response = await proxy.action(request);
			if (response) {
				return response;
			}
		}
	}
	return NextResponse.next();
}
