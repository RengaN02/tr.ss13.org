/** @type {import('next').NextConfig} */

const nextConfig = {
	experimental: {
		ppr: 'incremental',
	},
	output: 'standalone',
	htmlLimitedBots: /.*/,
};

export default nextConfig;
