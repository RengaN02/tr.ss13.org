if (!process.env.API_KEY) {
	throw new Error('API_KEY is not defined');
}

const headers = {
	'X-API-KEY': process.env.API_KEY!,
} as const;

export default headers;
