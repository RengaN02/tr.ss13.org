'use client';

import { signIn, signOut, useSession } from 'next-auth/react';

import Button from '@/app/ui/button';
import DropdownMenu from '@/app/ui/dropdown';

const menuItems = [
  { label: 'Hesabım', href: '/me' },
	{ label: 'Arkadaşlar', href: '/me/friends' },
	{ label: 'Geçmiş Roundlar', href: '/me/rounds' },
	{ label: 'Banlar', href: '/me/bans' },
	{ label: 'Ticketler', href: '/me/tickets' },
	{ label: 'Admin Mesajları', href: '/me/admin-remarks' },
	{ label: 'Çıkış Yap', func: async () => await signOut(), class: 'text-red-500 w-full'}
];

export default function SignInButton() {
	const { data: session, status } = useSession();

	if (status === 'loading') {
    return;
  }

	if(session && session.user) {
		return <DropdownMenu items={menuItems}><Button>{session.user.name}</Button></DropdownMenu>;
	}

	return <button onClick={() => signIn('discord')}><Button>Giriş Yap</Button></button>;
}
