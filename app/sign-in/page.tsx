import { Suspense } from 'react';

import SignIn from '@/app/ui/sign-in';

export default function Page() {
  return (
    <Suspense fallback={<div className="text-center p-20 text-white">Yükleniyor...</div>}>
      <SignIn />
    </Suspense>
  );
}
