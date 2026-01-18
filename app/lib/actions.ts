'use server';
import type { Friendship } from '@/app/lib/definitions';
import headers from '@/app/lib/headers';

const verify_url = process.env.API_URL + '/v2/verify';

const add_friendhip_url = process.env.API_URL + '/v2/player/add_friend';
const remove_friendhip_url = process.env.API_URL + '/v2/player/remove_friend';
const accept_friendhip_url = process.env.API_URL + '/v2/player/accept_friend';
const decline_friendhip_url = process.env.API_URL + '/v2/player/decline_friend';

export async function verifyUser(code: string, discord_id: string) {
	try {
		const fetch_headers = { ...headers, 'Content-Type': 'application/json' };
		const response = await fetch(verify_url, {
			method: 'POST',
			headers: fetch_headers,
			body: JSON.stringify({
				discord_id: discord_id,
				one_time_token: code,
			}),
		});

		if (!response.ok) {
			if (response.status === 404) return {success: false, message: 'Doğrulama kodu geçersiz!'};
			if (response.status === 409) return {success: false, message: 'Bu hesap zaten başka bir hesap ile bağlantılı!'};
		}

		const responsejson = await response.json();

		return { success: true, message: 'Başarıyla doğrulandı!', ckey: responsejson };
	} catch {
		return { success: false, message: 'Bir sunucu hatası oluştu.' };
	}
}

export async function addFriend(ckey: string | null, friend: string): Promise<Friendship | null> {
	if(ckey === null) return null;
	try {
		const response = await fetch(add_friendhip_url + `?ckey=${ckey}&friend=${friend}`, {method: 'POST', headers});

		if (!response.ok) return null;

		return await response.json();
	} catch {
		return null;
	}
}

export async function removeFriend(ckey: string | null, friendship_id: number): Promise<Friendship | null> {
	if(ckey === null) return null;
	try {
		const response = await fetch(remove_friendhip_url + `?ckey=${ckey}&friendship_id=${friendship_id}`, {method: 'POST', headers});

		if (!response.ok) return null;

		return await response.json();
	} catch {
		return null;
	}
}

export async function acceptFriend(ckey: string | null, friendship_id: number): Promise<Friendship | null> {
	if(ckey === null) return null;
	try {
		const response = await fetch(accept_friendhip_url + `?ckey=${ckey}&friendship_id=${friendship_id}`, {method: 'POST', headers});

		if (!response.ok) return null;

		return await response.json();
	} catch {
		return null;
	}
}

export async function declineFriend(ckey: string | null, friendship_id: number): Promise<Friendship | null> {
	if(ckey === null) return null;
	try {
		const response = await fetch(decline_friendhip_url + `?ckey=${ckey}&friendship_id=${friendship_id}`, {method: 'POST', headers});

		if (!response.ok) return null;

		return await response.json();
	} catch {
		return null;
	}
}


