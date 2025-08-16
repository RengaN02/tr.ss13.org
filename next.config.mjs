/** @type {import('next').NextConfig} */

const nextConfig = {
	experimental: {
		ppr: 'incremental',
	},
	output: 'standalone',
};

export default nextConfig;
