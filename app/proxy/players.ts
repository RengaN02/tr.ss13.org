import type { Proxy } from '@/app/lib/definitions';

export default {
	matcher: ['/players/:ckey*'],
	condition(request) {
		if (request.nextUrl.pathname.startsWith('/players/')) {
			return true;
		}
		return false;
	},
	action(request) {
		const [, , ckey, ...rest] = request.nextUrl.pathname.split('/');

		if (ckey !== ckey.toLowerCase()) {
			const url = '/players/' + ckey.toLowerCase() + rest.map((v) => `/${v}`).join('');
			return Response.redirect(new URL(url, request.nextUrl));
		}
	},
} satisfies Proxy;
