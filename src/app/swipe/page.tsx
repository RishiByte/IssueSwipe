import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import SwipeFeed from '@/components/SwipeFeed';
import DashboardLayout from '@/components/DashboardLayout';

export default async function SwipePage() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/');
  }

  if (!user.onboardingCompleted) {
    redirect('/onboarding');
  }

  return (
    <DashboardLayout>
      <div className="flex-grow flex flex-col justify-center items-center py-6 px-4 md:px-8 relative">
        <SwipeFeed />
      </div>
    </DashboardLayout>
  );
}

