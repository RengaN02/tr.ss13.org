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
	for (const p of proxies) {
		if (p.condition(request)) {
			const r = await p.action(request);
			if (r) {
				return r;
			}
		}
	}
	return NextResponse.next();
}
