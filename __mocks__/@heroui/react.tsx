/**
 * Doble de prueba de `@heroui/react`.
 *
 * POR QUÉ EXISTE
 * `@heroui/react` es ESM-only: su `exports["."]` declara solo `import` y `types`, sin
 * `require`. El resolver de Jest trabaja con condiciones de CommonJS, y `next/jest`
 * concatena sus propios patrones de `node_modules` (con soporte de pnpm) de modo que
 * ninguna excepción posterior puede excluir la ruta real del paquete. El resultado es
 * "Must use import to load ES Module".
 *
 * QUÉ IMPLICA (y qué NO cubre)
 * Estos dobles renderizan HTML semántico real (button, table, input) y reenvían las props
 * que importan, así que los tests de componentes afirman la LÓGICA DE LA APP —totales,
 * payloads, redirecciones, cookies— de forma determinista y sin depender de react-aria.
 *
 * Lo que este doble NO puede validar es la API propia de HeroUI: si un componente se
 * cablea mal contra la librería (por ejemplo un `onChange` que entrega otra cosa), este
 * archivo no lo detecta porque su comportamiento es el que definimos acá. De eso siguen
 * respondiendo `bun run typecheck` y `bun run build` sobre la librería real, y una prueba
 * de navegador para lo verdaderamente visual.
 */
import { createContext, Fragment, type ReactNode, useContext, useState } from 'react';

type AnyProps = Record<string, unknown>;

/** Reenvía solo las props de HTML que el doble debe exponer. */
function buttonProps({ onPress, isDisabled, isIconOnly, ...rest }: AnyProps) {
  return {
    ...rest,
    type: (rest.type as string) ?? 'button',
    disabled: isDisabled === true,
    'data-icon-only': isIconOnly === true ? '' : undefined,
    onClick: onPress as ((event: unknown) => void) | undefined,
  };
}

export function Button({ children, ...props }: { children?: ReactNode } & AnyProps) {
  return <button {...(buttonProps(props) as Record<string, unknown>)}>{children}</button>;
}

export function Switch({
  children,
  isSelected,
  onChange,
  isDisabled,
  ...rest
}: {
  children?: ReactNode;
  isSelected?: boolean;
  onChange?: (isSelected: boolean) => void;
  isDisabled?: boolean;
} & AnyProps) {
  return (
    <div data-selected={isSelected === true ? '' : undefined} {...rest}>
      <input
        type="checkbox"
        role="switch"
        aria-checked={isSelected === true}
        checked={isSelected === true}
        disabled={isDisabled === true}
        onChange={(event) => onChange?.(event.target.checked)}
      />
      {children}
    </div>
  );
}

Switch.Content = ({ children }: { children?: ReactNode }) => <>{children}</>;
Switch.Control = ({ children }: { children?: ReactNode }) => <>{children}</>;
Switch.Thumb = () => <span data-thumb="" />;

export function Chip({ children, ...rest }: { children?: ReactNode } & AnyProps) {
  return <span {...rest}>{children}</span>;
}

export function Avatar({ children, ...rest }: { children?: ReactNode } & AnyProps) {
  return <div {...rest}>{children}</div>;
}

Avatar.Image = ({ src, alt }: { src?: string; alt?: string }) =>
  // biome-ignore lint/performance/noImgElement: doble de prueba, no requiere la optimización de next/image.
  src ? <img src={src} alt={alt ?? ''} /> : null;

Avatar.Fallback = ({ children }: { children?: ReactNode }) => <>{children}</>;

export function Input({ id, ...rest }: AnyProps) {
  return <input id={id as string} {...(rest as Record<string, unknown>)} />;
}

export function Label({ children, ...rest }: { children?: ReactNode } & AnyProps) {
  // biome-ignore lint/a11y/noLabelWithoutControl: reenvía `htmlFor` desde las props; el control lo aporta FormField.
  return <label {...rest}>{children}</label>;
}

interface SelectStubContext {
  selectedKey?: string | null;
  onSelectionChange?: (key: string) => void;
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
  items: Array<{ id: string; label: string }>;
}

const SelectStub = createContext<SelectStubContext | null>(null);

/**
 * Select interactivo: el disparador es un botón real y las opciones se eligen con clic,
 * que es lo que necesitan los tests para cambiar el tipo de remisión o el documento.
 */
