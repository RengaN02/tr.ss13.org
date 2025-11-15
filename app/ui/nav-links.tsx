'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import logo from '@/app/images/logo.png';
import Button from '@/app/ui/button';

const navigation = [
	{ href: '/', label: 'Anasayfa' },
	{ href: '/players', label: 'Oyuncular', sub: true },
	{ href: '/statistics', label: 'İstatistikler', sub: true },
	{ href: '/rounds', label: 'Roundlar', sub: true },
	{ href: '/discord', label: 'Discord', external: true, blank: true },
	{ href: '/patreon', label: 'Patreon', external: true, blank: true },
	{ href: '/wiki', label: 'Wiki', external: true },
	{ href: 'https://trcm.ss13.tr', label: 'TRCM', external: true, blank: true },
];

export default function NavLinks() {
	const pathname = usePathname();

	return (
		<div className="flex flex-col items-center px-6 pt-6 text-white">
			<div className="flex flex-col items-center">
				<Image src={logo} alt="Psychonaut Station logo" quality={100} priority />
				<span className="text-center text-5xl font-mono">Psychonaut Station</span>
			</div>
			<div id="navigation" className="flex flex-wrap items-center justify-center gap-4 py-6 mt-[1px] max-w-lg">
				{navigation.map(({ href, label, external, blank, sub }) => (
					<Link key={href} href={href} prefetch={!external} {...(blank && { target: '_blank', rel: 'noreferrer external' })}>
						<Button active={sub ? pathname.startsWith(href) : pathname === href}>
							{label}
						</Button>
					</Link>
				))}
			</div>
		</div>
	);
}
