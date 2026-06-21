import { RemisionDetail } from '@/src/presentation/features/remisiones/pdf/RemisionDetail';

interface RemisionDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function RemisionDetailPage({ params }: RemisionDetailPageProps) {
  const { id } = await params;
  return <RemisionDetail remisionId={id} />;
}