export function Select({
  children,
  selectedKey,
  onSelectionChange,
  isDisabled,
  items,
  ...rest
}: {
  children?: ReactNode;
  selectedKey?: string | null;
  onSelectionChange?: (key: string) => void;
  isDisabled?: boolean;
  items?: Iterable<{ id: string; label: string }>;
} & AnyProps) {
  const [isOpen, setOpen] = useState(false);
  const options = Array.from(items ?? []);

  return (
    <SelectStub.Provider
      value={{
        selectedKey,
        onSelectionChange,
        isOpen,
        setOpen: isDisabled ? () => {} : setOpen,
        items: options,
      }}
    >
      <div data-selected-key={selectedKey ?? undefined} {...rest}>
        {children}
      </div>
    </SelectStub.Provider>
  );
}

Select.Root = Select;
Select.Trigger = ({ children }: { children?: ReactNode }) => {
  const ctx = useContext(SelectStub);
  return (
    <button type="button" onClick={() => ctx?.setOpen(!ctx.isOpen)}>
      {children}
    </button>
  );
};
/** Muestra la etiqueta de la opción elegida, como el Select real (no la clave cruda). */
Select.Value = () => {
  const ctx = useContext(SelectStub);
  const option = ctx?.items.find((item) => item.id === ctx.selectedKey);
  return <span>{option?.label ?? ''}</span>;
};
Select.Indicator = ({ children }: { children?: ReactNode }) => <>{children}</>;
Select.Popover = ({ children }: { children?: ReactNode }) => {
  const ctx = useContext(SelectStub);
  return ctx?.isOpen ? <div>{children}</div> : null;
};

/** Acepta `items` + render prop (lo que usa `AppSelect`) o hijos JSX. */
export function ListBoxRoot({
  children,
  items,
  ...rest
}: {
  children?: ReactNode | ((item: unknown) => ReactNode);
  items?: Iterable<unknown>;
} & AnyProps) {
  const rendered =
    typeof children === 'function'
      ? Array.from(items ?? []).map((item, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: los ítems de prueba no tienen id propio
          <Fragment key={index}>{(children as (item: unknown) => ReactNode)(item)}</Fragment>
        ))
      : children;
  return <ul {...rest}>{rendered}</ul>;
}

export function ListBoxItemRoot({
  children,
  id,
  ...rest
}: { children?: ReactNode; id?: string | number } & AnyProps) {
  const ctx = useContext(SelectStub);
  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: opción de un doble de prueba; se elige con clic.
    <li
      {...rest}
      onClick={() => {
        if (id !== undefined) ctx?.onSelectionChange?.(String(id));
        ctx?.setOpen(false);
      }}
    >
      {children}
    </li>
  );
}

// --- Filtros del listado: stubs no interactivos; solo deben renderizar sin explotar. ---

export function Autocomplete({ children, ...rest }: { children?: ReactNode } & AnyProps) {
  return <div {...(rest as Record<string, unknown>)}>{children}</div>;
}
Autocomplete.Trigger = ({ children }: { children?: ReactNode }) => <div>{children}</div>;
Autocomplete.Value = () => <span />;
Autocomplete.ClearButton = () => <button type="button" aria-label="Limpiar" />;
Autocomplete.Indicator = () => <span />;
Autocomplete.Popover = () => null;
Autocomplete.Filter = ({ children, filter: _filter }: { children?: ReactNode; filter?: unknown }) => (
  <div>{children}</div>
);

export function SearchField({
  children,
  variant: _variant,
  ...rest
}: { children?: ReactNode; variant?: string } & AnyProps) {
  return <div {...(rest as Record<string, unknown>)}>{children}</div>;
}
SearchField.Group = ({ children }: { children?: ReactNode }) => <div>{children}</div>;
SearchField.SearchIcon = () => <span />;
SearchField.Input = (props: AnyProps) => <input {...(props as Record<string, unknown>)} />;
SearchField.ClearButton = () => <button type="button" aria-label="Limpiar" />;

export function ListBox({
  children,
  renderEmptyState: _renderEmptyState,
  ...rest
}: { children?: ReactNode; renderEmptyState?: () => ReactNode } & AnyProps) {
  return <div {...(rest as Record<string, unknown>)}>{children}</div>;
}
ListBox.Item = ({ children, ...rest }: { children?: ReactNode } & AnyProps) => (
  <div {...(rest as Record<string, unknown>)}>{children}</div>
);
ListBox.ItemIndicator = () => <span />;

export function DateField({ children, ...rest }: { children?: ReactNode } & AnyProps) {
  return <div {...(rest as Record<string, unknown>)}>{children}</div>;
}
DateField.Group = ({ children }: { children?: ReactNode }) => <div>{children}</div>;
DateField.InputContainer = ({ children }: { children?: ReactNode }) => <div>{children}</div>;
DateField.Input = ({
  children,
  ...rest
}: { children?: ReactNode | ((segment: unknown) => ReactNode) } & AnyProps) => (
  <span {...(rest as Record<string, unknown>)}>
    {typeof children === 'function' ? (children as (segment: unknown) => ReactNode)(undefined) : children}
  </span>
);
DateField.Segment = ({ segment: _segment }: { segment?: unknown }) => <span />;
DateField.Suffix = ({ children }: { children?: ReactNode }) => <span>{children}</span>;

