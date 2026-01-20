'use client';

import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { useRouter, useSearchParams, } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ChangeEvent, KeyboardEvent, useEffect,useRef, useState } from 'react';
import useSWRImmutable from 'swr/immutable';

import { verifyUser } from '@/app/lib/actions';
import fetcher from '@/app/lib/fetcher';
import Button from '@/app/ui/button';
import { NumberInput } from '@/app/ui/input';

export default function VerifyMenu() {
	const { data: session, update } = useSession();
	const user_id = session?.user?.id || null;
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));

	const router = useRouter();
	const searchParams = useSearchParams();
	const callbackUrl = searchParams.get('callbackUrl') || '/me';

	const { data: ckey } = useSWRImmutable<string>('/api/player/ckey', fetcher);

	useEffect(() => {
    if (!ckey) return;
    if (session?.user?.ckey === ckey) {
       router.push(callbackUrl);
       return;
    }
    setIsLoading(true);
    update({
      ...session,
      user: {
        ...session?.user,
        ckey: ckey
      }
    }).then(() => {
      router.push(callbackUrl);
    });

  }, [ckey, callbackUrl, session, router, update]);

  const r1 = useRef<HTMLInputElement>(null);
  const r2 = useRef<HTMLInputElement>(null);
  const r3 = useRef<HTMLInputElement>(null);
  const r4 = useRef<HTMLInputElement>(null);
  const r5 = useRef<HTMLInputElement>(null);
  const r6 = useRef<HTMLInputElement>(null);

  const inputRefs = [r1, r2, r3, r4, r5, r6];

  const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (value !== '' && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    const lastChar = value.slice(-1);
    newOtp[index] = lastChar;
    setOtp(newOtp);

    if (lastChar !== '' && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();

    const pastedData = e.clipboardData.getData('text');
    const cleanData = pastedData.replace(/\D/g, '').slice(0, 6);

    if (cleanData.length > 0) {
      const newOtp = [...otp];
      cleanData.split('').forEach((char: any, idx: number) => {
        if (idx < 6) newOtp[idx] = char;
      });
      setOtp(newOtp);

      const focusIndex = cleanData.length < 6 ? cleanData.length : 5;
      inputRefs[focusIndex].current?.focus();
    }
  };

	const handleSubmit = async () => {
		if(!user_id) return;
    const rawCode = otp.join('');
    if (rawCode.length !== 6) return;

		const formattedCode = `${rawCode.slice(0, 3)}-${rawCode.slice(3)}`;
		setIsLoading(true);
		setError(null);
    const result = await verifyUser(formattedCode, user_id);
		if(result.success) {
			setIsLoading(false);
			update({
				...session,
				user: {
					...session?.user,
					ckey: result.ckey
				}
			}).then(() => {
				router.push(callbackUrl);
			});
		} else {
			setIsLoading(false);
			setError(result.message);
		}
  };

	if(ckey) {
		return (
		<div className="flex flex-col items-center justify-center text-white gap-8 p-8">
			<div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Hesap Doğrulama</h2>
        <p className="text-gray-400 text-sm">Yönlendiriliyorsunuz..!</p>
      </div>
		</div>
		);
	}

  return (
    <div className="flex flex-col items-center justify-center text-white gap-8 p-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Hesap Doğrulama</h2>
        <p className="text-gray-400 text-sm">Lütfen oyuna girmeye çalışınca karşınıza çıkan 6 haneli kodu girin</p>
				{!!error && <p className="text-red-500 text-sm">{error}</p>}
      </div>

      <div className="flex items-center gap-2" onPaste={handlePaste}>
        {otp.map((digit, index) => (
          <div key={index} className="flex items-center gap-2">
						<Button>
            <NumberInput
              ref={inputRefs[index]}
              value={digit}
              onChange={(e) => handleChange(e as ChangeEvent<HTMLInputElement>, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-8 h-12 text-2xl font-bold rounded-lg"
              min={0}
              max={9}
            />
						</Button>
            {index === 2 && <span className="text-2xl text-zinc-600 font-bold">-</span>}
          </div>
        ))}
      </div>

			<Button className='rounded-lg'>
				<button
					onClick={handleSubmit}
					disabled={otp.some(v => v === '') || isLoading}
				>
					{isLoading ? <Icon icon={faSpinner} size='3x' spin /> : 'Kodu Onayla'}
				</button>
			</Button>
    </div>
  );
}
