'use client';

import { Button, useOverlayState } from '@heroui/react';
import { Building2, Plus } from 'lucide-react';
import { useState } from 'react';
import type { CompanyFormValues } from '@/src/core/application/dtos/company.dto';
import type { Company } from '@/src/core/domain/entities/Company';
import { AnimatedList } from '@/src/presentation/components/shared/AnimatedList';
import { EmptyState } from '@/src/presentation/components/shared/EmptyState';
import { PageHeader } from '@/src/presentation/components/shared/PageHeader';
import { Spinner } from '@/src/presentation/components/shared/Spinner';
import { ConfirmDialog } from '@/src/presentation/components/ui/ConfirmDialog';
import { FormModal } from '@/src/presentation/components/ui/FormModal';
import { useCompanies, useCreateCompany, useDeleteCompany, useUpdateCompany } from '../hooks/useCompanies';
import { CompanyCard } from './CompanyCard';
import { CompanyForm } from './CompanyForm';

export function CompanyManager() {
  const { data: companies, isLoading } = useCompanies();
  const createMutation = useCreateCompany();
  const updateMutation = useUpdateCompany();
  const deleteMutation = useDeleteCompany();

  const formModal = useOverlayState();
  const confirmModal = useOverlayState();
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);

  const openCreate = () => {
    setEditingCompany(null);
    formModal.open();
  };

  const openEdit = (company: Company) => {
    setEditingCompany(company);
    formModal.open();
  };

  const openDelete = (company: Company) => {
    setCompanyToDelete(company);
    confirmModal.open();
  };

  const handleSubmit = (values: CompanyFormValues) => {
    const payload = {
      ...values,
      address: values.address || undefined,
      phone: values.phone || undefined,
      email: values.email || undefined,
      logoUrl: values.logoUrl || undefined,
    };

    if (editingCompany) {
      updateMutation.mutate({ id: editingCompany.id, payload }, { onSuccess: () => formModal.close() });
    } else {
      createMutation.mutate(payload, { onSuccess: () => formModal.close() });
    }
  };

  const handleDelete = () => {
    if (!companyToDelete) return;
    deleteMutation.mutate(companyToDelete.id, { onSuccess: () => confirmModal.close() });
  };

  const activeMutation = editingCompany ? updateMutation : createMutation;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Empresas"
        description="Gestiona las empresas registradas y selecciona la activa"
        action={
          <Button onPress={openCreate}>
            <Plus className="mr-1.5 h-4 w-4" /> Nueva empresa
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : companies && companies.length > 0 ? (
        <AnimatedList className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              onEdit={() => openEdit(company)}
              onDelete={() => openDelete(company)}
            />
          ))}
        </AnimatedList>
      ) : (
        <EmptyState
          icon={Building2}
          title="Aún no tienes empresas"
          description="Crea tu primera empresa para empezar a generar remisiones."
          action={
            <Button onPress={openCreate} className="mt-2">
              <Plus className="mr-1.5 h-4 w-4" /> Crear empresa
            </Button>
          }
        />
      )}

      <FormModal
        state={formModal}
        title={editingCompany ? 'Editar empresa' : 'Nueva empresa'}
        description={
          editingCompany ? 'Actualiza los datos de la empresa' : 'Completa los datos para crear una empresa'
        }
      >
        <CompanyForm
          key={editingCompany?.id ?? 'new'}
          defaultValues={
            editingCompany
              ? {
                  name: editingCompany.name,
                  nit: editingCompany.nit,
                  address: editingCompany.address ?? '',
                  phone: editingCompany.phone ?? '',
                  email: editingCompany.email ?? '',
                  logoUrl: editingCompany.logoUrl ?? '',
                }
              : undefined
          }
          isSubmitting={activeMutation.isPending}
          submitError={activeMutation.isError ? activeMutation.error : undefined}
          submitLabel={editingCompany ? 'Guardar cambios' : 'Crear empresa'}
          onSubmit={handleSubmit}
        />
      </FormModal>

      <ConfirmDialog
        state={confirmModal}
        title="Eliminar empresa"
        description={`¿Seguro que deseas eliminar "${companyToDelete?.name}"? Esta acción no se puede deshacer.`}
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
