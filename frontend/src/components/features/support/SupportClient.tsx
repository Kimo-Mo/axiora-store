'use client';

import { useState } from 'react';
import { SupportContactInfo } from '@/components/features/support/SupportContactInfo';
import { SupportForm } from '@/components/features/support/SupportForm';
import { SupportSuccess } from '@/components/features/support/SupportSuccess';

export function SupportClient() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return <SupportSuccess onReset={() => setSubmitted(false)} />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
      <SupportContactInfo />
      <SupportForm onSuccess={() => setSubmitted(true)} />
    </div>
  );
}