export function DateRangePicker({ children, ...rest }: { children?: ReactNode } & AnyProps) {
  return <div {...(rest as Record<string, unknown>)}>{children}</div>;
}
DateRangePicker.RangeSeparator = () => <span />;
DateRangePicker.Trigger = ({ children }: { children?: ReactNode }) => (
  <button type="button">{children}</button>
);
DateRangePicker.TriggerIndicator = () => <span />;
DateRangePicker.Popover = () => null;

export function RangeCalendar({ children, ...rest }: { children?: ReactNode } & AnyProps) {
  return <div {...(rest as Record<string, unknown>)}>{children}</div>;
}
RangeCalendar.Header = ({ children }: { children?: ReactNode }) => <div>{children}</div>;
RangeCalendar.NavButton = ({ children, slot: _slot }: { children?: ReactNode; slot?: string }) => (
  <button type="button">{children}</button>
);
RangeCalendar.Heading = () => <span />;
RangeCalendar.Grid = ({ children }: { children?: ReactNode }) => <div>{children}</div>;
RangeCalendar.GridHeader = ({ children }: { children?: ReactNode | ((day: unknown) => ReactNode) }) => (
  <div>
    {typeof children === 'function' ? (children as (day: unknown) => ReactNode)(undefined) : children}
  </div>
);
RangeCalendar.HeaderCell = ({ children }: { children?: ReactNode }) => <span>{children}</span>;
RangeCalendar.GridBody = ({ children }: { children?: ReactNode | ((date: unknown) => ReactNode) }) => (
  <div>
    {typeof children === 'function' ? (children as (date: unknown) => ReactNode)(undefined) : children}
  </div>
);
RangeCalendar.Cell = ({ date: _date }: { date?: unknown }) => <span />;

/** Mismo contrato que el hook real de filtrado; `contains` siempre acepta. */
export function useFilter(_options?: unknown): { contains: () => boolean } {
  return { contains: () => true };
}

// --- Tabla: contenedor + tabla real para poder consultarla por rol. ---

export function Table({
  children,
  variant: _variant,
  ...rest
}: { children?: ReactNode; variant?: string } & AnyProps) {
  return <div {...(rest as Record<string, unknown>)}>{children}</div>;
}

Table.ScrollContainer = ({ children }: { children?: ReactNode }) => <div>{children}</div>;
Table.Content = ({ children, ...rest }: { children?: ReactNode } & AnyProps) => (
  <table {...(rest as Record<string, unknown>)}>{children}</table>
);
Table.Header = ({ children }: { children?: ReactNode }) => <thead>{children}</thead>;
Table.Column = ({
  children,
  isRowHeader: _isRowHeader,
  ...rest
}: { children?: ReactNode; isRowHeader?: boolean } & AnyProps) => (
  <th {...(rest as Record<string, unknown>)}>{children}</th>
);
Table.Body = ({
  children,
  items,
  renderEmptyState,
  ...rest
}: {
  children?: ReactNode | ((item: unknown, index: number) => ReactNode);
  items?: Iterable<unknown>;
  renderEmptyState?: () => ReactNode;
} & AnyProps) => {
  const list = items ? Array.from(items) : null;
  const isEmpty = list !== null && list.length === 0;
  let content: ReactNode;
  if (typeof children === 'function') {
    content = list
      ? list.map((item, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: los ítems de prueba no tienen id propio.
          <Fragment key={index}>
            {(children as (item: unknown, index: number) => ReactNode)(item, index)}
          </Fragment>
        ))
      : (children as () => ReactNode)();
  } else {
    content = children;
  }
  return (
    <tbody {...(rest as Record<string, unknown>)}>
      {isEmpty && renderEmptyState ? renderEmptyState() : content}
    </tbody>
  );
};
Table.Row = ({ children, ...rest }: { children?: ReactNode } & AnyProps) => (
  <tr {...(rest as Record<string, unknown>)}>{children}</tr>
);
Table.Cell = ({ children, ...rest }: { children?: ReactNode } & AnyProps) => (
  <td {...(rest as Record<string, unknown>)}>{children}</td>
);

