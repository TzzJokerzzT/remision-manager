'use client';

import { Button, Chip, Table, useOverlayState } from '@heroui/react';
import { Pencil, Plus, Search as SearchIcon, Trash2, Truck } from 'lucide-react';
import { useState } from 'react';
import type { DriverFormValues } from '@/src/core/application/dtos/driver.dto';
import type { Driver } from '@/src/core/domain/entities/Driver';
import { EmptyState } from '@/src/presentation/components/shared/EmptyState';
import { PageHeader } from '@/src/presentation/components/shared/PageHeader';
import { SearchInput } from '@/src/presentation/components/shared/SearchInput';
import { Spinner } from '@/src/presentation/components/shared/Spinner';
import { ConfirmDialog } from '@/src/presentation/components/ui/ConfirmDialog';
import { FormModal } from '@/src/presentation/components/ui/FormModal';
import { useCompanyStore } from '@/src/presentation/stores/company.store';
import { useCreateDriver, useDeleteDriver, useDrivers, useUpdateDriver } from '../hooks/useDrivers';
import { DriverForm } from './DriverForm';

function cleanPayload(values: DriverFormValues) {
  return {
    name: values.name,
    documentId: values.documentId,
    companyId: values.companyId,
    licenseNumber: values.licenseNumber || undefined,
    phone: values.phone || undefined,
    vehiclePlate: values.vehiclePlate || undefined,
  };
}

export function DriverList() {
  const { selectedCompany } = useCompanyStore();
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const { data: drivers, isLoading } = useDrivers(selectedCompany?.id, appliedSearch || undefined);
  const createMutation = useCreateDriver();
  const updateMutation = useUpdateDriver();
  const deleteMutation = useDeleteDriver();

  const formState = useOverlayState();
  const confirmState = useOverlayState();
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [deletingDriver, setDeletingDriver] = useState<Driver | null>(null);

  const openCreate = () => {
    setEditingDriver(null);
    formState.open();
  };

  const openEdit = (driver: Driver) => {
    setEditingDriver(driver);
    formState.open();
  };

  const openDelete = (driver: Driver) => {
    setDeletingDriver(driver);
    confirmState.open();
  };

  const handleSubmit = (values: DriverFormValues) => {
    const payload = cleanPayload(values);
    if (editingDriver) {
      const { companyId: _companyId, ...updatePayload } = payload;
      updateMutation.mutate(
        { id: editingDriver.id, payload: updatePayload },
        { onSuccess: () => formState.close() }
      );
    } else {
      createMutation.mutate(payload, { onSuccess: () => formState.close() });
    }
  };

  const handleDelete = () => {
    if (!deletingDriver) return;
    deleteMutation.mutate(deletingDriver.id, { onSuccess: () => confirmState.close() });
  };

  const handleSearchSubmit = () => setAppliedSearch(search.trim());
  const handleSearchClear = () => {
    setSearch('');
    setAppliedSearch('');
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Conductores"
        description={
          selectedCompany
            ? `Conductores de ${selectedCompany.name}`
            : 'Selecciona una empresa en la parte superior para filtrar, o mira todos tus conductores'
        }
        action={
          <Button
            onPress={openCreate}
            className="bg-primary gap-2 transition-color duration-300 ease-in-out hover:bg-primary/70"
          >
            <Plus className="h-4 w-4" /> Nuevo conductor
          </Button>
        }
      />

      <SearchInput
        value={search}
        onChange={setSearch}
        onSubmit={handleSearchSubmit}
        onClear={handleSearchClear}
        placeholder="Buscar conductores..."
      />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <Table variant="primary" className="border border-primary rounded-lg">
          <Table.ScrollContainer>
            <Table.Content aria-label="Lista de conductores" className="min-w-[750px] p-2">
              <Table.Header>
                <Table.Column isRowHeader>Nombre</Table.Column>
                <Table.Column>Documento</Table.Column>
                <Table.Column>Placa</Table.Column>
                <Table.Column>Licencia</Table.Column>
                <Table.Column>Teléfono</Table.Column>
                <Table.Column className="text-end">Acciones</Table.Column>
              </Table.Header>
              <Table.Body
                renderEmptyState={() =>
                  appliedSearch ? (
                    <EmptyState
                      icon={SearchIcon}
                      title="Sin resultados"
                      description={`No se encontraron conductores que coincidan con "${appliedSearch}".`}
                      action={
                        <Button onPress={handleSearchClear} variant="outline" className="mt-2 gap-2">
                          Limpiar busqueda
                        </Button>
                      }
                    />
                  ) : (
                    <EmptyState
                      icon={Truck}
                      title="No hay conductores"
                      description="Crea tu primer conductor para asociarlo a tus remisiones."
                      action={
                        <Button
                          onPress={openCreate}
                          variant="outline"
                          className="text-background mt-2 bg-primary transition-color duration-300 ease-in-out hover:bg-primary/70"
                        >
                          <Plus className="h-4 w-4" /> Crear conductor
                        </Button>
                      }
                    />
                  )
                }
              >
                {(drivers ?? []).map((driver) => (
                  <Table.Row key={driver.id} id={driver.id}>
                    <Table.Cell className="font-medium">{driver.name}</Table.Cell>
                    <Table.Cell>{driver.documentId}</Table.Cell>
                    <Table.Cell>
                      {driver.vehiclePlate ? (
                        <Chip size="sm" variant="soft">
                          {driver.vehiclePlate}
                        </Chip>
                      ) : (
                        '—'
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      {driver.licenseNumber ? (
                        <Chip size="sm" variant="soft">
                          Lic. {driver.licenseNumber}
                        </Chip>
                      ) : (
                        '—'
                      )}
                    </Table.Cell>
                    <Table.Cell>{driver.phone ?? '—'}</Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="ghost"
                          aria-label="Editar conductor"
                          onPress={() => openEdit(driver)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="ghost"
                          aria-label="Eliminar conductor"
                          onPress={() => openDelete(driver)}
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
        title={editingDriver ? 'Editar conductor' : 'Nuevo conductor'}
        description={
          editingDriver ? 'Actualiza los datos del conductor' : 'Completa los datos del nuevo conductor'
        }
      >
        <DriverForm
          defaultValues={
            editingDriver
              ? {
                  name: editingDriver.name,
                  documentId: editingDriver.documentId,
                  companyId: editingDriver.companyId,
                  licenseNumber: editingDriver.licenseNumber ?? '',
                  phone: editingDriver.phone ?? '',
                  vehiclePlate: editingDriver.vehiclePlate ?? '',
                }
              : { companyId: selectedCompany?.id ?? '' }
          }
          lockCompany={!!editingDriver}
          submitLabel={editingDriver ? 'Guardar cambios' : 'Crear conductor'}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          submitError={createMutation.error || updateMutation.error}
          onSubmit={handleSubmit}
        />
      </FormModal>

      <ConfirmDialog
        state={confirmState}
        title="Eliminar conductor"
        description={`¿Estás seguro de eliminar a "${deletingDriver?.name}"? Esta acción no se puede deshacer.`}
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
