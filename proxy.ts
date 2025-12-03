import type { NextRequest } from 'next/server';

import players from '@/app/proxy/players';

const proxies = [players];

// there is a reason why it's not `middlewares.flatMap((m) => m.matcher)`
// have to be able to statically parsed at compiled-time
// so need to add entries manually
export const config = {
	matcher: ['/players/:ckey*'],
};

export function proxy(request: NextRequest) {
	let response: Response | undefined;
	for (const p of proxies) {
		if (p.condition(request)) {
			const r = p.action(request);
			if (r) {
				response = r;
			}
		}
	}
	return response;
}
