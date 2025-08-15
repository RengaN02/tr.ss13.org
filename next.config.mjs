/** @type {import('next').NextConfig} */

const nextConfig = {
	experimental: {
		ppr: 'incremental',
	},
	output: 'standalone',
	images: {
		domains: ['cdn.ss13.tr'],
	},
};

export default nextConfig;
