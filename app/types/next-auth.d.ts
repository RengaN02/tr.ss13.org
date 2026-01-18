import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
			ckey: string | null;
    } & DefaultSession['user'];
  }

  interface Profile {
    id: string;
		access_token: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
		id: string;
		sub: string;
    ckey: string | null;
  }
}
