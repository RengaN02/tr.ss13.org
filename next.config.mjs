/** @type {import('next').NextConfig} */
const { hostname } = new URL(process.env.CDN_URL);

const nextConfig = {
	experimental: {
		ppr: 'incremental',
	},
	output: 'standalone',
	images: {
		domains: [hostname],
	},
};

export default nextConfig;
