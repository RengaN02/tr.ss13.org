import type { Metadata } from 'next';

import { description, openGraph, title } from '@/app/metadata';
import ServerList from '@/app/ui/server-list';

export const metadata: Metadata = {
	title: `${title} – Türkçe SS13`,
	description,
	openGraph: {
		...openGraph,
		title: `${title} – Türkçe SS13`,
		description,
	},
};

export default function Home() {
	return <ServerList />;
}
