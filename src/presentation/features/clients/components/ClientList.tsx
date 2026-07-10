'use client';

import { Button, Table, useOverlayState } from '@heroui/react';
import { Pencil, Plus, Search as SearchIcon, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import type { ClientFormValues } from '@/src/core/application/dtos/client.dto';
import type { Client } from '@/src/core/domain/entities/Client';
import { EmptyState } from '@/src/presentation/components/shared/EmptyState';
import { PageHeader } from '@/src/presentation/components/shared/PageHeader';
import { SearchInput } from '@/src/presentation/components/shared/SearchInput';
import { Spinner } from '@/src/presentation/components/shared/Spinner';
import { ConfirmDialog } from '@/src/presentation/components/ui/ConfirmDialog';
import { FormModal } from '@/src/presentation/components/ui/FormModal';
import { useCompanyStore } from '@/src/presentation/stores/company.store';
import { useClients, useCreateClient, useDeleteClient, useUpdateClient } from '../hooks/useClients';
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
          <Button
            onPress={openCreate}
            className="bg-primary gap-2 transition-color duration-300 ease-in-out hover:bg-primary/70"
          >
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
      ) : (
        <Table variant="primary" className="border border-primary rounded-lg">
          <Table.ScrollContainer>
            <Table.Content aria-label="Lista de clientes" className="min-w-[600px] p-2">
              <Table.Header>
                <Table.Column isRowHeader>Nombre</Table.Column>
                <Table.Column>Documento</Table.Column>
                <Table.Column>Teléfono</Table.Column>
                <Table.Column>Email</Table.Column>
                <Table.Column className="text-end">Acciones</Table.Column>
              </Table.Header>
              <Table.Body
                renderEmptyState={() =>
                  appliedSearch ? (
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
                        <Button
                          onPress={openCreate}
                          variant="outline"
                          className="text-background mt-2 gap-2 bg-primary transition-color duration-300 ease-in-out hover:bg-primary/70"
                        >
                          <Plus className="h-4 w-4" /> Crear cliente
                        </Button>
                      }
                    />
                  )
                }
              >
                {(clients ?? []).map((client) => (
                  <Table.Row key={client.id} id={client.id}>
                    <Table.Cell className="font-medium">{client.name}</Table.Cell>
                    <Table.Cell>{client.documentId}</Table.Cell>
                    <Table.Cell>{client.phone ?? '—'}</Table.Cell>
                    <Table.Cell>{client.email ?? '—'}</Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="ghost"
                          aria-label="Editar cliente"
                          onPress={() => openEdit(client)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="ghost"
                          aria-label="Eliminar cliente"
                          onPress={() => openDelete(client)}
                        >
                          <Trash2 className="size-4 text-danger" />
                        </Button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
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
