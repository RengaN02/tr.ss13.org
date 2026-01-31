'use client';

import { faDiscord } from '@fortawesome/free-brands-svg-icons';
import { faArrowRight, faSignOutAlt,faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { useRouter,useSearchParams } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';
import { Suspense,useState } from 'react';

import Button from '@/app/ui/button';

export default function Page() {
  return (
    <Suspense fallback={<div className="text-center p-20 text-white">Yükleniyor...</div>}>
      <SignIn />
    </Suspense>
  );
}

function SignIn() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Callback URL ve Döngü Koruması
  let callbackUrl = searchParams.get('callbackUrl') || '/me';
  if (callbackUrl.includes('/sign-in')) callbackUrl = '/me';

  const error = searchParams.get('error');

  const handleLogin = async () => {
    setIsLoading(true);
    await signIn('discord', { callbackUrl });
  };

  const handleLogout = async () => {
    setIsLoading(true);
    await signOut({ callbackUrl: '/sign-in' });
  };

  if (status === 'loading') return <div className="p-20 text-center opacity-50">Yükleniyor...</div>;

  return (
    <div className="flex flex-col items-center justify-center p-12 bg-opacity-50 bg-black transition-colors border border-white border-opacity-10 rounded-[.25rem]">
      <div className="w-full max-w-[350px] flex flex-col gap-6 text-center">
        {status === 'authenticated' ? (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2">
            <div>
              <h2 className="text-xl font-bold text-white">Oturum Açık</h2>
              <p className="text-sm text-gray-400 mt-1">
                <span className="text-white font-medium">{session.user?.name}</span> olarak giriş yaptınız.
              </p>
            </div>

            <button onClick={() => router.push(callbackUrl)} className="w-full group">
              <Button>
                <div className="flex items-center justify-center gap-2">
                    <span>Devam Et</span>
                    <Icon icon={faArrowRight}/>
                </div>
              </Button>
            </button>

            <button onClick={handleLogout} className="w-full opacity-80 hover:opacity-100 transition-opacity">
              <Button>
                <div className="flex items-center justify-center gap-2 text-red-200">
                    <Icon icon={faSignOutAlt} />
                    <span>Çıkış Yap</span>
                </div>
              </Button>
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-5 animate-in fade-in zoom-in-95">
            <div>
              <h1 className="text-2xl font-bold text-white">Giriş Yap</h1>
              <p className="text-sm text-gray-400 mt-2">
                Kendi verilerinizi görmek için lütfen giriş yapınız.
              </p>
            </div>

            {error && (
              <div className="text-sm text-red-300 bg-red-500/10 p-3 rounded border border-red-500/20">
                Bir hata oluştu. Lütfen bir süre sonra tekrar deneyiniz. Hatanın devam etmesi durumunda maintainerlere başvurunuz.
              </div>
            )}

            <button
                onClick={handleLogin}
                disabled={isLoading}
                className={`w-full ${isLoading ? 'cursor-not-allowed' : ''}`}
            >
              <Button>
                 {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                        <Icon icon={faSpinner} className="animate-spin" />
                        <span>Bağlanıyor...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                        <Icon icon={faDiscord} size="lg" />
                        <span>Discord ile Bağlan</span>
                    </div>
                  )}
              </Button>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
