import '@/app/styles/globals.css';

import localFont from 'next/font/local';
import Image from 'next/image';

import background from '@/app/images/background.png';
import Footer from '@/app/ui/footer';
import NavLinks from '@/app/ui/nav-links';
import { Suspense } from 'react';

const geistSans = localFont({
	src: './fonts/GeistVF.woff',
	variable: '--font-geist-sans',
});
const geistMono = localFont({
	src: './fonts/GeistMonoVF.woff',
	variable: '--font-geist-mono',
});

export { metadata } from '@/app/metadata';

type RootLayoutProps = { children: React.ReactNode };

export default function RootLayout({ children }: RootLayoutProps) {
	return (
		<html lang="tr">
			<body className={`${geistSans.variable} ${geistMono.variable} font-sans text-white`}>
				<div className="w-screen h-screen overflow-y-auto scrollbar-hidden">
					<div className="w-screen h-screen flex flex-col overflow-x-hidden scrollbar-thumb-gray scrollbar-track-transparent">
						<Suspense>
							<NavLinks />
						</Suspense>
						<div className="flex-1 flex flex-col items-center px-6 pb-6">{children}</div>
					</div>
					<div className="w-screen h-screen fixed top-0 left-0 -z-50 pointer-events-none">
						<Image className="w-full h-full object-cover object-left-top" src={background} alt="Website background" quality={100} priority />
					</div>
					<Footer />
				</div>
			</body>
		</html>
	);
}
