'use client';

import { faDiscord } from '@fortawesome/free-brands-svg-icons';
import { faArrowRight, faSignOutAlt, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useState } from 'react';

import Button from '@/app/ui/button';

export default function SignIn() {
  const { data: session, status } = useSession();

  const searchParams = useSearchParams();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const callbackUrl = searchParams.get('callbackUrl');
  const error = searchParams.get('error');

  const handleLogin = async () => {
    setIsLoading(true);
    await signIn('discord', { callbackUrl: callbackUrl || '/sign-in' });
  };

  const handleLogout = async () => {
    setIsLoading(true);
    await signOut({ callbackUrl: '/sign-in' });
  };

  if (status === 'loading') {
		return <div className="p-20 text-center opacity-50">Yükleniyor...</div>;
	}

  return (
    <div className="flex flex-col items-center justify-center p-12 backdrop-blur-md border border-white border-opacity-10 rounded-md">
      <div className="w-full max-w-[350px] flex flex-col gap-4 text-center">
        {status === 'authenticated' ? (
          <>
            <div>
              <span className="text-xl font-bold text-white">Oturum Açık</span>
              <p className="text-sm text-gray-400 mt-1">
                <span className="text-white font-medium">{session.user?.name}</span> olarak giriş yaptınız.
              </p>
            </div>
						<Button onClick={() => router.push(callbackUrl || '/me')}>
							<div className="flex items-center justify-center gap-2">
								<span>Devam Et</span>
								<Icon icon={faArrowRight}/>
							</div>
						</Button>
						<Button onClick={handleLogout}>
							<div className="flex items-center justify-center gap-2 text-red-400">
								<span>Çıkış Yap</span>
								<Icon icon={faSignOutAlt} />
							</div>
						</Button>
          </>
        ) : (
          <>
            <div>
              <span className="text-2xl font-bold text-white">Giriş Yap</span>
              <p className="text-sm text-gray-400 mt-1">Kendi verilerinizi görmek için giriş yapınız.</p>
            </div>
            {!!error && (
              <div className="text-sm text-red-300 bg-red-500/10 p-3 rounded border border-red-500/20">
                Bir hata oluştu. Lütfen daha sonra tekrar deneyiniz. Hatanın devam etmesi durumunda yetkililere başvurunuz.
              </div>
            )}
						<Button onClick={handleLogin} disabled={isLoading}>
							{isLoading ? (
								<span><Icon icon={faSpinner} className="animate-spin" /> Bağlanıyor...</span>
							) : (
								<span><Icon icon={faDiscord} size="lg" /> Discord ile Bağlan</span>
							)}
						</Button>
          </>
        )}
      </div>
    </div>
  );
}
