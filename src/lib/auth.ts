import { NextAuthOptions } from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';

import headers from '@/src/lib/headers';

const serverEndpoint = process.env.API_URL + '/v2/server';
const ckeyEndpoint = process.env.API_URL + '/v2/player/discord?discord_id=';

export const authOptions: NextAuthOptions = {
	pages: {
    signIn: '/login',
		error: '/login',
		signOut: '/login'
  },
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn() {
      try {
        const response = await fetch(serverEndpoint, { headers });
				if(response.ok) return true;
				return `/error?message=${response.statusText}&status=${response.status}`;
      } catch {
        console.error('Internal Server Error');
        return '/error';
      }
    },
		async jwt({ token, profile, trigger, session }) {
			if (trigger === 'update' && session?.user?.ckey) {
				token.ckey = session.user.ckey;
				return token;
			}

			if (profile) {
				try {
					const response = await fetch(ckeyEndpoint + profile.id, { headers });
					if (response.status === 200) {
						const ckey = await response.json();
						token.ckey = ckey;
					} else if (response.status !== 500) {
						token.ckey = null;
					} else {
						token.ckey = undefined;
					}
				} catch {
					token.ckey = undefined;
					console.error('Internal Server Error');
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
