'use client';

import { Button, Chip, Table, useOverlayState } from '@heroui/react';
import { Eye, FileText, Pencil, Plus, Search as SearchIcon, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import type { RemisionFormValues } from '@/src/core/application/dtos/remision.dto';
import type { Remision } from '@/src/core/domain/entities/Remision';
import { EmptyState } from '@/src/presentation/components/shared/EmptyState';
import { PageHeader } from '@/src/presentation/components/shared/PageHeader';
import { SearchInput } from '@/src/presentation/components/shared/SearchInput';
import { Spinner } from '@/src/presentation/components/shared/Spinner';
import { ConfirmDialog } from '@/src/presentation/components/ui/ConfirmDialog';
import { FormModal } from '@/src/presentation/components/ui/FormModal';
import { useClients } from '@/src/presentation/features/clients/hooks/useClients';
import { useDrivers } from '@/src/presentation/features/drivers/hooks/useDrivers';
import { formatCurrency, formatDate } from '@/src/presentation/lib/utils';
import { useCompanyStore } from '@/src/presentation/stores/company.store';
import {
  useCreateRemision,
  useDeleteRemision,
  useRemisiones,
  useUpdateRemision,
} from '../hooks/useRemisiones';
import { RemisionForm } from './RemisionForm';

function cleanPayload(values: RemisionFormValues) {
  return {
    type: values.type,
    companyId: values.companyId,
    clientId: values.clientId,
    driverId: values.driverId,
    items: values.items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: values.type === 'priced' ? item.unitPrice : undefined,
    })),
    ivaPercentage: values.type === 'priced' ? values.ivaPercentage : undefined,
    notes: values.notes || undefined,
  };
}

