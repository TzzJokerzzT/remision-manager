import { AuthLayout } from '@/src/presentation/components/layout/AuthLayout';
import { RegisterForm } from '@/src/presentation/features/auth/components/RegisterForm';

export default function RegisterPage() {
  return (
    <AuthLayout title="Crea tu cuenta" subtitle="Empieza a generar remisiones en minutos">
      <RegisterForm />
    </AuthLayout>
  );
}
