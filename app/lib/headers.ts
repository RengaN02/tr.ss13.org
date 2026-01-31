'use server';

if (!process.env.API_KEY) {
	throw new Error('API_KEY is not defined');
}

const headers = { 'X-API-KEY': process.env.API_KEY! } as const;

export const get = async (url: string, revalidate?: number) => await fetch(url, { headers, next: { revalidate } });
export const post = async (url: string, body?: any) => await fetch(url, {
	method: 'POST',
	headers: {
		...headers,
		...(body && { 'Content-Type': 'application/json' }),
	},
	...(body && { body: JSON.stringify(body) }),
});