export function RemisionList() {
  const { selectedCompany } = useCompanyStore();
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const { data: remisiones, isLoading } = useRemisiones(selectedCompany?.id, appliedSearch || undefined);
  const { data: clients } = useClients(selectedCompany?.id);
  const { data: drivers } = useDrivers(selectedCompany?.id);

  const createMutation = useCreateRemision();
  const updateMutation = useUpdateRemision();
  const deleteMutation = useDeleteRemision();

  const formState = useOverlayState();
  const confirmState = useOverlayState();
  const [editingRemision, setEditingRemision] = useState<Remision | null>(null);
  const [deletingRemision, setDeletingRemision] = useState<Remision | null>(null);

  const openCreate = () => {
    setEditingRemision(null);
    formState.open();
  };

  const openEdit = (remision: Remision) => {
    setEditingRemision(remision);
    formState.open();
  };

  const openDelete = (remision: Remision) => {
    setDeletingRemision(remision);
    confirmState.open();
  };

  const handleSubmit = (values: RemisionFormValues) => {
    const payload = cleanPayload(values);
    if (editingRemision) {
      const { companyId: _companyId, type: _type, ...updatePayload } = payload;
      updateMutation.mutate(
        { id: editingRemision.id, payload: updatePayload },
        { onSuccess: () => formState.close() }
      );
    } else {
      createMutation.mutate(payload, { onSuccess: () => formState.close() });
    }
  };

  const handleDelete = () => {
    if (!deletingRemision) return;
    deleteMutation.mutate(deletingRemision.id, { onSuccess: () => confirmState.close() });
  };

  const handleSearchSubmit = () => setAppliedSearch(search.trim());
  const handleSearchClear = () => {
    setSearch('');
    setAppliedSearch('');
  };

  const clientsById = new Map((clients ?? []).map((c) => [c.id, c]));
  const driversById = new Map((drivers ?? []).map((d) => [d.id, d]));

  if (!selectedCompany) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Remisiones" description="Genera y administra tus remisiones" />
        <EmptyState
          icon={FileText}
          title="Selecciona una empresa"
          description="Elige una empresa activa en la parte superior para ver y crear sus remisiones."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Remisiones"
        description={`Remisiones de ${selectedCompany.name}`}
        action={
          <Button
            onPress={openCreate}
            className="bg-primary gap-2 transition-color duration-300 ease-in-out hover:bg-primary/70"
          >
            <Plus className="h-4 w-4" /> Nueva remisión
          </Button>
        }
      />

      <SearchInput
        value={search}
        onChange={setSearch}
        onSubmit={handleSearchSubmit}
        onClear={handleSearchClear}
        placeholder="Buscar remisiones..."
      />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <Table variant="primary" className="border border-primary rounded-lg">
          <Table.ScrollContainer>
            <Table.Content aria-label="Lista de remisiones" className="min-w-[750px] p-2">
              <Table.Header>
                <Table.Column className="text-end">#</Table.Column>
                <Table.Column isRowHeader>Cliente</Table.Column>
                <Table.Column>Conductor</Table.Column>
                <Table.Column>Tipo</Table.Column>
                <Table.Column>Items</Table.Column>
                <Table.Column>Fecha</Table.Column>
                <Table.Column className="text-end">Acciones</Table.Column>
              </Table.Header>
              <Table.Body
                renderEmptyState={() =>
                  appliedSearch ? (
                    <EmptyState
                      icon={SearchIcon}
                      title="Sin resultados"
                      description={`No se encontraron remisiones que coincidan con "${appliedSearch}".`}
                      action={
                        <Button onPress={handleSearchClear} variant="outline" className="mt-2 gap-2">
                          Limpiar busqueda
                        </Button>
                      }
                    />
                  ) : (
                    <EmptyState
                      icon={FileText}
                      title="No hay remisiones"
                      description="Crea tu primera remisión para esta empresa. Necesitas al menos un cliente y un conductor registrados."
                      action={
                        <Button onPress={openCreate} variant="outline" className="mt-2 gap-2">
                          <Plus className="h-4 w-4" /> Crear remisión
                        </Button>
                      }
                    />
                  )
                }
              >
                {(remisiones ?? []).map((remision) => {
                  const client = clientsById.get(remision.clientId);
                  const driver = driversById.get(remision.driverId);
                  const isPriced = remision.type === 'priced';

                  return (
                    <Table.Row key={remision.id} id={remision.id}>
                      <Table.Cell className="text-end text-muted">{remision.consecutive}</Table.Cell>
                      <Table.Cell className="font-medium">{client?.name ?? '—'}</Table.Cell>
                      <Table.Cell>{driver?.name ?? '—'}</Table.Cell>
                      <Table.Cell>
                        <Chip size="sm" variant="soft" color={isPriced ? 'accent' : 'default'}>
                          {isPriced ? 'Con precio + IVA' : 'Solo cantidad'}
                        </Chip>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-muted">{remision.items.length}</span>
                        {isPriced && typeof remision.total === 'number' && (
                          <span className="ml-1.5 font-medium">{formatCurrency(remision.total)}</span>
                        )}
                      </Table.Cell>
                      <Table.Cell>{formatDate(remision.createdAt)}</Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/dashboard/remisiones/${remision.id}`}>
                            <Button isIconOnly size="sm" variant="ghost" aria-label="Ver remisión">
                              <Eye className="size-4" />
                            </Button>
                          </Link>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="ghost"
                            aria-label="Editar remisión"
                            onPress={() => openEdit(remision)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="ghost"
                            aria-label="Eliminar remisión"
                            onPress={() => openDelete(remision)}
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
        state={formState}
        title={editingRemision ? `Editar remisión #${editingRemision.consecutive}` : 'Nueva remisión'}
        description={
          editingRemision ? 'Actualiza los datos de la remisión' : 'Completa los datos de la nueva remisión'
        }
      >
        <RemisionForm
          key={editingRemision?.id ?? 'new'}
          companyId={selectedCompany.id}
          defaultValues={
            editingRemision
              ? {
                  type: editingRemision.type,
                  companyId: editingRemision.companyId,
                  clientId: editingRemision.clientId,
                  driverId: editingRemision.driverId,
                  items: editingRemision.items,
                  ivaPercentage: editingRemision.ivaPercentage ?? 19,
                  notes: editingRemision.notes ?? '',
                }
              : { companyId: selectedCompany.id }
          }
          submitLabel={editingRemision ? 'Guardar cambios' : 'Crear remisión'}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          submitError={createMutation.error || updateMutation.error}
          onSubmit={handleSubmit}
        />
      </FormModal>

      <ConfirmDialog
        state={confirmState}
        title="Eliminar remisión"
        description={`¿Estás seguro de eliminar la remisión #${deletingRemision?.consecutive}? Esta acción no se puede deshacer.`}
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
