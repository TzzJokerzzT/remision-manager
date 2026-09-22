'use client';

import type { Key } from '@heroui/react';

import {
  Autocomplete,
  Button,
  Chip,
  DateField,
  DateRangePicker,
  Label,
  ListBox,
  Pagination,
  RangeCalendar,
  SearchField,
  Table,
  useFilter,
  useOverlayState,
} from '@heroui/react';
import { CalendarDate } from '@internationalized/date';
import { Eye, FileText, Pencil, Plus, Search as SearchIcon, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
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
    driverId: values.driverId || undefined,
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
  const [page, setPage] = useState(1);
  const limit = 10;

  // Filter state
  const [clientFilter, setClientFilter] = useState<Key | null>(null);
  const [driverFilter, setDriverFilter] = useState<Key | null>(null);
  const [typeFilter, setTypeFilter] = useState<Key | null>(null);
  const [dateRange, setDateRange] = useState<{ start: CalendarDate; end: CalendarDate } | null>(null);

  const appliedFilters = useMemo(
    () => ({
      clientName: clientFilter != null ? String(clientFilter) : undefined,
      driverName: driverFilter != null ? String(driverFilter) : undefined,
      type: typeFilter != null ? String(typeFilter) : undefined,
      from: dateRange?.start?.toString(),
      to: dateRange?.end?.toString(),
    }),
    [clientFilter, driverFilter, typeFilter, dateRange]
  );

  const { data: paginatedData, isLoading } = useRemisiones(
    selectedCompany?.id,
    appliedSearch || undefined,
    page,
    limit,
    appliedFilters
  );
  const remisiones = paginatedData?.items ?? [];
  const totalPages = paginatedData?.totalPages ?? 1;
  const total = paginatedData?.total ?? 0;

  const { data: clients } = useClients(selectedCompany?.id);
  const { data: drivers } = useDrivers(selectedCompany?.id);

  const clientsList = clients?.items ?? [];
  const driversList = drivers?.items ?? [];

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
    if (!deletingRemision?.id) return;
    deleteMutation.mutate(deletingRemision.id as string, { onSuccess: () => confirmState.close() });
  };

  const handleSearchSubmit = () => {
    setAppliedSearch(search.trim());
    setPage(1);
  };
  const handleSearchClear = () => {
    setSearch('');
    setAppliedSearch('');
    setPage(1);
  };
  const clearFilters = () => {
    setClientFilter(null);
    setDriverFilter(null);
    setTypeFilter(null);
    setDateRange(null);
    setPage(1);
  };
  const hasActiveFilters =
    clientFilter != null || driverFilter != null || typeFilter != null || dateRange != null;

  const typeOptions = [
    { id: 'priced', name: 'Con precio + IVA' },
    { id: 'quantity_only', name: 'Solo cantidad' },
  ];

  // Filter function for Autocomplete.Filter
  const { contains } = useFilter({ sensitivity: 'base' });

  const clientsById = new Map((clients?.items ?? []).map((c) => [c.id, c]));
  const driversById = new Map((drivers?.items ?? []).map((d) => [d.id, d]));

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

      {/* Autocomplete filters */}
      <div className="flex flex-wrap items-end gap-3">
        <Autocomplete
          selectionMode="single"
          value={clientFilter}
          onSelectionChange={(key) => {
            setClientFilter(key);
            setPage(1);
          }}
          className="w-full min-w-[200px] max-w-[280px]"
        >
          <Label>Filtrar por cliente</Label>
          <Autocomplete.Trigger>
            <Autocomplete.Value />
            <Autocomplete.ClearButton />
            <Autocomplete.Indicator />
          </Autocomplete.Trigger>
          <Autocomplete.Popover>
            <Autocomplete.Filter filter={contains}>
              <SearchField aria-label="Buscar cliente" name="clientSearch" variant="secondary">
                <SearchField.Group>
                  <SearchField.SearchIcon />
                  <SearchField.Input placeholder="Buscar cliente..." />
                  <SearchField.ClearButton />
                </SearchField.Group>
              </SearchField>
              <ListBox
                renderEmptyState={() => (
                  <p className="px-2 py-1 text-sm text-foreground/50">Sin resultados</p>
                )}
              >
                {clientsList.map((client) => (
                  <ListBox.Item key={client.id} id={client.name} textValue={client.name}>
                    {client.name}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox>
            </Autocomplete.Filter>
          </Autocomplete.Popover>
        </Autocomplete>

        <Autocomplete
          selectionMode="single"
          value={driverFilter}
          onSelectionChange={(key) => {
            setDriverFilter(key);
            setPage(1);
          }}
          className="w-full min-w-[200px] max-w-[280px]"
        >
          <Label>Filtrar por conductor</Label>
          <Autocomplete.Trigger>
            <Autocomplete.Value />
            <Autocomplete.ClearButton />
            <Autocomplete.Indicator />
          </Autocomplete.Trigger>
          <Autocomplete.Popover>
            <Autocomplete.Filter filter={contains}>
              <SearchField aria-label="Buscar conductor" name="driverSearch" variant="secondary">
                <SearchField.Group>
                  <SearchField.SearchIcon />
                  <SearchField.Input placeholder="Buscar conductor..." />
                  <SearchField.ClearButton />
                </SearchField.Group>
              </SearchField>
              <ListBox
                renderEmptyState={() => (
                  <p className="px-2 py-1 text-sm text-foreground/50">Sin resultados</p>
                )}
              >
                {driversList.map((driver) => (
                  <ListBox.Item key={driver.id} id={driver.name} textValue={driver.name}>
                    {driver.name}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox>
            </Autocomplete.Filter>
          </Autocomplete.Popover>
        </Autocomplete>

        <Autocomplete
          selectionMode="single"
          value={typeFilter}
          onSelectionChange={(key) => {
            setTypeFilter(key);
            setPage(1);
          }}
          className="w-full min-w-[200px] max-w-[280px]"
        >
          <Label>Filtrar por tipo</Label>
          <Autocomplete.Trigger>
            <Autocomplete.Value />
            <Autocomplete.ClearButton />
            <Autocomplete.Indicator />
          </Autocomplete.Trigger>
          <Autocomplete.Popover>
            <Autocomplete.Filter filter={contains}>
              <SearchField aria-label="Buscar tipo" name="typeSearch" variant="secondary">
                <SearchField.Group>
                  <SearchField.SearchIcon />
                  <SearchField.Input placeholder="Buscar tipo..." />
                  <SearchField.ClearButton />
                </SearchField.Group>
              </SearchField>
              <ListBox
                renderEmptyState={() => (
                  <p className="px-2 py-1 text-sm text-foreground/50">Sin resultados</p>
                )}
              >
                {typeOptions.map((opt) => (
                  <ListBox.Item key={opt.id} id={opt.id} textValue={opt.name}>
                    {opt.name}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox>
            </Autocomplete.Filter>
          </Autocomplete.Popover>
        </Autocomplete>

        <DateRangePicker
          value={dateRange}
          onChange={(range) => {
            setDateRange(range);
            setPage(1);
          }}
          className="w-full min-w-[260px] max-w-[340px]"
        >
          <Label>Filtrar por fechas</Label>
          <DateField.Group>
            <DateField.InputContainer>
              <DateField.Input slot="start">
                {(segment) => <DateField.Segment segment={segment} />}
              </DateField.Input>
              <DateRangePicker.RangeSeparator />
              <DateField.Input slot="end">
                {(segment) => <DateField.Segment segment={segment} />}
              </DateField.Input>
            </DateField.InputContainer>
            <DateField.Suffix>
              <DateRangePicker.Trigger>
                <DateRangePicker.TriggerIndicator />
              </DateRangePicker.Trigger>
            </DateField.Suffix>
          </DateField.Group>
          <DateRangePicker.Popover>
            <RangeCalendar aria-label="Seleccionar rango de fechas">
              <RangeCalendar.Header>
                <RangeCalendar.NavButton slot="previous" />
                <RangeCalendar.Heading />
                <RangeCalendar.NavButton slot="next" />
              </RangeCalendar.Header>
              <RangeCalendar.Grid>
                <RangeCalendar.GridHeader>
                  {(day) => <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>}
                </RangeCalendar.GridHeader>
                <RangeCalendar.GridBody>
                  {(date) => <RangeCalendar.Cell date={date} />}
                </RangeCalendar.GridBody>
              </RangeCalendar.Grid>
            </RangeCalendar>
          </DateRangePicker.Popover>
        </DateRangePicker>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onPress={clearFilters} className="gap-1">
            <X className="size-3.5" /> Limpiar filtros
          </Button>
        )}
      </div>

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
                  appliedSearch || hasActiveFilters ? (
                    <EmptyState
                      icon={SearchIcon}
                      title="Sin resultados"
                      description={`No se encontraron remisiones con los filtros aplicados.`}
                      action={
                        <Button
                          onPress={() => {
                            handleSearchClear();
                            clearFilters();
                          }}
                          variant="outline"
                          className="mt-2 gap-2"
                        >
                          Limpiar filtros
                        </Button>
                      }
                    />
                  ) : (
                    <EmptyState
                      icon={FileText}
                      title="No hay remisiones"
                      description="Crea tu primera remisión para esta empresa. Necesitas al menos un cliente y un conductor registrados."
                      action={
                        <Button
                          onPress={openCreate}
                          variant="outline"
                          className="text-background mt-2 gap-2 bg-primary transition-color duration-300 ease-in-out hover:bg-primary/70"
                        >
                          <Plus className="h-4 w-4" /> Crear remisión
                        </Button>
                      }
                    />
                  )
                }
              >
                {(remisiones ?? []).map((remision) => {
                  const client = remision.clientId ? clientsById.get(remision.clientId) : undefined;
                  const driver = remision.driverId ? driversById.get(remision.driverId) : undefined;
                  const isPriced = remision.type === 'priced' || false;

                  return (
                    <Table.Row key={remision.id} id={remision.id}>
                      <Table.Cell className="text-end text-muted">{remision.consecutive || '—'}</Table.Cell>
                      <Table.Cell className="font-medium">{client?.name || '—'}</Table.Cell>
                      <Table.Cell>{driver?.name || '—'}</Table.Cell>
                      <Table.Cell>
                        <Chip size="sm" variant="soft" color={isPriced ? 'accent' : 'default'}>
                          {isPriced ? 'Con precio + IVA' : 'Solo cantidad'}
                        </Chip>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-muted">{remision.items?.length || 0}</span>
                        {isPriced && remision.total !== undefined && (
                          <span className="ml-1.5 font-medium">{formatCurrency(remision.total)}</span>
                        )}
                      </Table.Cell>
                      <Table.Cell>{formatDate(remision.createdAt || '')}</Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/dashboard/remisiones/${remision.id || ''}`}>
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

      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-2">
          <Pagination className="justify-center" size="sm">
            <Pagination.Content>
              <Pagination.Item>
                <Pagination.Previous isDisabled={page === 1} onPress={() => setPage((p) => p - 1)}>
                  <Pagination.PreviousIcon />
                </Pagination.Previous>
              </Pagination.Item>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Pagination.Item key={p}>
                  <Pagination.Link isActive={p === page} onPress={() => setPage(p)}>
                    {p}
                  </Pagination.Link>
                </Pagination.Item>
              ))}
              <Pagination.Item>
                <Pagination.Next isDisabled={page === totalPages} onPress={() => setPage((p) => p + 1)}>
                  <Pagination.NextIcon />
                </Pagination.Next>
              </Pagination.Item>
            </Pagination.Content>
          </Pagination>
          <span className="text-xs text-foreground/50">
            Página {page} de {totalPages} — {total} remisión{total !== 1 ? 'es' : ''}
          </span>
        </div>
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
