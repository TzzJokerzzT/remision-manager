'use client';

import { Button, useOverlayState } from '@heroui/react';
import { Plus, Search as SearchIcon, Users } from 'lucide-react';
import { useState } from 'react';
import type { ClientFormValues } from '@/src/core/application/dtos/client.dto';
import type { Client } from '@/src/core/domain/entities/Client';
import { AnimatedList } from '@/src/presentation/components/shared/AnimatedList';
import { EmptyState } from '@/src/presentation/components/shared/EmptyState';
import { PageHeader } from '@/src/presentation/components/shared/PageHeader';
import { SearchInput } from '@/src/presentation/components/shared/SearchInput';
import { Spinner } from '@/src/presentation/components/shared/Spinner';
import { ConfirmDialog } from '@/src/presentation/components/ui/ConfirmDialog';
import { FormModal } from '@/src/presentation/components/ui/FormModal';
import { useCompanyStore } from '@/src/presentation/stores/company.store';
import { useClients, useCreateClient, useDeleteClient, useUpdateClient } from '../hooks/useClients';
import { ClientCard } from './ClientCard';
import { ClientForm } from './ClientForm';

function cleanPayload(values: ClientFormValues) {
  return {
    name: values.name,
    documentId: values.documentId,
    companyId: values.companyId,
    address: values.address || undefined,
    phone: values.phone || undefined,
    email: values.email || undefined,
  };
}

export function ClientList() {
  const { selectedCompany } = useCompanyStore();
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const { data: clients, isLoading } = useClients(selectedCompany?.id, appliedSearch || undefined);
  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient();
  const deleteMutation = useDeleteClient();

  const formState = useOverlayState();
  const confirmState = useOverlayState();
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);

  const openCreate = () => {
    setEditingClient(null);
    formState.open();
  };

  const openEdit = (client: Client) => {
    setEditingClient(client);
    formState.open();
  };

  const openDelete = (client: Client) => {
    setDeletingClient(client);
    confirmState.open();
  };

  const handleSubmit = (values: ClientFormValues) => {
    const payload = cleanPayload(values);
    if (editingClient) {
      const { companyId: _companyId, ...updatePayload } = payload;
      updateMutation.mutate(
        { id: editingClient.id, payload: updatePayload },
        { onSuccess: () => formState.close() }
      );
    } else {
      createMutation.mutate(payload, { onSuccess: () => formState.close() });
    }
  };

  const handleDelete = () => {
    if (!deletingClient) return;
    deleteMutation.mutate(deletingClient.id, { onSuccess: () => confirmState.close() });
  };

  const handleSearchSubmit = () => setAppliedSearch(search.trim());
  const handleSearchClear = () => {
    setSearch('');
    setAppliedSearch('');
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Clientes"
        description={
          selectedCompany
            ? `Clientes de ${selectedCompany.name}`
            : 'Selecciona una empresa en la parte superior para filtrar, o mira todos tus clientes'
        }
        action={
          <Button onPress={openCreate} className="gap-2">
            <Plus className="h-4 w-4" /> Nuevo cliente
          </Button>
        }
      />

      <SearchInput
        value={search}
        onChange={setSearch}
        onSubmit={handleSearchSubmit}
        onClear={handleSearchClear}
        placeholder="Buscar clientes..."
      />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : clients && clients.length > 0 ? (
        <AnimatedList className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onEdit={() => openEdit(client)}
              onDelete={() => openDelete(client)}
            />
          ))}
        </AnimatedList>
      ) : appliedSearch ? (
        <EmptyState
          icon={SearchIcon}
          title="Sin resultados"
          description={`No se encontraron clientes que coincidan con "${appliedSearch}".`}
          action={
            <Button onPress={handleSearchClear} variant="outline" className="mt-2 gap-2">
              Limpiar busqueda
            </Button>
          }
        />
      ) : (
        <EmptyState
          icon={Users}
          title="No hay clientes"
          description="Crea tu primer cliente para asociarlo a tus remisiones."
          action={
            <Button onPress={openCreate} variant="outline" className="mt-2 gap-2">
              <Plus className="h-4 w-4" /> Crear cliente
            </Button>
          }
        />
      )}

      <FormModal
        state={formState}
        title={editingClient ? 'Editar cliente' : 'Nuevo cliente'}
        description={
          editingClient ? 'Actualiza los datos del cliente' : 'Completa los datos del nuevo cliente'
        }
      >
        <ClientForm
          defaultValues={
            editingClient
              ? {
                  name: editingClient.name,
                  documentId: editingClient.documentId,
                  companyId: editingClient.companyId,
                  address: editingClient.address ?? '',
                  phone: editingClient.phone ?? '',
                  email: editingClient.email ?? '',
                }
              : { companyId: selectedCompany?.id ?? '' }
          }
          lockCompany={!!editingClient}
          submitLabel={editingClient ? 'Guardar cambios' : 'Crear cliente'}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          submitError={createMutation.error || updateMutation.error}
          onSubmit={handleSubmit}
        />
      </FormModal>

      <ConfirmDialog
        state={confirmState}
        title="Eliminar cliente"
        description={`¿Estás seguro de eliminar a "${deletingClient?.name}"? Esta acción no se puede deshacer.`}
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
