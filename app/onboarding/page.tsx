import React from 'react';
import { redirect } from 'next/navigation';
import { requireAuth } from '@/app/actions';
import OnboardingWizard from '@/components/OnboardingWizard';

export const metadata = {
  title: 'Onboarding & Workspace Setup — VyaparFlow',
  description: 'Set up your MSME exporter profile, product classifications, and target export corridors.',
};

export default async function OnboardingPage() {
  const { user, role } = await requireAuth();

  if (role === 'PROVIDER') {
    redirect('/provider');
  }

  if (role === 'ADMIN') {
    redirect('/admin');
  }

  const existingBusiness = user.businesses?.[0] || null;

  return (
    <OnboardingWizard
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }}
      initialBusiness={existingBusiness}
    />
  );
}
