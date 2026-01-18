import NextAuth, { NextAuthOptions } from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';

import headers from '@/app/lib/headers';

const ckeyEndpoint = process.env.API_URL + '/v2/player/discord?discord_id=';

export const authOptions: NextAuthOptions = {
	providers: [
		DiscordProvider({
			clientId: process.env.DISCORD_CLIENT_ID!,
			clientSecret: process.env.DISCORD_CLIENT_SECRET!,
		}),
	],
	callbacks: {
		async jwt({ token, profile, trigger, session }) {
			if (trigger === 'update' && session?.user?.ckey) {
				token.ckey = session.user.ckey;
			} else if (profile) {
				const response = await fetch(ckeyEndpoint + profile.id, { headers });
				if (response.ok && response.status !== 404) {
					const ckey = await response.json();
					token.ckey = ckey;
				}
			}
			return token;
		},
		async session({ session, token }) {
			if (session?.user) {
				session.user.ckey = token.ckey;
				session.user.id = token.sub;
			}
			return session;
		},
	},
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
