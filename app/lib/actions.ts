'use server';

import type { Friendship } from '@/app/lib/definitions';
import { post } from '@/app/lib/headers';

const verifyEndpont = process.env.API_URL + '/v2/verify';

const addFriendhipEndpoint = process.env.API_URL + '/v2/player/add_friend';
const removeFriendhipEndpoint = process.env.API_URL + '/v2/player/remove_friend';
const acceptFriendhipEndpoint = process.env.API_URL + '/v2/player/accept_friend';
const declineFriendhipEndpoint = process.env.API_URL + '/v2/player/decline_friend';

export async function verifyUser(code: string, id: string) {
	try {
		const response = await post(verifyEndpont, { discord_id: id, one_time_token: code });

		if (!response.ok) {
			if (response.status === 404) {
				return {
					success: false,
					message: 'Doğrulama kodu geçersiz!',
				};
			} else if (response.status === 409) {
				return {
					success: false,
					message: 'Bu hesap zaten başka bir hesap ile bağlantılı!',
				};
			}

			throw new Error('Internal Server Error');
		}

		const ckey = await response.json();

		return {
			success: true,
			message: 'Başarıyla doğrulandı!',
			ckey,
		};
	} catch {
		return {
			success: false,
			message: 'Bir sunucu hatası oluştu.'
		};
	}
}

export async function addFriend(ckey: string, friend: string): Promise<Friendship | null> {
	try {
		const response = await post(`${addFriendhipEndpoint}?ckey=${ckey}&friend=${friend}`);

		if (!response.ok) return null;

		return await response.json();
	} catch {
		return null;
	}
}

export async function removeFriend(ckey: string, friendship: number): Promise<Friendship | null> {
	try {
		const response = await post(`${removeFriendhipEndpoint}?ckey=${ckey}&friendship_id=${friendship}`);

		if (!response.ok) return null;

		return await response.json();
	} catch {
		return null;
	}
}

export async function acceptFriend(ckey: string, friendship: number): Promise<Friendship | null> {
	try {
		const response = await post(`${acceptFriendhipEndpoint}?ckey=${ckey}&friendship_id=${friendship}`);

		if (!response.ok) return null;

		return await response.json();
	} catch {
		return null;
	}
}

export async function declineFriend(ckey: string, friendship: number): Promise<Friendship | null> {
	try {
		const response = await post(`${declineFriendhipEndpoint}?ckey=${ckey}&friendship_id=${friendship}`);

		if (!response.ok) return null;

		return await response.json();
	} catch {
		return null;
	}
}
