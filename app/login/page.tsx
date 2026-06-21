import { AuthLayout } from '@/src/presentation/components/layout/AuthLayout';
import { LoginForm } from '@/src/presentation/features/auth/components/LoginForm';

export default function LoginPage() {
  return (
    <AuthLayout title="Bienvenido de nuevo" subtitle="Ingresa a tu cuenta para administrar tus remisiones">
      <LoginForm />
    </AuthLayout>
  );
}
