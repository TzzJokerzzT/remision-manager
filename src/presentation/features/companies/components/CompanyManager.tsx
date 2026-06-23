'use client';

import { Avatar, Button, Chip, Table, useOverlayState } from '@heroui/react';
import { Building2, Pencil, Plus, Search as SearchIcon, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { CompanyFormValues } from '@/src/core/application/dtos/company.dto';
import type { Company } from '@/src/core/domain/entities/Company';
import { EmptyState } from '@/src/presentation/components/shared/EmptyState';
import { PageHeader } from '@/src/presentation/components/shared/PageHeader';
import { SearchInput } from '@/src/presentation/components/shared/SearchInput';
import { Spinner } from '@/src/presentation/components/shared/Spinner';
import { ConfirmDialog } from '@/src/presentation/components/ui/ConfirmDialog';
import { FormModal } from '@/src/presentation/components/ui/FormModal';
import { useCompanyStore } from '@/src/presentation/stores/company.store';
import { useCompanies, useCreateCompany, useDeleteCompany, useUpdateCompany } from '../hooks/useCompanies';
import { CompanyForm } from './CompanyForm';

export function CompanyManager() {
  const { selectedCompany, setSelectedCompany } = useCompanyStore();
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const { data: companies, isLoading } = useCompanies(appliedSearch || undefined);
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

  const handleSearchSubmit = () => setAppliedSearch(search.trim());
  const handleSearchClear = () => {
    setSearch('');
    setAppliedSearch('');
  };

  const activeMutation = editingCompany ? updateMutation : createMutation;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Empresas"
        description="Gestiona las empresas registradas y selecciona la activa"
        action={
          <Button
            onPress={openCreate}
            className="bg-primary gap-2 transition-color duration-300 ease-in-out hover:bg-primary/70"
          >
            <Plus className="mr-1.5 h-4 w-4" /> Nueva empresa
          </Button>
        }
      />

      <SearchInput
        value={search}
        onChange={setSearch}
        onSubmit={handleSearchSubmit}
        onClear={handleSearchClear}
        placeholder="Buscar empresas..."
      />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <Table variant="primary" className="border border-primary rounded-lg">
          <Table.ScrollContainer>
            <Table.Content aria-label="Lista de empresas" className="min-w-[750px] p-2">
              <Table.Header>
                <Table.Column>Logo</Table.Column>
                <Table.Column isRowHeader>Nombre</Table.Column>
                <Table.Column>NIT</Table.Column>
                <Table.Column>Teléfono</Table.Column>
                <Table.Column>Email</Table.Column>
                <Table.Column>Estado</Table.Column>
                <Table.Column className="text-end">Acciones</Table.Column>
              </Table.Header>
              <Table.Body
                renderEmptyState={() =>
                  appliedSearch ? (
                    <EmptyState
                      icon={SearchIcon}
                      title="Sin resultados"
                      description={`No se encontraron empresas que coincidan con "${appliedSearch}".`}
                      action={
                        <Button onPress={handleSearchClear} variant="outline" className="mt-2">
                          Limpiar busqueda
                        </Button>
                      }
                    />
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
                  )
                }
              >
                {(companies ?? []).map((company) => {
                  const isSelected = selectedCompany?.id === company.id;

                  return (
                    <Table.Row key={company.id} id={company.id}>
                      <Table.Cell>
                        <Avatar size="sm">
                          <Avatar.Image src={company.logoUrl ?? undefined} alt={company.name} />
                          <Avatar.Fallback>
                            <Building2 className="size-4" />
                          </Avatar.Fallback>
                        </Avatar>
                      </Table.Cell>
                      <Table.Cell className="font-medium">{company.name}</Table.Cell>
                      <Table.Cell>{company.nit}</Table.Cell>
                      <Table.Cell>{company.phone ?? '—'}</Table.Cell>
                      <Table.Cell>{company.email ?? '—'}</Table.Cell>
                      <Table.Cell>
                        {isSelected ? (
                          <Chip size="sm" color="success" variant="soft">
                            Activa
                          </Chip>
                        ) : (
                          '—'
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant={isSelected ? 'primary' : 'outline'}
                            onPress={() => setSelectedCompany(isSelected ? null : company)}
                          >
                            {isSelected ? 'Deseleccionar' : 'Seleccionar'}
                          </Button>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="ghost"
                            aria-label="Editar empresa"
                            onPress={() => openEdit(company)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="ghost"
                            aria-label="Eliminar empresa"
                            onPress={() => openDelete(company)}
                          >
                            <Trash2 className="size-4 text-danger" />
                          </Button>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
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
