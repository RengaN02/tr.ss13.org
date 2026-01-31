import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/app/lib/auth';
import { get } from '@/app/lib/headers';

const friendsEndpoint = process.env.API_URL + '/v2/player/friends';
const invitesEndpoint = process.env.API_URL + '/v2/player/friend_invites';

export async function GET() {
	const session = await getServerSession(authOptions);
	const ckey = session?.user?.ckey;

	if (!ckey) {
		return new NextResponse('Unauthorized', { status: 401 });
	}

	try {
		const [friendsResponse, invitesResponse] = await Promise.all([
			get(`${friendsEndpoint}?ckey=${ckey}`),
			get(`${invitesEndpoint}?ckey=${ckey}`),
		]);

		if (!friendsResponse.ok || !invitesResponse.ok) {
			throw new Error('Failed to fetch');
		}

		const [friends, invites] = await Promise.all([
			friendsResponse.json(), invitesResponse.json()
		]);

		return NextResponse.json({ friends: friends, ...invites });
	} catch {
		return new NextResponse('Internal Server Error', { status: 500 });
	}
}
