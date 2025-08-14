import type { Metadata } from 'next';

export const title = 'Psychonaut Station';

export const description = `${title}'a hoş geldin.`;

const keywords = [
	title, 'SS13', 'Space Station 13', 'Türkçe', 'Türk',
	'SS13TR', 'SS13TR', 'SS13 Türkiye', 'SS13 Türkçe',
	'SS13 Türk', 'SS13TR Türkçe', 'SS13TR Türk', 'SS13TR Türkiye'
];

const url = process.env.PRODUCTION_URL;

export const openGraph: Metadata['openGraph'] = {
	title,
	siteName: title,
	locale: 'tr_TR',
	type: 'website',
};

export const metadata: Metadata = {
	title: {
		template: `%s – ${title}`,
		default: title,
	},
	keywords,
	openGraph,
	...url && { metadataBase: new URL(url) },
};
