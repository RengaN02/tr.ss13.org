import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import headers from '@/app/lib/headers';

const friendsEndpoint = process.env.API_URL + '/v2/player/friends';
const invitesEndpoint = process.env.API_URL + '/v2/player/friend_invites';

export async function GET() {
	const session = await getServerSession(authOptions);

	if (!session?.user?.ckey) {
		return new NextResponse('Unauthorized', { status: 401 });
	}

	const ckey = session.user.ckey;

	try {
		const friendsResponse = await fetch(`${friendsEndpoint}?ckey=${ckey}`, { headers });
		const invitesResponse = await fetch(`${invitesEndpoint}?ckey=${ckey}`, { headers });

		if (!friendsResponse.ok || !invitesResponse.ok) {
			throw new Error('Failed to fetch');
		}

		const [
			friends, invites
		] = await Promise.all([
			friendsResponse.json(), invitesResponse.json()
		]);

		return NextResponse.json({
			friends: friends,
			...invites
		});
	} catch {
		return new NextResponse('Internal Server Error', { status: 500 });
	}
}
