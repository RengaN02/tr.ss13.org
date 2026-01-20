import { Suspense } from 'react';

import VerifyMenu from '@/app/ui/verify';

export default function Page() {
  return (
    <Suspense fallback={<div>Yükleniyor...</div>}>
      <VerifyMenu />
    </Suspense>
  );
}
