import { PageHeader } from '@/src/presentation/components/shared/PageHeader';
import { ProfileForm } from '@/src/presentation/features/profile/components/ProfileForm';

export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Mi perfil"
        description="Administra tu información personal y el logo de tu empresa"
      />
      <ProfileForm />
    </div>
  );
}