export function Pagination({
  children,
  size: _size,
  ...rest
}: { children?: ReactNode; size?: string } & AnyProps) {
  return (
    <nav aria-label="Paginación" {...(rest as Record<string, unknown>)}>
      {children}
    </nav>
  );
}
Pagination.Content = ({ children }: { children?: ReactNode }) => <div>{children}</div>;
Pagination.Item = ({ children }: { children?: ReactNode }) => <div>{children}</div>;
Pagination.Previous = ({
  children,
  isDisabled,
  onPress,
}: {
  children?: ReactNode;
  isDisabled?: boolean;
  onPress?: () => void;
}) => (
  <button type="button" aria-label="Página anterior" disabled={isDisabled === true} onClick={onPress}>
    {children}
  </button>
);
Pagination.PreviousIcon = () => <span />;
Pagination.Link = ({
  children,
  isActive,
  onPress,
}: {
  children?: ReactNode;
  isActive?: boolean;
  onPress?: () => void;
}) => (
  <button type="button" data-active={isActive === true ? '' : undefined} onClick={onPress}>
    {children}
  </button>
);
Pagination.Next = ({
  children,
  isDisabled,
  onPress,
}: {
  children?: ReactNode;
  isDisabled?: boolean;
  onPress?: () => void;
}) => (
  <button type="button" aria-label="Página siguiente" disabled={isDisabled === true} onClick={onPress}>
    {children}
  </button>
);
Pagination.NextIcon = () => <span />;

// --- FormModal / ConfirmDialog: compuestos que renderizan su contenido solo cuando están abiertos. ---

export function Modal({ children }: { children?: ReactNode }) {
  return <div role="dialog">{children}</div>;
}

Modal.Root = ({
  children,
  isOpen,
}: {
  children?: ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}) => (isOpen ? <div role="dialog">{children}</div> : null);
Modal.Backdrop = ({ children }: { children?: ReactNode }) => <>{children}</>;
Modal.Container = ({
  children,
  size: _size,
  ...rest
}: { children?: ReactNode; size?: string } & AnyProps) => (
  <div {...(rest as Record<string, unknown>)}>{children}</div>
);
Modal.Dialog = ({ children }: { children?: ReactNode }) => <div>{children}</div>;
Modal.Header = ({ children }: { children?: ReactNode }) => <div>{children}</div>;
Modal.Heading = ({ children, ...rest }: { children?: ReactNode } & AnyProps) => (
  <div {...(rest as Record<string, unknown>)}>{children}</div>
);
Modal.CloseTrigger = ({ children, ...rest }: { children?: ReactNode } & AnyProps) => (
  <button type="button" {...(rest as Record<string, unknown>)}>
    {children}
  </button>
);
Modal.Body = ({ children, ...rest }: { children?: ReactNode } & AnyProps) => (
  <div {...(rest as Record<string, unknown>)}>{children}</div>
);

export function AlertDialog({ children }: { children?: ReactNode }) {
  return <div role="alertdialog">{children}</div>;
}

AlertDialog.Root = ({
  children,
  isOpen,
}: {
  children?: ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}) => (isOpen ? <div role="alertdialog">{children}</div> : null);
AlertDialog.Backdrop = ({ children }: { children?: ReactNode }) => <>{children}</>;
AlertDialog.Container = ({ children }: { children?: ReactNode }) => <div>{children}</div>;
AlertDialog.Dialog = ({ children }: { children?: ReactNode }) => <div>{children}</div>;
AlertDialog.Icon = ({ children, status: _status }: { children?: ReactNode; status?: string }) => (
  <span>{children}</span>
);
AlertDialog.Header = ({ children }: { children?: ReactNode }) => <div>{children}</div>;
AlertDialog.Heading = ({ children }: { children?: ReactNode }) => <div>{children}</div>;
AlertDialog.Body = ({ children }: { children?: ReactNode }) => <div>{children}</div>;
AlertDialog.Footer = ({ children }: { children?: ReactNode }) => <div>{children}</div>;

// --- Toasts: ningún suite los renderiza; alcanza con que existan. ---

export class ToastQueue {
  add(): void {}
  close(): void {}
}

export function Toast({ children }: { children?: ReactNode }) {
  return <div>{children}</div>;
}

export function ToastContent({ children }: { children?: ReactNode }) {
  return <div>{children}</div>;
}

export function ToastTitle({ children }: { children?: ReactNode }) {
  return <div>{children}</div>;
}

export function ToastDescription({ children }: { children?: ReactNode }) {
  return <div>{children}</div>;
}

export function ToastIndicator() {
  return <span />;
}

/** Mismo contrato que el hook real: estado de apertura con open/close. */
export function useOverlayState(initial = false) {
  const [isOpen, setIsOpen] = useState(initial);
  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((value) => !value),
    setOpen: setIsOpen,
  };
}

export type Key = string | number;
export type ToastContentValue = { title?: ReactNode; description?: ReactNode; variant?: string };
export type UseOverlayStateReturn = ReturnType<typeof useOverlayState>;
