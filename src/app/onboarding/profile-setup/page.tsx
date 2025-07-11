import { Suspense } from 'react';
import ProfileSetupPageContent from './ProfileSetupPageContent';

export default function ProfileSetupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfileSetupPageContent />
    </Suspense>
  );
} 