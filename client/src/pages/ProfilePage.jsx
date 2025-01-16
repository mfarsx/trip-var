import React from 'react';

import { Section, ProfileForm } from '../components';
import { useAuth } from '../hooks/useAuth';

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Section
        title="Profile Settings"
        subtitle="Manage your account settings and preferences"
        centered
      >
        <div className="mt-10">
          <ProfileForm user={user} />
        </div>
      </Section>
    </div>
  );
};

export default ProfilePage;
