import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppSelect } from './AppSelect';

class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];

  readonly root = null;
  readonly rootMargin = '';
  readonly thresholds: number[] = [];
  readonly targets: Element[] = [];

  constructor(private readonly callback: IntersectionObserverCallback) {
    FakeIntersectionObserver.instances.push(this);
  }

  observe(target: Element) {
    this.targets.push(target);
  }

  unobserve() {}

  disconnect() {}

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  trigger(entries: Array<Partial<IntersectionObserverEntry>>) {
    this.callback(entries as IntersectionObserverEntry[], this as unknown as IntersectionObserver);
  }
}

const originalIntersectionObserver = globalThis.IntersectionObserver;

function renderSelect(onLoadMore = jest.fn()) {
  render(
    <AppSelect
      label="Cliente"
      options={[{ id: 'client-1', label: 'Cliente A' }]}
      selectedKey={null}
      onSelectionChange={() => {}}
      onLoadMore={onLoadMore}
      hasMore
    />
  );
  return { onLoadMore };
}

describe('AppSelect', () => {
  beforeEach(() => {
    FakeIntersectionObserver.instances = [];
    globalThis.IntersectionObserver = FakeIntersectionObserver as unknown as typeof IntersectionObserver;
  });

  afterEach(() => {
    globalThis.IntersectionObserver = originalIntersectionObserver;
  });

  /**
   * El popover de react-aria no monta su contenido hasta abrirlo (`Popover` devuelve null
   * mientras está cerrado), así que el centinela no existe cuando el componente se monta.
   * Si el observer se engancha solo en ese primer render, nunca se crea y la carga
   * incremental jamás ocurre: el select queda limitado a la primera página de clientes.
   */
  it('carga más opciones cuando el centinela se vuelve visible al abrir el popover', async () => {
    const { onLoadMore } = renderSelect();

    expect(FakeIntersectionObserver.instances).toHaveLength(0);

    await userEvent.click(screen.getByRole('button'));

    expect(FakeIntersectionObserver.instances).toHaveLength(1);
    const [observer] = FakeIntersectionObserver.instances;
    expect(observer.targets[0]).toBe(screen.getByTestId('app-select-load-more'));

    act(() => observer.trigger([{ isIntersecting: true }]));

    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });
});
