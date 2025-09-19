/** @type {import('next-sitemap').IConfig} */

const config = {
	siteUrl: process.env.PRODUCTION_URL || 'https://ss13.tr',
	generateRobotsTxt: true,
	output: 'standalone',
	changefreq: 'hourly',
	exclude: ['/api/*'],
	robotsTxtOptions: {
		policies: [
			{
				userAgent: '*',
				allow: '/',
				disallow: ['/api'],
			},
		],
	}
};

export default config;
